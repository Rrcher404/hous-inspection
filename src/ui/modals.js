// Modal stack: one place that owns focus trapping, Esc, and the ui:modal signal to the engine.
// Full-screen screens (title, report, exam) are modal entries too, so the engine is paused
// whenever anything blocking is up.
import { h, append } from './dom.js';
import { icon } from './icons.js';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function createModals({ bus, host }) {
  const stack = [];
  let lastOpen = null;

  const sync = () => {
    const open = stack.length > 0;
    if (open !== lastOpen) { lastOpen = open; bus.emit('ui:modal', { open }); }
  };

  function focusInto(entry) {
    const el = entry.el;
    const want = (entry.initialFocus && el.querySelector(entry.initialFocus)) || el.querySelector('[data-autofocus]') || el.querySelector(FOCUSABLE) || el;
    want?.focus?.({ preventScroll: true });
  }

  /**
   * open(el, { label, onClose, onKey(e) => handled, dismissable = true, initialFocus, kind })
   * Returns the entry; entry.close(reason) removes it.
   */
  function open(el, opts = {}) {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    if (!el.getAttribute('role')) el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    if (opts.label && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) el.setAttribute('aria-label', opts.label);
    const entry = { el, dismissable: true, ...opts, prevFocus: document.activeElement, closed: false };
    entry.close = (reason) => {
      if (entry.closed) return;
      entry.closed = true;
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      el.remove();
      sync();
      try { opts.onClose?.(reason); } catch (err) { console.error(err); }
      const pf = entry.prevFocus;
      const t = top();
      if (pf && document.contains(pf) && (!t || t.el.contains(pf))) pf.focus?.({ preventScroll: true });
      else if (t) focusInto(t);
    };
    stack.push(entry);
    append(host, el);
    sync();
    requestAnimationFrame(() => { if (!entry.closed && top() === entry) focusInto(entry); });
    return entry;
  }

  const top = () => stack[stack.length - 1] || null;

  function trap(e) {
    const t = top();
    if (!t) return;
    const f = [...t.el.querySelectorAll(FOCUSABLE)].filter(x => x.getClientRects().length > 0);
    if (!f.length) { e.preventDefault(); t.el.focus(); return; }
    const first = f[0], last = f[f.length - 1];
    if (!t.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && (document.activeElement === first || document.activeElement === t.el)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function closeWhere(pred, reason = 'replace') {
    for (const e of stack.slice().reverse()) if (pred(e)) e.close(reason);
  }

  return {
    open, top, trap, closeWhere,
    get count() { return stack.length; },
    has: (kind) => stack.some(e => e.kind === kind),
  };
}

/** A calm confirm dialog. Resolves true/false. */
export function confirmDialog(ctx, { title, body, confirm = 'Confirm', cancel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    let result = false;
    const id = 'cf-' + Math.random().toString(36).slice(2, 7);
    const wrap = h('div', { class: 'modal-wrap center', 'aria-labelledby': id + '-t', role: 'alertdialog' });
    const yes = h('button', { class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, type: 'button', 'data-autofocus': danger ? null : '' }, confirm);
    const no = h('button', { class: 'btn btn-ghost', type: 'button', 'data-autofocus': danger ? '' : null }, cancel);
    const card = h('div', { class: 'card dialog' },
      h('h2', { id: id + '-t', class: 'dialog-title' }, title),
      body ? h('div', { class: 'dialog-body' }, body) : null,
      h('div', { class: 'dialog-actions' }, no, yes));
    append(wrap, card);
    const entry = ctx.modals.open(wrap, { kind: 'confirm', onClose: () => resolve(result) });
    yes.onclick = () => { ctx.sound.play('click'); result = true; entry.close('yes'); };
    no.onclick = () => { ctx.sound.play('click'); entry.close('no'); };
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) entry.close('backdrop'); });
  });
}

export function closeButton(onClick, label = 'Close') {
  return h('button', { class: 'icon-btn', type: 'button', 'aria-label': label, title: label, onclick: onClick }, icon('x'));
}
