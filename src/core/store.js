// Game state, scoring, and persistence. The one place rules live.
import { CHECKPOINTS, CHECKPOINT_BY_ID, ZONES } from '../data/manifest.js';
import { SEV_BY_ID } from '../data/taxonomy.js';

const KEY = 'hous-inspection:v1';

export const RANKS = [
  { xp: 0,    title: 'Trainee' },
  { xp: 250,  title: 'Ride-Along Apprentice' },
  { xp: 700,  title: 'Field Trainee' },
  { xp: 1400, title: 'Associate Inspector' },
  { xp: 2500, title: 'Licensed Inspector' },
  { xp: 4000, title: 'Senior Inspector' },
  { xp: 6000, title: 'Master Inspector' },
];

// Points
const P = { sevExact: 10, sevNear: 5, recRight: 5, quizRight: 15, quizFirstTry: 5, findBonus: 2 };

// Deterministic PRNG so an inspection can be replayed from its seed.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollStates(seed) {
  const rnd = mulberry32(seed);
  const states = {};
  for (const cp of CHECKPOINTS) {
    if (cp.kind === 'defect') states[cp.id] = 'defect';
    else if (cp.kind === 'ok') states[cp.id] = 'ok';
    else states[cp.id] = rnd() < 0.4 ? 'defect' : 'ok';
  }
  return states;
}

function freshInspection(seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0) {
  return {
    id: `INS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(seed % 10000).toString().padStart(4, '0')}`,
    seed,
    startedAt: Date.now(),
    finishedAt: null,
    states: rollStates(seed),
    logged: {},          // checkpointId -> { severity, rec, note, sevScore, recRight, points, at }
    toolReads: {},       // checkpointId -> true once a required tool was used on it
    zonesVisited: [],
    componentsOpened: [],
  };
}

function freshProfile() {
  return {
    version: 1,
    xp: 0,
    quizzes: {},         // quizId -> { attempts, correct, lastAt }
    lessonsSeen: [],     // courseIds whose field notes were opened
    coursesTouched: {},  // courseId -> count of checkpoints logged
    history: [],         // finished inspections summary
    settings: { hints: true, sound: true, mouseSensitivity: 1, quizFrequency: 'normal', guide: 'fade' },
    mastery: {},         // checkpointId -> { n, good } across inspections (good = exact, unhinted first log)
    inspection: freshInspection(),
  };
}

export function createStore(bus) {
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { data = null; }
  if (!data || data.version !== 1 || !data.inspection) data = freshProfile();
  // re-roll states if manifest changed since save
  for (const cp of CHECKPOINTS) {
    if (!(cp.id in data.inspection.states)) data.inspection.states[cp.id] = rollStates(data.inspection.seed)[cp.id];
  }

  let tool = 'hand';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode */ } };

  const api = {
    get profile() { return data; },
    get inspection() { return data.inspection; },
    get settings() { return data.settings; },
    get tool() { return tool; },

    setTool(t) { tool = t; bus.emit('tool:changed', { tool: t }); },
    setSetting(k, v) { data.settings[k] = v; save(); bus.emit('settings:changed', { key: k, value: v }); },

    stateOf(cpId) { return data.inspection.states[cpId]; },
    isLogged(cpId) { return !!data.inspection.logged[cpId]; },
    /** Field-guide mastery: { n, good, defect?, ok? } across every inspection on this device (solo exact calls). */
    mastery(cpId) { return (data.mastery && data.mastery[cpId]) || { n: 0, good: 0 }; },

    rank() {
      let r = RANKS[0], next = null;
      for (let i = 0; i < RANKS.length; i++) { if (data.xp >= RANKS[i].xp) { r = RANKS[i]; next = RANKS[i + 1] || null; } }
      return { ...r, next, xp: data.xp };
    },

    addXP(n, reason) {
      if (!n) return;
      const before = api.rank().title;
      data.xp += n; save();
      bus.emit('xp:gained', { amount: n, reason, total: data.xp });
      const after = api.rank().title;
      if (after !== before) bus.emit('rank:up', { title: after });
    },

    markZone(zoneId) {
      const z = data.inspection.zonesVisited;
      if (!z.includes(zoneId)) { z.push(zoneId); save(); return true; }
      return false;
    },
    markComponent(componentId) {
      const c = data.inspection.componentsOpened;
      if (!c.includes(componentId)) { c.push(componentId); save(); return true; }
      return false;
    },
    markToolRead(cpId) { data.inspection.toolReads[cpId] = true; save(); },

    /** Can the player perceive this checkpoint's condition with the current tool? */
    canPerceive(cpId) {
      const cp = CHECKPOINT_BY_ID[cpId];
      if (!cp?.tool) return true;
      return tool === cp.tool || !!data.inspection.toolReads[cpId];
    },

    /**
     * Grade a logged observation. `answer` = the correct answer object from checkpoint content:
     *   { severity, sevAlt?: [], rec, recAlt?: [] }
     * `choice` = { severity, rec, note?, hinted? } (hinted = the player revealed the observation text)
     * Returns { sevScore: 'exact'|'near'|'wrong', recRight, points, falsePositive, missedDefect, practice }
     *
     * The FIRST log of a checkpoint is the graded record. Re-logs are practice: they get feedback
     * but never overwrite the grade, so reading the answer and re-logging can't game the report.
     */
    logFinding(cpId, choice, answer) {
      const truth = data.inspection.states[cpId];
      const want = SEV_BY_ID[answer.severity];
      const got = SEV_BY_ID[choice.severity];
      let sevScore = 'wrong';
      if (want && got) {
        if (want.id === got.id || (answer.sevAlt || []).includes(got.id)) sevScore = 'exact';
        else if (want.id !== 'ok' && got.id !== 'ok' && Math.abs(want.rank - got.rank) === 1) sevScore = 'near';
      }
      // Referral only counts when the severity call is at least in the neighbourhood.
      const recOk = sevScore !== 'wrong' && [answer.rec, ...(answer.recAlt || [])].includes(choice.rec);
      let points = (sevScore === 'exact' ? P.sevExact : sevScore === 'near' ? P.sevNear : 0) + (recOk ? P.recRight : 0);
      if (truth === 'defect' && choice.severity !== 'ok') points += P.findBonus;
      if (choice.hinted) points = Math.floor(points / 2);
      const prev = data.inspection.logged[cpId];
      const entry = {
        severity: choice.severity, rec: choice.rec, note: choice.note || '',
        sevScore, recRight: recOk, points, at: Date.now(), hinted: !!choice.hinted, guided: !!choice.guided,
        falsePositive: answer.severity === 'ok' && choice.severity !== 'ok' && sevScore !== 'exact',
        missedDefect: answer.severity !== 'ok' && choice.severity === 'ok' && sevScore !== 'exact',
      };
      if (prev) {
        prev.practice = entry; // keep the graded record; remember the latest practice attempt
        save();
        const result = { ...entry, practice: true };
        bus.emit('finding:logged', { checkpointId: cpId, entry: result, truth });
        return result;
      }
      data.inspection.logged[cpId] = entry;
      {
        data.mastery = data.mastery || {};
        const m = data.mastery[cpId] || (data.mastery[cpId] = { n: 0, good: 0 });
        // mastery = an exact call made solo (no description, no field guide open), per rolled state
        m.n++; if (sevScore === 'exact' && !entry.hinted && !entry.guided) { m.good++; m[truth] = (m[truth] || 0) + 1; }
        const cp = CHECKPOINT_BY_ID[cpId];
        for (const course of cp.courses) data.coursesTouched[course] = (data.coursesTouched[course] || 0) + 1;
        save();
        api.addXP(points, 'finding');
      }
      bus.emit('finding:logged', { checkpointId: cpId, entry, truth });
      return entry;
    },

    answerQuiz(quiz, choiceIndex) {
      const rec = data.quizzes[quiz.id] || { attempts: 0, correct: false, lastAt: 0 };
      const correct = choiceIndex === quiz.answer;
      const firstTry = rec.attempts === 0;
      rec.attempts += 1; rec.lastAt = Date.now();
      const gained = correct && !rec.correct ? P.quizRight + (firstTry ? P.quizFirstTry : 0) : 0;
      if (correct) rec.correct = true;
      data.quizzes[quiz.id] = rec; save();
      if (gained) api.addXP(gained, 'quiz');
      bus.emit('quiz:answered', { quizId: quiz.id, correct, gained });
      return { correct, gained };
    },

    markLesson(courseId) {
      if (!data.lessonsSeen.includes(courseId)) { data.lessonsSeen.push(courseId); save(); }
    },

    /** Summary for the report screen. */
    summary() {
      const ins = data.inspection;
      const all = CHECKPOINTS;
      const defects = all.filter(cp => ins.states[cp.id] === 'defect');
      const logged = all.filter(cp => ins.logged[cp.id]);
      const found = defects.filter(cp => ins.logged[cp.id] && ins.logged[cp.id].severity !== 'ok');
      const maxPts = all.length * (P.sevExact + P.recRight) + defects.length * P.findBonus;
      const pts = logged.reduce((s, cp) => s + ins.logged[cp.id].points, 0);
      const byZone = ZONES.map(z => {
        const cps = all.filter(cp => cp.zone === z.id);
        return {
          zone: z.id, name: z.name, total: cps.length,
          logged: cps.filter(cp => ins.logged[cp.id]).length,
          defects: cps.filter(cp => ins.states[cp.id] === 'defect').length,
          found: cps.filter(cp => ins.states[cp.id] === 'defect' && ins.logged[cp.id] && ins.logged[cp.id].severity !== 'ok').length,
        };
      });
      const pct = maxPts ? Math.round((pts / maxPts) * 100) : 0;
      const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
      return {
        id: ins.id, startedAt: ins.startedAt, pts, maxPts, pct, grade,
        totalCheckpoints: all.length, loggedCount: logged.length,
        defectCount: defects.length, foundCount: found.length,
        missed: defects.filter(cp => !ins.logged[cp.id] || ins.logged[cp.id].severity === 'ok').map(cp => cp.id),
        falsePositives: logged.filter(cp => ins.logged[cp.id].falsePositive).map(cp => cp.id),
        byZone,
      };
    },

    finishInspection() {
      const s = api.summary();
      if (data.inspection.finishedAt) return s; // idempotent: XP and history only once
      data.inspection.finishedAt = Date.now();
      data.history.unshift({ id: s.id, date: Date.now(), pct: s.pct, grade: s.grade, found: s.foundCount, defects: s.defectCount });
      data.history = data.history.slice(0, 30);
      save();
      api.addXP(Math.round(s.pct * 3), 'report');
      bus.emit('inspection:finished', s);
      return s;
    },

    newInspection(seed) {
      data.inspection = freshInspection(seed);
      save();
      bus.emit('inspection:new', { inspection: data.inspection });
    },

    resetAll() { data = freshProfile(); save(); bus.emit('inspection:new', { inspection: data.inspection }); },
    save,
  };
  return api;
}
