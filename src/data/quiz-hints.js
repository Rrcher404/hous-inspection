// OWNER: Lindqvist. One hint per wrong option, keyed by quiz id then the exact wrong-option text.
// Shown after a first wrong pick in pop quizzes and room checks (not Exam Mode), before one retry.
// A hint aims at the misconception behind that option and never points to the right answer.
export const QUIZ_HINTS = {
  "q-sop-01": {
    "A code-compliance inspection of the home's major systems": "Ask whether a home inspector is acting as a building official here, and what the SOP says the inspection is not.",
    "A technically exhaustive evaluation with instruments and calculations": "Consider how far a standard inspection is expected to go, and whether it promises measurements and calculations on every system.",
    "An appraisal of the home's overall condition and market value": "Think about who puts a dollar value on a house, and whether value ever belongs in an inspection report."
  },
  "q-sop-02": {
    "Walk on the roof surface": "Separate what the SOP lets you do from what it requires. Is getting onto the roof surface ever mandatory?",
    "Predict the remaining service life of the roof": "Can anyone standing on a roof today promise how many years it has left? Check whether forecasting is part of the job.",
    "Perform a water test on suspected leaks": "Leaks matter, but the SOP does not ask an inspector to run water over a roof to recreate one."
  },
  "q-sop-03": {
    "Nothing; NC adopts the InterNACHI SOP smoke alarm wording unchanged": "The question says NC adds something. Recall whether the NC rule goes further than InterNACHI on smoke alarms.",
    "Verify each alarm is hardwired and interconnected, and test it with canned smoke": "Hardwiring and interconnection run inside walls and ceilings. Ask whether an inspector could confirm either without opening up the building.",
    "Report the battery type and replace each alarm with a low battery": "Would an inspector be servicing equipment on the job? Recall whether NC asks you to repair anything at all."
  },
  "q-sop-04": {
    "Acceptable, because the test button sounded when pressed": "A sounding horn feels like a clean pass. Ask whether a working horn tells you anything about how old the alarm is.",
    "Not reportable, since alarm age is outside the inspection standards": "Before trusting an exclusion, find its wording. Reread the SOP's limitations list and ask whether it says what this option claims.",
    "Recommend replacing the battery and retesting the alarm": "The horn already sounded on test. Ask what problem a new battery would actually solve here."
  },
  "q-sop-05": {
    "In the hallway outside the bedrooms and on each story": "Ask where that list came from, then reread IRC R314.3 and check each remaining option against every location it names.",
    "On each story at the top of the stairs, and one in the kitchen": "Think about what happens to an alarm placed near cooking, and whether the code wants alarms there.",
    "In each bedroom and in the kitchen, but not in hallways": "IRC R314.3.3 keeps alarms a set distance from cooking appliances because of nuisance alarms. Ask how this option's kitchen alarm squares with that."
  },
  "q-sop-06": {
    "A basement, a crawlspace, or an open-air carport": "Below-grade spaces and carports describe the home's layout. Ask whether NC ties this duty to layout or to equipment.",
    "Bedrooms on more than one story, or a finished basement": "Bedroom-by-story wording borrows from smoke alarm placement. Ask whether the NC carbon monoxide list follows that same placement logic.",
    "An electric furnace, a heat pump, or a detached garage": "Review 11 NCAC 08 .1110(d)(2) and recall the home features it lists for carbon monoxide alarm reporting."
  },
  "q-sop-07": {
    "An exterior-grade door of whatever material, with full weatherstripping": "Weatherstripping stops drafts. Ask what this door is really there to slow down, and whether any material will do.",
    "Solid wood at least 2 in thick, or a 45-minute rated door": "Heavier and higher-rated sounds safer. Ask whether the course's residential garage rule actually demands a door this heavy.",
    "Hollow-core wood with a self-closer and weatherstripping": "Picture a garage fire reaching a hollow-core door. How long would it hold, closer or not?"
  },
  "q-sop-08": {
    "Acceptable, provided the flap is rigid plastic and closes fully": "Rigid and self-closing describe how the flap moves. Reread the course's garage-to-house door standard for what that door must be, then judge.",
    "A concern when a bedroom opens directly into the garage": "A bedroom opening onto a garage is a separate issue. Check whether the stem mentions a bedroom at all.",
    "Cosmetic damage to the door, which the SOP excludes": "Cosmetic covers marks that change only appearance. Ask whether an opening cut through the full thickness of a door fits that definition."
  },
  "q-sop-09": {
    "1/4 in gypsum board": "This is a memorized minimum. Recall the figure the course gives for the walls, separate from the one for a room above.",
    "3/8 in gypsum board": "Thin boards are common in older homes. Check your memory of the course figure, not what you have seen installed.",
    "1 in gypsum board": "That exceeds what the course asks. Recall the minimum for the walls, and the different one for a ceiling under a bedroom."
  },
  "q-sop-10": {
    "Flexible duct with a foil jacket, sealed where it passes through": "Ask where your belief about foil-jacketed flex in garages came from. Which section of the course's garage standard covers ducts?",
    "Ductboard or flex, provided the penetration is fire-caulked": "Fire caulk at a penetration is a real detail. Reread the course's garage separation standard in full and test each remaining option against it.",
    "Thin aluminum duct, with a register to heat the garage": "Review the course's rule for ducts that pass through the garage-to-house separation, and why that wall matters."
  },
  "q-sop-11": {
    "Operators over 10 years old, which should be replaced on age alone": "Check whether operator age appears anywhere in the NC list of required reports for this item.",
    "Nothing, since garage door operators are excluded in NC": "Recall whether NC treats the garage door operator as excluded, or names specific conditions you must report.",
    "The condition of the remote transmitters and wall button": "Recall whether the NC rule mentions the remote transmitters at all, and if so, in which direction."
  },
  "q-sop-12": {
    "12 in above the floor": "This is a memorized maximum. Recall the course figure instead of the height that looks typical on most installs.",
    "18 in above the floor": "Picture a small child lying flat under the closing door. Would a beam at that height cross their body?",
    "24 in above the floor": "Picture a pet lying under the door. Ask whether a beam at knee height would ever see it."
  },
  "q-sop-13": {
    "Can be reached by whatever means the inspector chooses, including ladders and tools": "Ask whether owning a tall ladder should expand what counts as accessible, and whether the definition depends on equipment at all.",
    "Is within 6 ft of the floor and not behind a locked door": "That mixes in a number from another rule. Check whether the InterNACHI glossary definition uses any distance at all.",
    "Has been made available by the seller in writing before the inspection": "Ask whether accessibility depends on paperwork from the seller, or on conditions at the house during the inspection."
  },
  "q-sop-14": {
    "A six-foot stepladder": "Review 11 NCAC 08 .1101(28), the NC definition of a readily openable access panel, and the reach limit it sets.",
    "An extension ladder at the eave": "Ask whether a panel reached from an eave ladder sounds like something anyone would call readily openable.",
    "The ladder the inspector carries": "If the limit depended on each inspector's own ladder, would two inspectors agree on what is readily openable?"
  },
  "q-sop-15": {
    "A system that does not function as intended": "Ask whether a client would expect to hear that something is not working. Is that ever optional?",
    "Which systems were not inspected, and why": "Think about how a client would know what you skipped. Is that disclosure optional or required?",
    "The water supply piping material": "Ask whether describing the materials you saw is part of the job, or something the SOP sets aside."
  },
  "q-sop-16": {
    "Within 24 hours after the inspection": "That is a fast turnaround many inspectors offer. Recall what the statute sets when the contract gives no date.",
    "Within five calendar days after the inspection": "Recall the exact default the statute sets when the agreement is silent, rather than a figure that sounds reasonable.",
    "Before the due diligence period ends": "Due diligence dates come from the purchase contract. Ask whether the inspection statute ties delivery to that date."
  },
  "q-sop-17": {
    "Cost estimates for each listed repair, grouped by system and urgency": "Recall the general exclusions. Are repair costs something an NC inspector is required to provide?",
    "The safety hazards alone, ranked from most to least urgent": "Ask whether the summary is limited to one category of finding, and whether the statute requires ranking anything.",
    "A pass/fail grade for each system and an overall grade for the whole house": "Ask whether the statute asks inspectors to grade houses, or to describe conditions they found."
  },
  "q-sop-18": {
    "Cite the current code edition and section number for each defect listed": "Ask whether the statute leaves code citations to your judgment, or puts conditions on them.",
    "Obtain written approval from the local building official before reporting": "Ask whether the statute routes your report through a local official, or puts its requirements on you, the inspector.",
    "Nothing extra, since code citations are routine in NC home inspection reports": "The question says the statute requires something. Recall why most NC reports avoid quoting code at all."
  },
  "q-sop-19": {
    "120 hours of online academic instruction, with no field component": "Ask whether NC licensing includes any hands-on training beyond classroom study.",
    "200 hours: 80 classroom and 120 field, including 10 ride-alongs": "Ask yourself where that breakdown came from. Reread 11 NCAC 08 .1021 and write down its figures before comparing options.",
    "40 hours of classroom study plus 50 inspections under a licensed supervisor": "Recall the total hour requirement in rule .1021, and whether it is counted in inspections or in hours."
  },
  "q-sop-20": {
    "Expires each second year on June 30; 24 CE hours, including ethics": "Recall whether NC licenses renew yearly or less often, and the month the license expires.",
    "Expires December 31 each year; 16 CE hours, including the 4-hour code update course": "Check the expiration month and the name of the required course. Is it a code update or something else?",
    "Expires each third year on your birthday; 48 hours of elective CE": "Ask whether NC ties renewal to one fixed date for everyone, or to each licensee's birthday."
  },
  "q-sop-21": {
    "$100,000 errors and omissions coverage, with no general liability": "Ask whether NC requires general liability coverage, and recall the dollar figure tied to it.",
    "$1,000,000 general liability, with no bond or other coverage": "A million-dollar policy sounds safe, but recall what G.S. 143-151.58 actually lists instead of a common commercial policy limit.",
    "A $5,000 surety bond, with no liability insurance required": "Recall whether a bond alone satisfies NC, or whether some liability coverage is always required."
  },
  "q-sop-22": {
    "Reporting a safety concern that goes beyond what the SOP itself requires": "Ask whether the SOP sets a floor or a ceiling. Can telling a client more ever breach ethics?",
    "Telling a client that you also hold an electrical contractor license": "Ask whether being open about your other credentials creates a conflict, or simply informs the client.",
    "Excluding a system from the inspection at the client's written request": "Ask who controls the scope of the inspection, and whether a written request from the client changes it."
  },
  "q-sop-23": {
    "You may, as long as your price is fair and in writing": "Ask whether a fair, written price removes the conflict of being paid to fix what you just reported.",
    "You may not, unless you hold a general contractor license": "Ask whether the ethics rule is about having the skill to do the repair, or about something else.",
    "You may, if you disclose the arrangement in the report": "Disclosure helps in many conflicts. Ask whether it fixes this one, where your findings create your own paid work."
  },
  "q-sop-24": {
    "One unit": "Think about duplexes and small multiplexes. Do the standards cover only single-family houses?",
    "Two or fewer units": "Recall the exact unit count where residential standards stop and commercial inspection begins.",
    "Six or fewer units": "Recall the exact unit count where the residential standards end. Small apartment buildings may fall outside it."
  },
  "q-sop-25": {
    "Half of each component type, spread across the whole house": "Ask whether NC defines this term with a percentage, or with a count tied to location.",
    "Each readily accessible component, room by room and side by side": "If you had to check every one, would the term representative be needed at all?",
    "Three per floor inside, and two per side of the building outside": "Those counts sound thorough. Ask whether NC measures the sample floor by floor, or by some other unit of the house."
  },
  "q-sop-26": {
    "After 7 days": "Recall the waiting period in the statute. A one-week gap would let candidates retest almost at once.",
    "After 30 days": "Recall the exact waiting period in G.S. 143-151.57(b) rather than a typical retest window from other exams.",
    "After one year": "Ask whether NC makes a candidate wait a full year, or a shorter set period, between attempts."
  },
  "q-sop-27": {
    "The National Home Inspector Examination (NHIE), scaled-scored at a PSI test center": "Many states use a national exam, and some websites say NC does too. Check what the Board's current documents describe.",
    "A 100-question open-book exam on the IRC, 2 hours, 75% to pass": "Ask whether the NC licensing exam is a code-lookup test built on the IRC, or something else entirely.",
    "A field practical exam graded on site by a Board-appointed inspector": "Field skills are covered in pre-licensing training. Ask whether the licensing exam itself is written or hands-on."
  },
  "q-sop-28": {
    "Building science, Business practices, Report writing, and Ethics": "Those are skills a business needs. Ask whether a licensing exam tests how you run a company.",
    "IRC chapters 1 through 11, plus the NC Building Code": "Ask whether the exam is organized by code chapters, and whether NC inspectors inspect to code at all.",
    "Electrical, Plumbing, Mechanical, and Structural Pest Control": "Structural pest control is a separately licensed trade in NC. Ask whether the home inspector exam would test another profession's field."
  },
  "q-sop-29": {
    "Describe, Diagnose, Implication, Disclose": "Ask yourself where that expansion came from. Find DDID in the NC Board's study guide and check each of the four words.",
    "Document, Determine, Inspect, Direction": "Ask whether inspect makes sense as a step after you have already found the defect.",
    "Detect, Describe, Implication, Deferral": "Check the order: would you describe a component before or after detecting a problem? And is deferral the goal?"
  },
  "q-sop-30": {
    "Yes, NC requires the garage-to-house door to self-close and self-latch": "A blanket yes assumes NC copied the national sentence word for word. Ask whether NC's door rule has conditions or differences.",
    "Yes, when the door has a glass panel or a pet door in it": "A pet door is a fire separation issue. Ask whether it changes whether a closer is required.",
    "Yes, for homes permitted after 2009, when NC adopted the IRC rule": "Recall which code edition governs now, and what the State Fire Marshal said that edition requires."
  },
  "q-sop-31": {
    "No contract, since the house is unoccupied and still being built": "Ask whether NC ties its pre-inspection requirements to whether anyone lives in the house yet.",
    "A copy of the building permit and the builder's written permission": "Permits and builder permission concern the construction site. Ask whether the new NC rule was written about site access.",
    "A verbal agreement with the builder covering the scope and the price": "Agreeing scope and price is sensible. Ask whether the builder is the party you are inspecting for."
  },
  "q-sop-32": {
    "Interior paint and trim finish": "Ask what a pre-drywall visit is racing against. Is paint even on the walls yet?",
    "Appliance operation": "Are appliances installed and running while the walls are still open? Think about what is about to be hidden.",
    "Landscape irrigation": "Ask whether landscape systems get covered up by drywall, which is what this rule is built around."
  },
  "q-sop-33": {
    "Whether you entered the space, and how long you spent inside": "Time inside sounds like diligence. Ask whether the amended rule measures your effort, or something else about the space.",
    "Nothing more, as long as you note that the space was not entered": "The question says something changed on June 1, 2026. Ask whether a note alone would satisfy the amended rule.",
    "The square footage of each space, plus the insulation type, depth, and R-value": "Ask whether the amendment is about measuring and cataloguing the space, or about something else a report reader needs."
  },
  "q-ea-01": {
    "Acceptable, as long as both conductors are the same wire gauge": "Ask where that same-gauge rule came from. Reread the course's electrical panel section on conductors at breaker terminals before choosing.",
    "Monitor it; double taps are common in older panels": "Ask whether a condition being common in older panels makes it safe, or just familiar.",
    "Recommend replacing the main breaker with a larger one": "Ask whether the main breaker has anything to do with two wires under one branch breaker screw."
  },
  "q-ea-02": {
    "Each ground needs its own terminal; neutrals may share if they are the same size": "Same size sounds like a safe condition. Ask whether a matching wire size is enough to let two neutrals share a terminal.",
    "Two same-size conductors may share a terminal if the screw is tight": "Ask whether the rule treats neutrals and grounds the same way, or differently.",
    "Neutrals and grounds each need their own terminal, with no sharing": "Ask whether the terminal rule treats the two conductor types alike, or gives one of them more room."
  },
  "q-ea-03": {
    "They lower the panel's amperage rating until a breaker is added": "Ask whether an open hole in sheet metal can change how much current the panel can carry.",
    "They ventilate the panel and should be left open for cooling": "Knockouts are made for cable and raceway entry. Ask whether a manufacturer would leave cooling to those holes.",
    "They are cosmetic, since the dead front cover still keeps hands off live parts": "Cosmetic means appearance only. Ask whether an open hole in an electrical enclosure is only about appearance."
  },
  "q-ea-04": {
    "When it is landed on a 15 A breaker serving a lighting circuit": "Ask what rule you are relying on for that breaker size, then reread the course's section on conductor colors.",
    "When the panel is a subpanel, where white and black are interchangeable": "A subpanel still keeps its neutrals on their own isolated bar. Ask whether that makes white and black interchangeable there.",
    "When it is a separate white wire run in conduit, not in a cable": "Review the code exception that lets a white conductor serve as a hot, and the conditions it sets."
  },
  "q-ea-05": {
    "Residential panels do not require a circuit directory": "Ask how anyone would find the right breaker in an emergency without a directory.",
    "The labels should be engraved or printed, not handwritten": "Ask whether the problem is how the labels were written, or what they actually say.",
    "The directory should list wire gauge and breaker size for each circuit": "Breaker size is already printed on each handle. Ask whether repeating it in the directory fixes these labels."
  },
  "q-ea-06": {
    "The panel's manufacture date and the recall history for its brand": "Brand recalls matter for some panels. Ask whether recall research is part of a visual inspection's required scope.",
    "Signs of a lightning strike or surge, and the seller's history of either": "Lightning damage usually shows as scorching, pitting, or melted parts. Ask whether the stem describes any of that before choosing among the rest.",
    "Nothing more; rust inside a panel is cosmetic and can be noted": "Rust inside electrical equipment is more than appearance. Ask whether noting it and moving on fits a panel with corrosion."
  },
  "q-ea-07": {
    "Safety hazard; the aluminum wiring should be replaced throughout": "Replacing wiring throughout goes well past what you saw at the main lugs. Ask how far one observation can stretch.",
    "Major defect; refer for a derating calculation on the service": "A derating calculation is design work. Ask whether an inspector orders one from a look at the lugs.",
    "Report it as single-strand aluminum branch wiring under NC rules": "Review exactly which aluminum wiring NC SOP .1110(c) names, then decide whether this stem describes it."
  },
  "q-ea-08": {
    "Normal, since breakers under load are expected to run warm": "Ask whether one breaker much hotter than its neighbours is ever just normal warmth.",
    "An overloaded circuit; recommend a larger breaker for it": "A larger breaker lets more current through the same wire. Ask what that does to the wire's protection.",
    "A failed breaker that the seller should replace before closing": "Deciding who fixes what before closing is a negotiation call. Ask whether that belongs in an inspector's report."
  },
  "q-ea-09": {
    "8 ft": "Recall the clearance ladder from the course. Is any rung of it as low as this one?",
    "10 ft": "That rung exists, but ask which kind of traffic it covers. Do cars use a driveway?",
    "18 ft": "That rung exists too. Ask what kind of road and vehicle it is set for."
  },
  "q-ea-10": {
    "18 in": "Ask whether a person leaning out a window or over a deck rail could reach this far.",
    "6 ft": "This is a single memorized figure. Recall the course number for reach from decks and windows, not a guess.",
    "10 ft": "Ten feet appears in the vertical clearance ladder. Ask whether this question is about height overhead or reach sideways."
  },
  "q-ea-11": {
    "It absorbs thermal expansion and contraction of the service conductors": "Review the parts of an overhead service entrance, from the service drop to the weatherhead, and what each part is for.",
    "It gives the utility slack to disconnect power at the pole": "Ask whether the loop's shape does a job for the house, or only for the line crew at the pole.",
    "It bonds the service drop to the house grounding system": "Ask whether a loop of insulated conductor could connect anything to the grounding system."
  },
  "q-ea-12": {
    "18 in": "Picture yourself standing at the open panel with a flashlight. Could you work in that depth safely?",
    "24 in": "That is how far the boxes sit now. Ask whether the required depth matches the problem in the stem.",
    "48 in": "Recall the exact working depth from the course rather than a generous round number."
  },
  "q-ea-13": {
    "Equipment ground": "Grounded and grounding are different terms. The equipment ground is a grounding conductor, so look past the similar sound.",
    "Hot": "Ask whether the hot is ever described as grounded. What would that word say about its voltage?",
    "Grounding electrode conductor": "Grounded and grounding are different words. Ask which one the electrode conductor belongs to."
  },
  "q-ea-14": {
    "Combined on one bar, the same way as in the main panel": "Rules written for the main panel follow from its role as the service. Ask whether a subpanel shares that role, then reread the subpanel section.",
    "Separated, with the neutral bar bonded to the enclosure": "Review the neutral and ground rules for service equipment versus a downstream panel, then compare each option.",
    "Combined, as long as the subpanel has its own main disconnect breaker": "Ask whether a main breaker in the subpanel makes it the service, or leaves it downstream equipment."
  },
  "q-ea-15": {
    "Leave the cover on and judge the panel by its exterior and label": "Ask whether NC lets you judge a panel from the outside, or expects you to look in.",
    "Remove the cover with a licensed electrician present to assist": "Ask whether NC asks you to bring another tradesperson along, or sets a rule for you alone.",
    "Remove the cover when the client requests it in writing": "Ask whether the panel interior is something the client opts into, or part of the standard itself."
  },
  "q-er-01": {
    "Kitchen countertops and bathrooms, by room name, regardless of fixture distance": "Room names are how older GFCI rules were often taught. Check whether NC .1110 defines its list the same way.",
    "Those installed after 1990, when GFCI rules took full effect": "Ask whether NC ties this report to the age of the house at all.",
    "Bathrooms, kitchens, and garages, but not exterior receptacles": "That list reads like a room checklist. Ask whether NC .1110 builds its list from room names at all."
  },
  "q-er-02": {
    "Acceptable if the receptacle tests GFCI protected and shows no corrosion": "Ask what GFCI protection actually does. Does it keep rain from getting into the box?",
    "Cosmetic damage to the cover, which the SOP excludes": "Ask what that cover is for. Is its job about looks, or about keeping something out?",
    "Shock hazard; turn off the circuit and refer to the power utility": "Ask where the utility's equipment ends. Does it repair wiring devices on the house side of the meter?"
  },
  "q-er-03": {
    "The receptacle will not power anything until it is rewired correctly": "Reversed means swapped, not disconnected. Ask whether a three-light tester would light at all on a dead receptacle.",
    "It matters for 240 V appliances, not for ordinary plug-in lamps": "Ask whether polarity is a 240 V idea at all, given which two wires a 120 V receptacle uses.",
    "It makes the upstream GFCI trip whenever a load is plugged in": "Ask whether a GFCI reacts to which slot is hot, or to current leaking away somewhere."
  },
  "q-er-04": {
    "Nothing; a 'correct' reading means the receptacle is grounded": "Ask what a three-light tester actually measures, and whether it could be fooled.",
    "Reversed polarity, which this tester does not detect": "Recall what the three-light tester can detect. Is reversed polarity one of its readings?",
    "An open neutral hidden behind the tester's correct reading": "Ask whether the tester would show correct with an open neutral, or flag it."
  },
  "q-er-05": {
    "Acceptable, because the receptacle still powers devices": "Ask yourself what result your tester actually showed, and whether 'it powers devices' answers that result or a different question.",
    "Correct it yourself with a three-to-two adapter plug": "Ask yourself what an adapter plug changes inside the wall, then reread the course's section on ungrounded three-prong receptacles.",
    "Acceptable if a surge protector is plugged in to absorb faults": "Ask where the belief that a surge strip offsets an open ground came from. Reread the course's receptacle testing section before choosing."
  },
  "q-er-06": {
    "Acceptable, because the receptacle still delivers power to both outlets": "Ask whether delivering power is the GFCI's special job, or whether it has another one.",
    "Reset it, retest once, and mark it acceptable if it resets": "Review what a GFCI test button is meant to show, and how the NC SOP expects you to handle the result.",
    "Recommend an AFCI breaker for the kitchen circuit instead": "Ask whether an AFCI does the same job as a GFCI, or guards against a different hazard."
  },
  "q-er-07": {
    "They are the same device, sold under two different names": "If they were the same device, why would anyone need two names and two kinds of protection?",
    "A GFCI guards against overloads; an AFCI guards against short circuits": "Ask which device in the panel already handles overloads and short circuits.",
    "A GFCI is for 240 V circuits; an AFCI is for 120 V circuits": "Ask whether these devices are sorted by voltage, or by the hazard each one watches for."
  },
  "q-er-08": {
    "Do not report it, because a 1987 house is grandfathered under older rules": "Ask whether NC ties what you report to the year a house was built, or to what you find.",
    "Acceptable, because the receptacle's polarity tests correct": "Ask whether correct polarity protects a person at a wet sink from a ground fault.",
    "Cite a code violation and require the seller to rewire before closing": "Ask whether a home inspection checks code compliance, and whether the inspector decides what a seller must fix."
  },
  "q-er-09": {
    "Closet lights are excluded unless the closet is a walk-in with a switch": "Ask whether the SOP sorts closet fixtures by closet size or switch type.",
    "It wastes energy; recommend an LED bulb as a repair item": "Energy use is a client preference, not a repair item. Ask what makes a closet fixture reportable in the first place.",
    "Acceptable if the bulb is under 60 watts and has a pull chain": "Wattage and a pull chain sound like safeguards. Ask whether the course ties closet fixture rules to either one."
  },
  "q-er-10": {
    "Acceptable, as long as the tape is intact and the splice is off the joist": "Ask what rule the tape-and-joist idea comes from, then reread the course's section on attic wiring splices.",
    "Acceptable in attics, since they are unoccupied and rarely entered": "Ask whether a failing splice needs a person nearby to start a fire in insulation and framing.",
    "Fire hazard; recommend rewiring the attic circuits before closing": "Ask whether one taped splice tells you enough to call for rewiring every attic circuit."
  },
  "q-er-11": {
    "Stranded aluminum service entrance conductors at the main": "Ask yourself where that idea came from. Reread NC .1110(c) and note the exact wiring type it names.",
    "Copper nonmetallic sheathed cable from the 1970s": "Ask whether copper cable from that era is the material NC singles out.",
    "Low-voltage thermostat and doorbell wiring": "Ask whether thermostat and doorbell wiring carries enough energy to be a fire concern NC names."
  },
  "q-er-12": {
    "Operate GFCIs within 6 ft of the floor": "Recall an earlier NC rule you studied about operating ground-fault devices within a certain height.",
    "Report the presence or absence of smoke alarms": "Recall what NC added beyond InterNACHI for smoke alarms. Is reporting them optional?",
    "Describe the service amperage and voltage": "Ask whether describing the service size is basic information every electrical section starts with."
  },
  "q-er-13": {
    "Disposals are plug-in appliances, which the SOP excludes from inspection": "Ask where the plug-in exclusion idea came from. Reread the SOP's appliance and electrical limitations, and see what they actually exclude.",
    "It is a concern if the disposal is noisy or vibrating badly": "Noise and vibration are about the motor. Ask whether this question is about the motor at all.",
    "It is acceptable when the cable is a flexible appliance cord": "Calling it a flexible cord renames the wire. Ask whether renaming it changes the installation rules that apply."
  },
  "q-ca-01": {
    "To insulate the floor framing above from the cold ground below": "Ask whether a thin plastic sheet lying on the soil could do much insulating.",
    "To stop termites from tunneling up from the soil": "Ask whether termites would be stopped by a thin sheet they can go around at every pier and wall.",
    "To keep the soil from freezing under the house in winter": "Ask whether a thin sheet lying on the ground could keep soil from freezing."
  },
  "q-ca-02": {
    "4-mil polyethylene, with seams butted and taped": "Tape on a butt joint tends to lift in a damp crawlspace. Ask how the code wants the seams joined.",
    "15-lb roofing felt, lapped 2 in": "Ask whether roofing felt is made for ground contact, and what the code names for covering crawlspace soil.",
    "Landscape fabric, pinned at the seams": "Ask what landscape fabric is designed to let through, and whether that suits a crawlspace floor."
  },
  "q-ca-03": {
    "Normal for a vented crawlspace for a few weeks after a heavy rain": "Ask whether standing water is ever a normal state for a crawlspace, vented or not.",
    "Recommend a dehumidifier sized for the crawlspace, and nothing more": "Ask where the dehumidifier-only idea came from. Reread the course's crawlspace section on standing water before choosing.",
    "Not reportable, since standing water will evaporate on its own in time": "Ask where evaporating water goes in a closed space under a house, and what it reaches."
  },
  "q-ca-04": {
    "The square footage of the crawlspace, its vent count, and the soil type": "Ask whether NC asks inspectors to measure and count in the crawlspace, or to describe something else.",
    "The type, depth, and R-value of the floor insulation above": "Insulation is a useful detail. Ask whether .1106 is about the floor above, or about the space itself.",
    "The date and company name of the last termite treatment": "Ask whether pest treatment history is something the SOP even requires of you."
  },
  "q-ca-05": {
    "1 sq ft per 50 sq ft, or 1 per 500 with a vapor retarder": "More venting sounds safer. Recall the model code's base ratio instead of assuming a tighter ratio is better.",
    "1 sq ft per 300 sq ft, with no reduction for a vapor retarder": "Ask whether covering the soil should change how much venting a crawlspace needs.",
    "1 sq ft per 1,500 sq ft, whether or not the soil is covered": "Ask whether bare soil and covered soil release the same moisture, and if the vent rule treats them alike."
  },
  "q-ca-06": {
    "Identify the insect species in the report before referring": "Species identification goes beyond what the SOP asks of a home inspector. Ask what the SOP says about pests generally.",
    "Perform and report a full wood-destroying insect inspection": "Ask whether a full wood-destroying insect inspection sits inside a home inspector's standard job in NC.",
    "Leave it out of the report entirely, because the SOP excludes pests": "Ask where the leave-it-out idea came from. Find the NC SOP's pest wording and read it exactly before choosing."
  },
  "q-ca-07": {
    "Ducts in crawlspaces are excluded from the inspection": "Ask whether ductwork you can see in a crawlspace falls outside the HVAC part of the inspection.",
    "It is cosmetic, as long as the insulation jacket is still intact": "Ask whether the stem's condition is about appearance at all. Reread how the course defines cosmetic, then weigh the rest.",
    "Flex duct is designed to rest on the soil in a crawlspace": "Ask where the idea of resting flex duct on soil came from. Check the manufacturer's installation guidance or the course's duct section."
  },
  "q-ca-08": {
    "6 in": "Think about how damp wood gets that close to soil. Recall the code figure for joists.",
    "12 in": "That figure belongs to a different member in the same rule. Which framing piece is it for?",
    "24 in": "Recall the exact code figure for joists rather than a generous safety margin."
  },
  "q-ca-09": {
    "When the crawlspace is dirty, damp, or otherwise unpleasant to crawl through": "Most crawlspaces are dirty and damp. If that excused entry, how many would ever be inspected?",
    "When the client is not present to witness the entry": "Ask whether the client's presence has anything to do with your duty to inspect a space.",
    "When the home is less than 10 years old and has a warranty": "Ask whether a builder's warranty changes what the SOP asks you to inspect."
  },
  "q-ap-01": {
    "The range sits unlevel, so the oven bakes unevenly and burns food": "Leveling is handled by the range's adjustable feet. Ask whether a cooking complaint makes this a safety question.",
    "The bracket grounds the range, so without it the frame can shock you": "Think about what actually carries a ground path to an appliance frame. Is that a job for a metal bracket at the floor?",
    "It voids the manufacturer's warranty, which the client should know": "The stem asks about safety. A paperwork or warranty concern does not explain how anyone could get hurt."
  },
  "q-ap-02": {
    "Operating the cooktop burners": "Review the exclusions listed in NC SOP .1115, then check each option against that list rather than guessing.",
    "Running the dishwasher through a complete cycle": "NC spells out how an installed dishwasher is run. Ask whether something the rule describes doing could also be excluded.",
    "Operating the range hood": "A range hood is built in above the cooktop. Ask whether NC lists built-in kitchen fans among its exclusions."
  },
  "q-ap-03": {
    "To slow the drain so the pump does not run dry and burn out": "Ask whether a high loop in a drain hose changes flow speed much, and what else its height could do.",
    "To keep the hose from kinking where it bends behind the cabinet": "A loop is a deliberate bend, so it is not there to prevent bends. Ask what the height of that loop accomplishes.",
    "To keep the hose up and away from the disposal's electrical connection": "The loop's height is measured against the countertop, not the disposal's wiring. Ask what rising that high would stop."
  },
  "q-ap-04": {
    "Through the drain cycle": "Review the exact wording NC SOP .1115 uses for operating an installed dishwasher.",
    "Through a short rinse cycle": "Review the exact wording NC SOP .1115 uses for the dishwasher, including whether it is operated at all.",
    "Not operated; it is excluded": "Built-in appliances get their basic functions checked under NC. Ask where an installed dishwasher falls."
  },
  "q-ap-05": {
    "Major defect; a kitchen hood has to exhaust outdoors": "Ask whether a design that manufacturers sell and install this way is a defect, or simply a different type of hood.",
    "Safety hazard; refer to an HVAC contractor for ducting": "Think about who gets hurt by a hood that filters instead of venting. Is that an injury risk, or a comfort difference?",
    "Not reportable, since the hood was working when tested": "Ask what the NC appliance section asks you to do with a range hood, then compare each remaining option with it."
  },
  "q-ap-06": {
    "Acceptable if the run is short and the duct does not sag anywhere": "Ask whether a short, straight run changes what the duct is made of, or how that material handles heat.",
    "Acceptable as long as the lint filter is cleaned out after each load": "Ask whether the lint filter catches everything, or whether some lint still reaches the duct.",
    "Fire hazard; refer to the fire marshal before anyone uses the dryer": "Ask whether a fire marshal inspects appliance venting in a private home, and whether that referral fits a house sale."
  },
  "q-ap-07": {
    "25 ft": "25 ft is the starting point. Ask what the two bends in the stem do to that number before calling it the maximum.",
    "20 ft": "Check how much each 90 degree bend costs you, and make sure you counted both bends in the stem.",
    "10 ft": "Check the deduction per 90 degree bend. You may have taken off more per bend than the course standard does."
  },
  "q-ap-08": {
    "Into the attic, which is vented and carries the moisture away": "Attic vents move some air, but think about what warm, wet, lint-laden air does to framing over time.",
    "Into the crawlspace, below the insulation, away from living space": "Crawlspaces already fight moisture. Ask what adding a dryer's output, every load, would do to the wood down there.",
    "Outdoors, through a hood with a fine screen to stop pests": "Review the dryer exhaust standard in the course, including where the duct is allowed to end."
  },
  "q-ap-09": {
    "Acceptable while it is not leaking; note it as a monitor item": "Ask what a bulge says about the hose's inner strength. Does no leak today mean it will hold?",
    "Not reportable, because a washer is not a built-in appliance": "Ask whether not having to inspect the washer stops you from reporting a hazard you can already see.",
    "Shut off the main water valve until a plumber repipes": "Ask whether the bulge is in the building's supply piping, or in the hose that links the washer to it."
  },
  "q-ap-10": {
    "Required to be inspected for temperature": "Measuring temperature is a performance test. Ask whether the NC appliance section asks for performance numbers from anything.",
    "Required to be operated through a defrost cycle": "A defrost cycle can take hours. Think about whether an SOP would ask you to run one during a visual inspection.",
    "Required if it is a built-in model": "Built-in often means included. Ask whether NC's refrigerator rule turns on how the unit is installed."
  },
  "q-ef-01": {
    "2 in of fall within the first 5 ft": "Picture a heavy rain on that gentle slope. Would so little fall move water away before it soaks in at the wall?",
    "3 in of fall within the first 10 ft": "Ask whether that much fall would keep water moving across grass and soil, or let it pool near the wall.",
    "12 in of fall within the first 3 ft": "That is a steep bank right at the wall. Think about how far from the foundation the water needs to travel."
  },
  "q-ef-02": {
    "The slope makes the lawn look uneven, which hurts the curb appeal": "Curb appeal is a matter of taste. Ask whether a home inspection reports on how a yard looks.",
    "Runoff will slowly erode the mulch beds along the east wall over time": "Ask which consequences of grading a home inspector reports, then reread the NC exterior section before choosing.",
    "No concern; grading is outside the NC inspection, so leave it out": "Check the NC exterior section: grading and drainage are named in it. Ask in what way they are inspected."
  },
  "q-ef-03": {
    "1 in": "Think about splashback and soil moisture. Would a finger's width keep the siding edge dry and termite trails visible?",
    "2 in": "Picture rain splashing off mulch. Ask whether 2 in leaves room to see termite tubes and keep the wall base dry.",
    "12 in": "You may be thinking of a larger figure from another rule. Recheck the minimum taught for siding above soil."
  },
  "q-ef-04": {
    "Determine its R-value and note whether insulation is behind it": "Ask whether an inspector can see behind finished cladding, and whether insulation value is a cladding duty at all.",
    "Probe the vinyl panels with an awl to check for hidden decay behind them": "Probing is for a material that can rot. Ask whether vinyl decays the way wood does.",
    "Inspect it and report on safety glazing in the windows it surrounds": "Recall NC's exterior exclusions. Ask whether safety glazing is something NC asks you to report."
  },
  "q-ef-05": {
    "Vinyl is the waterproof layer, so a crack leaks straight into the wall": "Recheck the stem: it says vinyl is not the main water barrier. Does this option agree with that?",
    "The crack is cosmetic, but buyers expect it to be noted anyway": "Buyer expectation is not a reason to report. Ask whether the crack affects anything besides looks.",
    "Cracked vinyl gives off fumes in the sun that are harmful to breathe": "Vinyl siding is a common, stable exterior product. Ask whether a crack changes what the panel gives off in sunlight."
  },
  "q-ef-06": {
    "Major defect; refer to a structural engineer for evaluation": "Ask what an engineer would find in cracks with no displacement. What would make a crack structural?",
    "Safety hazard; the cracks will become a trip edge soon": "The stem says no trip edge exists. Ask whether you report a hazard that is not there.",
    "Repair; recommend sealing or replacing the driveway now": "Review how the course sorts concrete cracks into normal, repair, and safety categories."
  },
  "q-ef-07": {
    "Hairline cracks running across the full width of the driveway slab": "Full-width hairline cracks are common as concrete cures and shrinks. Ask whether that alone makes them a deficiency.",
    "Oil and rust stains near the garage that have soaked into the concrete": "Stains are about appearance. Ask whether a home inspection reports how concrete looks.",
    "Concrete that has darkened and weathered with age and exposure": "Darkening is about appearance. Ask whether color change with age is something the inspection reports."
  },
  "q-ef-08": {
    "For landscaping quality and the health of trees and shrubs nearby": "Ask whether a home inspector is trained to judge plant health, and why the SOP would mention vegetation at all.",
    "For compliance with the local storm water and erosion ordinance": "A home inspection is not a code or ordinance inspection. Ask what the SOP does want from you here.",
    "Not inspected, since site work is outside the home inspection": "Check NC .1107: vegetation, grading, and drainage are named in it. So ask how they are inspected, not whether."
  },
  "q-ef-09": {
    "8 in, or 6 in where masonry veneer is used": "Recheck the model IRC minimum. You may be carrying a larger number over from another clearance rule.",
    "4 in, or 2 in where brick veneer is used": "Think about what exposed foundation does: keeps wood off wet soil and shows termite tubes. Would 2 in do that?",
    "12 in, or 8 in where masonry veneer is used": "A foot of exposed wall is generous. Ask whether the IRC minimum is really set that high."
  },
  "q-eh-01": {
    "Acceptable; gutters are a maintenance item outside the NC SOP": "Recall what NC says about roof drainage. Are gutters part of the system you must inspect?",
    "Major defect; recommend replacing the gutters with larger, deeper ones": "Ask whether these gutters failed by being too small, or whether something is filling them.",
    "Monitor and recheck after the next heavy rain for overflow": "The stem already shows the problem: leaves and plants. Ask what waiting for rain would tell you that you do not know now."
  },
  "q-eh-02": {
    "Acceptable; downspouts are designed to end at the foundation wall": "Think about how much roof area drains into one downspout, and where all that water goes when it lands at the wall.",
    "Recommend removing the downspout so water spreads along the eave": "Without a downspout, the gutter outlet still drops its water in one spot. Ask whether that spreads anything along the eave.",
    "Not reportable, since the gutter system itself is working": "A working gutter is only part of roof drainage. Ask whether the SOP's interest stops at the gutter."
  },
  "q-eh-03": {
    "Both standards require testing the seal on each insulated window": "Ask whether a visual home inspection tests seals on every window, then reread the window wording in the NC and InterNACHI SOPs.",
    "Neither standard lets you mention fogged glass in the report": "Inspection standards rarely ban writing down something visible. Ask whether either SOP contains such a ban.",
    "NC requires reporting it and recommending the sash be replaced": "Check the window exclusions in NC .1113 before giving NC this duty."
  },
  "q-eh-04": {
    "It sits level so water can drain off both the inside and outside": "A level surface lets water sit. Ask whether a flat sill really drains water anywhere.",
    "It slopes inward toward the sash so rain stays off the siding below": "Ask where the inward-slope idea came from, then reread the course's window and trim section before choosing.",
    "It relies on paint alone, so no sealant is needed at the joints": "Review the course's description of a well-built window sill, including its slope and its trim details."
  },
  "q-eh-05": {
    "You report it as a code violation and cite the plumbing code": "A home inspection is not a code inspection. Ask whether NC wants you citing plumbing code here.",
    "You recommend a backflow test by the water utility before closing": "Think about scale: is a utility backflow test the usual next step for one hose bib at an inspection?",
    "It is excluded, so you leave it out of the report entirely": "Ask where the leave-it-out idea came from. Reread the exact wording of NC .1109 on backflow before choosing."
  },
  "q-eh-06": {
    "A pipe that crosses another pipe without a fitting between them": "The name sounds like pipe layout. Ask why NC would bother to define two pipes touching without a fitting.",
    "A direct connection between the hot and cold water supply lines": "A hot to cold link is a real plumbing fault with its own name. Recall how NC defines a cross connection.",
    "Two fixture drains that share one trap under the same sink": "Drains carry waste out of the house. Ask which side of the plumbing a cross connection rule protects."
  },
  "q-eh-07": {
    "Acceptable; exterior entry steps are exempt from handrail rules": "Ask whether a fall down entry steps is any less serious because the steps are outdoors.",
    "Acceptable; a handrail is required starting at 6 or more risers": "Ask yourself where the figure of 6 came from. Which course section covers handrails on stairs, and what riser count does it give?",
    "Structural defect; refer to a structural engineer": "Ask whether the stem says the steps are cracked, moving, or failing to carry weight."
  },
  "q-eh-08": {
    "30 to 34 in above the tread nosings": "Picture bracing a fall on the way down. This range sits a bit low for most adult hands; recheck it.",
    "36 to 42 in above the tread nosings": "You may be blending handrail height with guard height. Ask which one this range belongs to.",
    "28 to 32 in above the tread nosings": "Think about where an adult's hand rests when walking down stairs. Would this range help someone catch a fall?"
  },
  "q-eh-09": {
    "Decks and appurtenant railings": "A deck can feel like optional outdoor furniture, yet NC lists decks, balconies, stoops, and their railings among required exterior items.",
    "Entryway doors": "Entry doors are part of the house itself. Check the required list in .1107 before calling them excluded.",
    "Eaves, soffits, and fascias": "These trim the roof edge and help keep water out of the house. Check whether .1107 names them as required."
  },
  "q-eh-10": {
    "Step (sidewall) flashing": "Step flashing works along the sidewall. Ask what happens to the water at the very end of that run.",
    "Drip edge (eave) flashing": "Drip edge lines the eave, not a wall. Ask where the stem's roof edge meets the house.",
    "Valley (open metal) flashing": "Valleys form where two roof planes meet. Does the stem describe two roof planes, or a roof against a wall?"
  },
  "q-fp-01": {
    "12 in in front and 6 in on each side": "Ask whether this extension would catch a rolling log. Recheck the figures for openings under 6 sq ft.",
    "20 in in front and 12 in on each side": "Those figures belong to bigger openings. Check where the size cutoff falls and which side of it 5 sq ft sits on.",
    "8 in in front and 4 in on each side": "Picture an ember popping out onto the floor. Would 8 in of hearth in front catch it?"
  },
  "q-fp-02": {
    "It is cosmetic, though the client may want it repointed later": "Ask whether gaps in the part of the house that holds the fire are a looks issue or a job issue.",
    "It mainly weakens the draft, so smoke may roll into the room": "Draft is set mostly by the flue and damper above, not by small gaps in the firebox lining below.",
    "Firebox masonry is excluded, so report it as a courtesy note": "Check whether the SOP really excludes the firebox, or whether you are thinking of the flue interior."
  },
  "q-fp-03": {
    "Leave it alone; dampers are outside the visual inspection": "InterNACHI's fireplace section does name the damper door. A visual inspection is not purely hands-off for every fireplace part.",
    "Remove the damper plate so you can inspect the smoke shelf above": "Ask whether removing parts fits a visual inspection, or belongs to a chimney sweep.",
    "Close it and tape it shut for safety until a sweep visits": "Think about what happens if someone lights a fire under a damper that has been sealed shut. Is that safer?"
  },
  "q-fp-04": {
    "Stage 1, sooty and brushable": "Sooty deposits are soft and powdery. Ask whether shiny and hard describes something a brush would sweep off.",
    "Stage 2, crunchy and flaky": "Crunchy flakes break apart under a tool. Does the stem's description sound like that texture?",
    "It is not creosote, just heat discoloration": "Discoloration is a color change in the surface. Ask whether a tar-like deposit you can see is just color."
  },
  "q-fp-05": {
    "A Level I visual inspection by the homeowner": "Ask where the homeowner idea came from, then reread the course's chimney section on recommendations at sale.",
    "A smoke test performed by the home inspector": "The stem says your SOP does not require the flue interior. Ask whether testing the flue fits your role.",
    "No recommendation; the flue is outside the SOP": "Outside the SOP means not required, not off limits. Ask how you would help a client cover that gap."
  },
  "q-fp-06": {
    "3 ft from the ridge, 2 ft from walls, 10 ft from trees": "Ask what problem a chimney rule like this solves. Would trees and walls be the main thing it measures against?",
    "3 ft wide, 2 ft deep, and 10 ft tall at the minimum": "These sound like sizing numbers. Ask whether the 3-2-10 rule is about the chimney's size or its position.",
    "3 in clearance, 2 in air space, and a 10 in flue": "Check the units. Ask whether this rule is measured in inches or in feet."
  },
  "q-fp-07": {
    "It holds the spark arrestor screen and the rain cap in place": "Spark arrestors and rain caps are their own part. Ask what the crown's job is by itself.",
    "It narrows the flue outlet at the top to speed up the draft": "Ask whether choking a flue outlet would help or hurt draft, and whether the crown sits in the gas path at all.",
    "It is decorative trim that hides the top course of brick": "Work at a chimney top is costly to build and maintain, so little up there exists only to hide brick. Ask what job it does."
  },
  "q-fp-08": {
    "Nothing; caps are decorative and optional on masonry chimneys": "Ask where the idea that caps are only decorative came from. Reread the course's chimney section on caps before choosing.",
    "The fireplace should not be used until a cap is installed": "Ask whether a missing cap changes how a fire burns today. Is it really a stop-use condition?",
    "The chimney needs to be rebuilt with a taller flue extension": "A taller flue addresses draft. Does the stem describe a draft problem, or something missing at the top?"
  },
  "q-fp-09": {
    "A kickout flashing to turn water into the gutter": "Kickouts work at a roof edge beside a wall. Is this chimney at a roof edge, or out on the slope?",
    "A wider apron flashing to spread water around the base": "Ask where an apron flashing sits on a chimney, and whether that is the side the stem is asking about.",
    "Nothing extra, if the step flashing is sealed": "Ask whether the chimney width in the stem triggers an extra requirement under the course standard."
  },
  "q-fp-10": {
    "1/2 in": "Think about years of heat conducting through brick. Would half an inch let it dissipate before the wood suffers?",
    "1 in": "You may be recalling the figure for a chimney outside the exterior walls. Where does the stem put this one?",
    "6 in": "Ask whether you are borrowing the clearance taught for single-wall metal vent connectors instead of masonry."
  },
  "q-fp-11": {
    "The damper opening creates suction that pulls smoke upward": "A damper is an opening you control. Ask whether an opening can create pull on its own.",
    "Wind blowing across the chimney top pulls the smoke out": "Ask whether a chimney still draws on a still, windless night. If it does, what drives it?",
    "The firebox's sloped back wall forces the smoke upward": "Ask whether a short sloped wall in the firebox could push smoke up a whole flue on its own."
  },
  "q-hv-01": {
    "Filters are excluded, but a dirty one is worth a courtesy note": "Check NC's list of heating distribution items. Ask whether air filters appear on that list.",
    "The furnace safety switch will lock out until it is changed": "Ask whether every furnace has a switch tied to filter condition, or whether that is a guess.",
    "A dirty filter makes the furnace produce carbon monoxide": "Carbon monoxide comes from combustion problems. Ask whether the filter sits on the combustion side or the air side."
  },
  "q-hv-02": {
    "Downward toward the chimney at least 1/4 in per foot": "Hot gases rise. Ask which way a pipe should run to let them do what they naturally do.",
    "Level, so the gases flow evenly into the chimney": "Ask what hot gases do in a flat pipe once they start to cool. Does level help them move along?",
    "Upward toward the chimney at least 1 in per foot": "Ask where that 1 in figure came from, then reread the course's vent connector section before choosing."
  },
  "q-hv-03": {
    "Acceptable; 2 in is the standard clearance for vent pipe": "Ask whether you are thinking of a double-wall vent. Does a pipe with only one metal layer run cooler or hotter?",
    "Acceptable as long as the joist shows no charring or scorch": "Ask whether clearance rules are written around visible damage, or around what years of heat do to wood.",
    "Fire hazard; have the fire department inspect it before closing": "Ask whether a fire department inspects private homes for a sale, and who actually works on furnace venting."
  },
  "q-hv-04": {
    "Inspect the heat exchanger with a mirror and a flashlight": "Check the NC exclusions at the furnace. Ask whether heat exchangers are something you must inspect.",
    "Relight the pilot if it is out so the furnace can be tested": "Ask whether lighting a pilot is an inspector's task under NC, or something left to the owner or a technician.",
    "Determine whether each room gets enough heat from its registers": "Ask whether you can judge heat adequacy in one visit. Check whether NC lists it among exclusions."
  },
  "q-hv-05": {
    "Its temperature at the time of the inspection": "A temperature on inspection day changes by the hour. Ask what fixed fact about the room NC wants recorded.",
    "The BTU rating needed to heat that room's size": "Sizing a system is an engineering calculation. Ask whether NC asks home inspectors for load numbers.",
    "Whether the room's thermostat is calibrated and working": "Recall what NC excludes about calibration elsewhere in the SOP. Ask whether this would be required room by room."
  },
  "q-hv-06": {
    "The smaller liquid line, since it carries the coldest refrigerant": "The liquid line leaves the condenser after it has shed its heat, so it usually feels warm rather than cold.",
    "Neither, since both lines run near the outdoor temperature": "Touch both lines on a running system. Ask whether they really feel the same temperature as the outdoor air.",
    "The condensate drain line running from the indoor coil": "The stem asks about refrigerant lines at the condenser. Ask whether a condensate drain is one of those."
  },
  "q-hv-07": {
    "It is cosmetic, though the pad should be leveled at the next service call": "Cosmetic means appearance only. A machine that runs for years at a tilt raises a function question, so ask what the tilt affects.",
    "It mainly makes the fan louder, which neighbors may notice": "Ask whether neighbor noise is the kind of effect an inspector's report is built around.",
    "Not reportable, since the condenser itself is outside the SOP": "Ask whether NC's cooling section really leaves out the outdoor unit, or whether that is an assumption."
  },
  "q-hv-08": {
    "At the main panel, labeled for the condenser circuit": "Ask whether a panel breaker counts as the condenser's service disconnect, or whether a separate one is expected.",
    "Inside the house, near the thermostat that controls the unit": "Ask whether the thermostat and the disconnect do the same job. One controls cooling; what does the other control?",
    "Anywhere along the same circuit as the condenser": "Ask whether the rule sets a location for the disconnect, or accepts any switch on the circuit."
  },
  "q-hv-09": {
    "32 F": "Freezing is a common cutoff. Ask whether a compressor is safe to run on a cool day well above freezing.",
    "50 F": "Recheck the InterNACHI figure. Ask whether a compressor could be harmed on a day many people would call mild.",
    "75 F": "That is a warm day. Ask whether a cutoff that high would leave cooling untested for much of the year."
  },
  "q-hv-10": {
    "Returns mainly matter in winter, when the furnace runs": "Ask whether the cooling season uses the return ducts at all, before tying them to one season.",
    "Returns are mostly decorative grilles that balance the look": "Each return grille connects through ductwork to the air handler. A grille meant just for looks would not need a duct behind it.",
    "Returns carry exhaust gases out of the living space": "Ask whether combustion gases ever enter the house air ducts by design, or leave through a flue."
  },
  "q-hv-11": {
    "Acceptable, because the vented attic will carry the air away": "Ask whether attic vents are meant to handle a duct's full airflow, cold and damp, all season long.",
    "Major defect; replace the attic duct system before closing": "Ask how much of the duct system the stem describes. Does one loose joint condemn every run?",
    "Not reportable, since attic ductwork is outside the NC SOP": "Ask whether NC treats ducts in the attic differently from ducts anywhere else in the house."
  },
  "q-wh-01": {
    "12 in": "Recall the exact figure your plumbing sources give for TPR discharge termination height, rather than estimating from what seems like a sensible height.",
    "18 in": "You may be thinking of the garage ignition height. Recheck the TPR termination figure.",
    "24 in": "Ask how far scalding water sprays when it leaves a pipe that high, and who might be standing nearby."
  },
  "q-wh-02": {
    "Pipe the same size as the valve outlet": "Ask whether a pipe that matches the valve outlet is a problem, or whether a reduction in size would be.",
    "Termination 4 in above the floor": "Recall the maximum height above the floor for the termination. Is 4 in inside that limit or outside it?",
    "Pipe running downhill by gravity in the same room": "Ask which way water should flow in a discharge pipe so nothing traps it along the way."
  },
  "q-wh-03": {
    "The tank wall is thickest there and protects the probe": "Ask whether the probe is placed for its own protection, or to sense something about the water.",
    "The cold water inlet is at the top of the tank": "The cold inlet fitting is often on top, but a dip tube carries that incoming water down near the bottom of the tank.",
    "It keeps the probe clear of sediment at the bottom": "Ask whether avoiding sediment explains a rule about the top 6 in specifically, rather than just staying off the bottom."
  },
  "q-wh-04": {
    "Gas collects inside the tank and ignites from the burner": "Ask whether a tank water heater's burner shares space with the tank's contents, or sits sealed off below them.",
    "Sediment reacts with the steel lining and explodes when it is overheated": "Ask whether there is any explosive chemistry between sediment and steel, or whether you are guessing at a cause.",
    "Cold water hitting the hot steel cracks it open like glass": "Steel bends and tears rather than shattering, and cold water already enters a hot tank through the dip tube every time a tap runs."
  },
  "q-wh-05": {
    "You are required to estimate the remaining service life in years": "Estimating years left would be a prediction. Ask whether NC lists that among the items it obliges you to report.",
    "You are required to recommend replacing it before the closing": "A 2001 date tells you age, not condition. Ask whether NC makes age by itself a reason you must call for replacement.",
    "You may not mention the age, since that would predict failure": "Stating a manufacture date is a fact read off a label, not a forecast of when the heater will fail."
  },
  "q-wh-06": {
    "6 in": "You may be thinking of the TPR discharge figure. Ask where gasoline vapor collects in a garage.",
    "12 in": "Gasoline vapor is heavier than air. Ask whether 12 in clears the layer that pools near the floor.",
    "36 in": "Ask whether the rule really requires that much height, or whether you are adding a safety margin of your own."
  },
  "q-wh-07": {
    "It drains condensed water out of the bottom of the tank": "Ask which system the drip leg belongs to. Is it on the tank's water side or on the gas supply?",
    "It slows the gas flow so the burner lights more smoothly": "Ask whether a short capped pipe off the line could meter gas flow. What else could it do?",
    "It works as a second shutoff valve right beside the appliance": "A shutoff has a handle or valve. Ask whether a drip leg has any way to stop the flow."
  },
  "q-wh-08": {
    "Normal heat from a draft hood that is working as designed": "Ask whether scorching is ever normal on a working appliance. What would have to escape to cause it?",
    "The thermostat is set too high and the burner runs hot": "Ask whether water temperature inside the tank would scorch the outside top, right at the draft hood.",
    "The TPR valve has discharged steam onto the top of the tank": "Ask whether steam leaves scorch marks or water and rust stains, and where the TPR pipe sends its discharge."
  },
  "q-wh-09": {
    "Yes; NC requires testing it as part of the plumbing inspection": "Separate inspecting the valve from operating it. Ask whether NC makes operating it a blanket requirement.",
    "Yes, if the client is present to watch the discharge": "Ask whether the client's presence appears anywhere in NC's plumbing rules as a condition for testing a valve.",
    "Yes, if the tank is under 10 years old and has a drain pan": "Ask whether age and a drain pan change your duty under NC, or only change how a leak gets caught."
  },
  "q-wh-10": {
    "Its age, remaining life, and the condition of the anode rod": "Ask whether NC requires life expectancy, and whether an anode rod is visible without taking things apart.",
    "Its recovery rate in gallons per hour and its efficiency": "Ask whether NC asks you to judge capacity adequacy or performance at all during a visual inspection.",
    "Whether a thermal expansion tank is present and charged": "Check NC's water heater exclusions. Ask whether expansion tanks are on the required list or the excluded one."
  },
  "q-mo-01": {
    "Report nothing, since a dry reading shows the leak is fixed": "Ask what a dry reading proves about the next storm, or a leak that only shows up in certain weather.",
    "Report it as an active leak and refer to a roofer for repair": "Ask whether a dry reading supports calling the leak active, and whether you know the source is the roof.",
    "Recommend replacing the roof covering above the stained area of ceiling": "Ask whether one stain, reading dry, justifies a roof replacement before anyone has found the source."
  },
  "q-mo-02": {
    "That the drywall behind the cool spot is wet from a leak": "Ask what else besides water can make a ceiling spot read cool on a thermal camera.",
    "That mold is growing on the back side of the ceiling": "Ask whether any camera can identify a living organism behind drywall without sampling it.",
    "That the insulation above that spot is missing or thin": "Missing insulation reads warm, not cool, on a ceiling under a hot summer attic. Ask what season and conditions this image came from."
  },
  "q-mo-03": {
    "8 percent": "Ask where dry framing lumber usually reads. Could a decay threshold sit that low?",
    "12 percent": "Ask whether that figure is a warning level, or closer to where normal dry lumber sits.",
    "50 percent": "Ask whether decay waits until wood is that soaked, or can start at a much lower reading."
  },
  "q-mo-04": {
    "Acceptable; sink cabinets often get wet from normal use": "Ask whether normal use would swell a cabinet floor and leave it reading wet.",
    "Recommend replacing the countertop and sink above the cabinet": "Ask whether you know the source yet, and whether the counter is what got damaged.",
    "Monitor it and recheck the reading after a few days": "Ask whether a swollen particleboard floor that reads wet today needs more evidence before you act."
  },
  "q-mo-05": {
    "It is cosmetic, though buyers notice a stained caulk line": "Ask whether buyer opinion is what decides how an inspector classifies a condition.",
    "It mainly affects how the grout looks along the tub edge": "Caulk and grout are separate materials, and a gap in the caulk does not change how the neighboring grout looks.",
    "Caulk is outside the NC SOP, but it is a courtesy note": "Ask whether the SOP really excludes caulk, or whether you are assuming small items are out of scope."
  },
  "q-mo-06": {
    "Normal moisture after a recent shower, so no report is needed": "Look at the pattern in the stem. Would shower splash leave one wet spot with dry tile all around it?",
    "A failed shower pan liner, which you should confirm by testing": "Ask whether NC asks you to test shower pan liners, and whether a soap dish sits where a pan would be.",
    "Mold behind the tile, which you should identify and report": "Check NC's exclusions on environmental conditions. Ask whether naming mold is part of your job."
  },
  "q-mo-07": {
    "A cracked tank lid dripping onto the floor": "A lid sits on top of the tank and holds no water. Ask what a cracked lid could drip.",
    "Condensation from the tank on a humid day": "Condensation forms on the outside of the porcelain, so you would expect beads of water on the tank and bowl, not only at the base.",
    "A clogged vent stack forcing water back up": "A blocked vent usually shows up as slow drains, gurgling, or traps losing water, not as a wet floor at a single fixture."
  },
  "q-mo-08": {
    "As mold growth that needs remediation by a mold contractor": "Ask yourself where the mold call came from. Reread NC's limitations section and the course's moisture reporting guidance, then decide.",
    "As acceptable, since crawlspace wood often reads that high": "Ask where the idea that 24 percent is normal came from. Check the course's moisture meter section for its framing thresholds.",
    "As a structural failure of the joist; refer to an engineer": "Ask whether the stem describes sagging, cracking, or failure, or only moisture and staining."
  },
  "q-mo-09": {
    "The duct is leaking water that drains from the indoor coil": "Supply ducts carry air, not condensate. Ask where water on the outside of the duct is coming from.",
    "The duct is too warm, so it draws water out of the air": "Recheck how the stem describes the duct before choosing an explanation built on its temperature.",
    "Rainwater is entering through the foundation vents and collecting": "Ask whether rain entering vents explains water forming on the duct itself, all along its length."
  },
  "q-mo-10": {
    "The two stains are unrelated, and each one has its own separate source": "Review what NC and InterNACHI say about attic inspection, and what a report should do with active water stains.",
    "The ceiling drywall below has to be replaced before the closing": "Ask whether the question is about repair scope, or about what the attic stain tells you.",
    "Nothing reportable, since the attic sheathing is outside the SOP": "Ask whether NC leaves attic sheathing out, or asks you to report how the attic was inspected."
  },
  "q-ai-01": {
    "Its R-value and the year it was installed": "Ask where R-value and install year came from. Reread InterNACHI's attic and insulation section and list exactly what it says to describe.",
    "Its chemical composition and fire rating": "Chemical makeup and fire ratings come from lab testing. Ask whether the SOP's insulation wording asks you for test results.",
    "Its upgrade cost and the R-value to add": "Pricing and upgrade advice sit outside an inspector's scope. Think about describing conditions, not designing improvements."
  },
  "q-ai-02": {
    "A roof leak above that ceiling; refer to a roofer": "A thermal camera shows temperature, not wetness. Did the stem mention stains, drips, or wet framing anywhere?",
    "A plumbing leak in the ceiling; call a plumber": "Ask what evidence of water the stem gives you. A cold patch alone shows a temperature difference, not a pipe failure.",
    "Nothing, because NC excludes measuring R-values": "The R-value exclusion stops you from measuring or calculating thermal resistance. It does not tell you to stay silent about the attic."
  },
  "q-ai-03": {
    "Acceptable, because the attic itself is vented to outdoors": "Ask whether attic vents can clear a shower's worth of moist air before it reaches cold sheathing.",
    "Refer to a structural engineer for moisture damage to the roof deck": "Ask whether the stem describes damage to the roof framing, and what a structural engineer would assess here.",
    "Not reportable; exhaust fans are not in NC scope": "Ask whether NC lists bathroom venting among the systems you are required to inspect."
  },
  "q-ai-04": {
    "Stop wind-driven rain from entering through the soffits": "Baffles sit inside the attic, not at the soffit face. What could a part in that position do about rain outside?",
    "Hold the insulation tight against the roof deck": "Attic insulation rests on the ceiling by gravity at the eaves; it does not need a part to press it up against the roof deck.",
    "Block birds and insects from nesting in the eaves": "Screens on vent openings handle pests. Baffles sit further inside the attic, so think about what they touch there."
  },
  "q-ai-05": {
    "1 sq ft per 50 sq ft, or 1 per 100 with a ridge vent": "Those ratios call for far more vent area than real attics carry. The base number sits in the hundreds, not the fifties.",
    "1 sq ft per 1,500 sq ft, or 1 per 3,000 with soffits": "Picture one square foot of vent serving a 1,500 square foot attic. Would that small an opening move much air at all?",
    "1 sq ft per 300 sq ft, or 1 per 600 with a vapor retarder": "A vapor retarder does appear in the venting rule. Recheck whether both numbers here match the IRC base and reduced ratios."
  },
  "q-ai-06": {
    "No; moving insulation is outside the inspection scope": "NC does name situations where you must move insulation. Ask what would make you look underneath it.",
    "In each attic, at several spots, to check the drywall": "The SOP does not set a routine sampling quota. Think about what should trigger moving insulation instead.",
    "When the client asks and is present to watch": "Ask whether a client's request is what sets an inspector's duties under the SOP."
  },
  "q-ai-07": {
    "Acceptable if the ladder holds your full weight when you test it": "Ask whether one test load today tells you how brittle screws behave after years of use.",
    "Refer to a structural engineer to evaluate the ceiling framing": "Ask what in the stem points at the ceiling framing. Is a structural engineer the trade for ladder hardware?",
    "Not reportable, because attic stairs are excluded": "Ask whether the SOP exclusions you studied actually name attic stairs, or a ladder you can see and use."
  },
  "q-ai-08": {
    "14 in by 20 in": "Picture an adult with a flashlight squeezing through 14 by 20 in. Would that fit a body comfortably?",
    "18 in by 24 in": "Close to some figures you may know, but the course number is larger on both sides. Picture an adult with tools fitting through.",
    "30 in by 36 in": "That is near doorway size, not a ceiling hatch. Recall that one number in this rule belongs to the headroom above."
  },
  "q-ai-09": {
    "Each one in the house": "Operating every door and window is thorough, but ask whether the NC SOP actually demands all of them.",
    "Those in the bedrooms": "Bedrooms matter for egress, but ask whether NC limits this duty to one type of room.",
    "One per floor of the house": "A whole floor can hold many rooms with different problems. Ask what unit NC actually counts by."
  },
  "q-ai-10": {
    "Repair item; recommend sanding and repainting the edge": "Ask where the repaint call came from, then reread the NC SOP and judge the stem's details again.",
    "Monitor for structural movement around the frame": "Movement shows up as binding, sticking, or gaps. What did the stem say about how this door swings and latches?",
    "Refer to a carpenter to evaluate the door": "A referral needs a reason. Ask what defect a carpenter would actually be evaluating on this door."
  },
  "q-ai-11": {
    "Nothing more; a fan that pulls air is working": "One passing test seldom finishes an inspection item. Ask what else about a bath fan you would still want to check.",
    "The fan motor's amperage, using a clamp meter": "Clamp meter readings on a fan motor go beyond a visual inspection. What could you check just by looking?",
    "The fan's noise rating, printed on the housing label": "Noise is a comfort spec, not a defect. Think about what failure could make a working fan still a problem."
  },
  "q-ai-12": {
    "Call it mold and recommend remediation by a mold specialist": "Check what NC says about determining mold. Can you name a substance you cannot confirm by sight?",
    "Call it normal aging of the plywood sheathing": "Plywood ages fairly evenly. Ask why darkening would cluster near the eaves if age alone caused it.",
    "Call it a roof leak and recommend roof replacement": "Is one patch of discoloration enough to diagnose a leak, let alone justify a whole new roof?"
  },
  "q-dk-01": {
    "Acceptable if there are many nails at close spacing along it": "Ask what a ledger has to resist besides gravity, and whether nail count alone settles that.",
    "Acceptable on smaller decks, under about 10 ft wide": "Ask whether the fastener rule changes with deck size, or whether a small crowded deck still loads its ledger hard.",
    "Monitor it, unless the ledger is visibly pulling away": "Ask where the monitor approach came from. Reread the course's deck section on ledger connections before choosing."
  },
  "q-dk-02": {
    "To give the deck a finished look where it meets the siding": "Flashing hides under the siding laps. Ask what job a hidden part does, rather than how it looks.",
    "To keep termites and carpenter ants out of the ledger": "Insects reach wood from the soil and through cracks. A strip along the ledger top is a poor place for a pest barrier.",
    "To stop the ledger from swelling and expanding in heat": "A thin strip lapped over the ledger cannot restrain wood movement, and heat expansion in lumber is minor anyway."
  },
  "q-dk-03": {
    "Brick is acceptable as long as the through-bolts are galvanized": "Galvanizing addresses rust on the bolt. Ask whether corrosion is really the concern this question raises.",
    "Bolts through brick hold better than lag screws in wood": "How well a fastener holds depends on more than its type. Comparing bolts with lags does not explain why this setup is a problem.",
    "It is a cosmetic concern, since the mortar may crack": "Cosmetic means appearance only. Ask whether a question about how a deck is attached is mainly about looks."
  },
  "q-dk-04": {
    "Acceptable if most of the holes are filled with nails": "Ask where the idea that most holes is enough came from. Check a hanger maker's installation instructions before choosing.",
    "Acceptable, because screws are stronger than nails": "Ask whether stronger in one direction means stronger in shear, which is how a hanger is loaded.",
    "Imminent collapse; tear down the deck and rebuild it": "Ask whether the stem describes broken or rotted framing. Does tearing down the deck match what you see?"
  },
  "q-dk-05": {
    "A 6 in sphere": "That size belongs to a different spot on a stair guard. Ask what the general baluster rule is protecting.",
    "A 2 in sphere": "That gap would be tighter than needed. Ask what body part the sphere stands for and roughly how big it is.",
    "A 5 in sphere": "Think about the size of a small child's head, and which sphere sizes code commonly uses."
  },
  "q-dk-06": {
    "On each deck, whatever its height above the ground": "A deck one step above the lawn does not need a guard. Ask what height actually triggers one.",
    "Above 48 in, measured at the deck's outer edge": "48 in is a figure some people carry over from other rules. The deck guard trigger is a lower height.",
    "When the deck has stairs or is over 24 in high": "Stairs bring handrail rules, not guard rules. Check the height number you remember against the guard trigger."
  },
  "q-dk-07": {
    "30 in": "That number is the height that triggers a guard, not the guard's own height. Keep the two apart.",
    "32 in": "Ask where 32 in comes from. Compare it with the guard trigger height and the residential guard figures you learned.",
    "48 in": "Ask whether that figure fits a residential deck, or whether you are thinking of taller guards in other building types."
  },
  "q-dk-08": {
    "To make the rail stiffer at the spot where people grab it": "Ask whether a return at the very end adds much stiffness to a rail already fixed along its run.",
    "For appearance, so the rail looks neat and finished at the end": "Ask whether a code rule would exist only for a neat look, and what else a rail's end could affect.",
    "To keep rainwater from soaking into the exposed cut end grain": "The return rule applies to metal rails too, which have no end grain. Think about the people using the rail."
  },
  "q-dk-09": {
    "Acceptable, because ground-contact treated wood resists rot": "Ask whether treated wood is rot-proof or only rot-resistant. What did the probe just tell you?",
    "Condemn the deck; recommend demolishing it and building new": "Ask how much of the deck the stem says has failed. Does one soft post decide the whole structure?",
    "Not reportable, since probing is an invasive test": "Ask whether NC requires probing where you suspect deterioration, even in a visual inspection."
  },
  "q-dk-10": {
    "10 psf": "Think of a crowded party on the deck. Would 10 pounds per square foot cover that crowd?",
    "20 psf": "Ask what the design case is for a deck. A packed party loads it more than you might expect.",
    "100 psf": "Ask whether a residential deck is really designed like a warehouse floor, or around people and furniture."
  },
  "q-rf-01": {
    "Walk on the roofing when it is safe to do so": "Check whether NC makes walking the roof a duty, even when it looks safe to do so.",
    "Inspect solar panels, antennas, and other accessories": "Ask whether add-ons mounted on the roof fall under the roofing inspection, or are things the SOP sets aside.",
    "Certify the roof's remaining life for insurance": "Ask whether NC lets inspectors predict or certify life expectancy for any component."
  },
  "q-rf-02": {
    "It is cosmetic until the rubber falls away": "Ask whether a roof part has to fail completely before an inspector reports it.",
    "It restricts airflow through the plumbing vent": "The boot wraps the outside of the pipe. Does a crack in it change anything inside the vent?",
    "Boots are part of plumbing, not the roof": "Ask whether a part's trade decides if an inspector reports it, when the part sits on the roof."
  },
  "q-rf-03": {
    "1 in": "One inch barely clears the roofing. Recall the general extension figure, not the smallest number you can picture.",
    "12 in": "Ask whether you are mixing up the general rule with the higher figures used in snow country.",
    "3 ft": "That rise belongs to special cases, such as a vent near an openable window. What is the general figure?"
  },
  "q-rf-04": {
    "Supplies combustion air to an attic furnace": "Ask whether a vent at the very top of the roof would make sense as a fresh air supply for a furnace.",
    "Cools the shingles from below to slow their aging": "Ask what the ridge vent moves through the attic, rather than what it does to the shingles above it.",
    "Lets the roof deck expand along the ridge in heat": "Ask whether an opening at the ridge is about wood movement, or about the attic's air path."
  },
  "q-rf-05": {
    "Shingle granule loss on the north-facing slopes": "Granules sit on the top surface of the shingles. Where would you stand to see that?",
    "Gutter condition and the downspout slope": "Gutters hang outside at the eaves. Ask which items you could see only from inside the house.",
    "Chimney crown cracks and missing mortar caps": "The crown caps the chimney outdoors. Where would you need to be to see it?"
  },
  "q-rf-06": {
    "Extend 1 ft above the landing, 1 ft out per 2 ft of rise": "One foot above the landing leaves almost nothing to hold on to while stepping on or off the ladder.",
    "Rest against the gutter, 1 ft out per 4 ft of height": "Ask whether a gutter is built to carry a ladder plus a person's weight.",
    "Stand upright against the wall, 3 ft above the eave": "Ask what keeps a ladder from tipping backward when it stands straight up against a wall."
  },
  "q-rf-07": {
    "The roof covering, flashing, and the ridge vents": "Those parts keep water out of the roof. Ask which parts handle water once it has left the roof surface.",
    "Gutters, plus the municipal storm sewer at the street": "Ask where an inspector's scope ends. Is anything under the street part of the house you are inspecting?",
    "Interior floor drains and the sump pump pit": "Ask whether these handle roof water, or water that is already inside or under the house."
  },
  "q-rf-08": {
    "Antennae, satellite dishes, and their roof mounts": "Reread InterNACHI 3.1 twice: once for what you shall inspect, once for what you are not required to inspect.",
    "Lightning arrestors and their ground wiring": "Compare each option against the two lists in InterNACHI 3.1: the items you shall inspect and the items set aside.",
    "De-icing cables along the eaves and gutters": "Recall the InterNACHI 3.1 roof section as two lists, required and not required, and place each option on one."
  },
  "q-ra-01": {
    "Bond the shingles together into one sealed layer": "Shingles bond to each other through a factory sealant strip, not through the loose granules on their faces.",
    "Seal around the nail holes when the sun warms them": "Nails are meant to be hidden under the next course. Would surface granules ever reach them?",
    "Make the shingle waterproof, so underlayment is optional": "The asphalt itself is the water-shedding part of a shingle, and underlayment is called for under shingles regardless."
  },
  "q-ra-02": {
    "They mean the roof has failed and needs replacing now": "Ask whether the stem describes a roof-wide failure or several nails. Does that add up to a new roof?",
    "They matter in hurricane zones, not in normal weather": "Ask whether the concern with an exposed nail head depends on wind at all.",
    "Exposed nails are normal along the ridge and hips": "Ask what covers the nails at ridge and hip caps on a correct install. Should heads show anywhere?"
  },
  "q-ra-03": {
    "Through the exposed tab, so the wind will not lift it": "Ask what happens each time rain hits a nail head left out in the open.",
    "Above the nailing line, near the top edge of the shingle": "Nails set too high can miss the shingle below. Ask what that does to wind resistance.",
    "On the exposed tab, as long as each head is sealed": "Sealant on an exposed head ages in the sun. Ask whether a properly placed nail ever needs that sealant."
  },
  "q-ra-04": {
    "Supports the gutter and keeps it pitched toward the downspout": "Ask whether a thin metal strip at the roof edge is built to carry a gutter full of water.",
    "Decorative trim that hides the cut edge of the deck": "Ask what would happen at the roof edge without it, beyond how the edge looks.",
    "Vents the attic at the eave, like a soffit strip": "Drip edge is solid metal at the edge of the deck. Ask whether air passes through it at all."
  },
  "q-ra-05": {
    "Shingles from both planes are woven together through the valley": "Weaving is its own valley method. Ask what the word cut in closed-cut suggests.",
    "An open metal channel is left exposed, with shingles cut back": "Ask what the word closed suggests about whether any valley metal shows.",
    "Shingles from each side meet at the center line with no underlayment": "Valleys collect water from two roof planes. Would any accepted method skip underlayment there?"
  },
  "q-ra-06": {
    "1:12, with double underlayment below 3:12": "Asphalt shingles shed water by lapping. Ask whether a slope that flat lets them shed water at all.",
    "3:12, with double underlayment above 6:12": "Ask whether steeper slopes need more protection or less. Water moves faster as the roof gets steeper.",
    "4:12, with double underlayment from 4:12 to 6:12": "Ask where extra underlayment belongs: at the steeper end, or at the low-slope end where water slows down."
  },
  "q-ra-07": {
    "6 in past the outer edge of the gutter": "The ice barrier is laid on the roof deck, not on the gutter. Where does an ice dam push water?",
    "12 in up the roof from the drip edge": "Ice dams back water up the slope. Ask whether a foot of barrier reaches far enough past where it pools.",
    "36 in up the slope from the eave edge": "Ask whether you are recalling the right distance, and whether more barrier always means the rule is met."
  },
  "q-ra-08": {
    "A third layer is fine if longer nails reach the deck": "Review the rules for roofing over existing shingles taught in the 25 Standards course before choosing among the remaining options.",
    "Re-covering is better, since the old layers add insulation": "Asphalt shingles add very little insulating value; a layer of them insulates about as much as thin plywood.",
    "Layer count does not matter for asphalt shingles": "Review what the 25 Standards course teaches about roofing over an existing asphalt roof before choosing again."
  },
  "q-fd-01": {
    "Normal shrinkage of the mortar as it slowly cures": "Ask whether curing shrinkage would follow a long, stepped diagonal path through many joints.",
    "Lateral soil pressure pushing the wall inward": "Ask which crack pattern goes with a wall pushed inward. Is it stepped and diagonal, or does it run along one course?",
    "Freeze-thaw damage to the block faces and joints": "Freeze-thaw tends to damage the faces of the blocks. Ask what a crack stepping through the joints points to."
  },
  "q-fd-02": {
    "It is typical shrinkage of block walls as mortar cures": "Curing shrinkage happens in the first months after construction and leaves fine hairline cracks, usually in the mortar joints.",
    "It comes from the house settling evenly on its footings": "Even settling moves the whole house down together. Would that bow one wall inward?",
    "It is cosmetic once it has been painted and sealed": "Paint can hide a crack, but can it stop a wall that is still moving?"
  },
  "q-fd-03": {
    "Mold growth on the block; recommend professional remediation": "Mold needs organic food, and bare concrete block offers very little. Also recall that NC excludes determining mold.",
    "Early structural failure of the block faces": "The stem says the wall is otherwise sound. Ask whether a surface deposit alone shows structural damage.",
    "Termite mud tubes; refer to a pest control company": "Mud tubes are brown, earthy tunnels. Ask whether white powder on a wall face matches that."
  },
  "q-fd-04": {
    "Acceptable, since masonry piers crack as they age": "Ask whether a crack running through several blocks is the same as minor aging in the mortar.",
    "Patch it with mortar and note it as repaired": "Patching is repair work and hides the evidence. Ask what an inspector does instead of fixing.",
    "Monitor it, since the pier is not leaning": "Leaning is a late sign. A crack through the blocks themselves, not just the mortar joints, tells you something before any lean."
  },
  "q-fd-05": {
    "Acceptable; stacked shims are a normal way to level it": "Ask whether shims being allowed means that loose, crushed shims are allowed too.",
    "Foundation failure; refer for underpinning": "Ask whether anything in the stem says the pier or its footing has sunk or cracked.",
    "Not reportable without first calculating the load": "Ask whether reporting a support problem you can see requires any calculation under NC rules."
  },
  "q-fd-06": {
    "10 ft apart, with one within 36 in of each end": "Ask whether bolts that far apart would keep a house from sliding under lateral load. Recall both numbers.",
    "4 ft apart, with two bolts at each plate end": "Ask whether the rule you remember calls for paired bolts at the ends, or a single bolt near each end.",
    "8 ft apart, with one at the center of each plate": "Ask where a plate is most likely to lift or slide: at its middle, or near its ends?"
  },
  "q-fd-07": {
    "The depth and width of the footings below grade": "Footings sit below grade, and NC does not require you to dig or move soil to reach hidden parts.",
    "The compressive strength of the foundation concrete": "Concrete strength comes from lab tests on cylinders or cores, and the SOP excludes calculating strength or adequacy.",
    "The soil type and its bearing capacity below the footings": "Soil bearing capacity comes from geotechnical testing, and NC also excludes geological and soil conditions."
  },
  "q-fd-08": {
    "Calculate the load on the pier to judge its adequacy": "NC lists calculating the strength or adequacy of a system among the things inspectors are not required to do.",
    "Specify the repair method so the seller can get bids": "Ask whether reporting methods of correction is part of your role, or someone else's.",
    "Estimate the cost of a new pier for negotiations": "Ask whether NC lets inspectors report costs of correction, even when the client wants a number."
  },
  "q-rt-01": {
    "Walk on the tiles near the center of each slope": "Ask what happens to clay tile under a person's weight, wherever on the slope you step.",
    "Walk on the tiles along the ridge, where they are strong": "Ask whether any part of a clay tile roof is safe to walk, and who pays if a tile breaks.",
    "Lift a few tiles to see the condition of the underlayment": "Seeing the underlayment means removing roof covering, which goes beyond what NC asks an inspector to expose."
  },
  "q-rt-02": {
    "It is cosmetic, since tile is mostly there for looks": "Clay tile is costly and heavy. Few owners would carry that load on their framing for appearance alone.",
    "Cracked tile still sheds water; replace it at resale": "Replacing at resale ties the repair to a sale date. Ask whether the roof's condition follows that schedule.",
    "It matters on new roofs still under warranty, not older ones": "Ask whether a warranty changes what an inspector reports, or only who pays for the fix. Then reread the course's tile roof section."
  },
  "q-rt-03": {
    "Normal thermal movement of the tiles in summer heat": "Ask whether ordinary heat movement would pull tiles fully out of their courses.",
    "The roof slope is too steep to hold the tile in place": "Tile is routinely installed on steep slopes, and a slope problem would affect the whole roof, not just the eave tiles.",
    "An installation laid too tight, pushing the tiles out": "Ask which direction a too-tight fit would push tiles, and whether that matches tiles sliding down at the eave."
  },
  "q-rt-04": {
    "The tiles themselves, which are fully waterproof": "Ask where the idea that tile alone is waterproof came from. Reread the course's tile roof section on what each layer does.",
    "The mortar packed between the tiles at the laps": "Mortar is porous and cracks with movement, and it is used mainly to bed hip and ridge tiles, not to seal field laps.",
    "The glaze or sealer coating on the tile surface": "A glaze sits on the tile face. Ask whether it covers the gaps between tiles."
  },
  "q-rt-05": {
    "2:12; double underlayment up to 4:12": "That figure belongs to a different roof covering in this course. Ask whether tile shares it.",
    "1-1/2:12; double underlayment up to 3:12": "Ask whether tile, which sheds by lapping, could handle a slope flatter than the asphalt shingle minimum.",
    "3-1/2:12; double underlayment up to 6:12": "Check both numbers against the asphalt rule you know. Is tile's minimum really that far above it?"
  },
  "q-rt-06": {
    "Major defect; mortar fails over time": "Even when mortar needs attention, the label major is kept for serious conditions such as structural or safety issues.",
    "Repair item; recommend repointing": "Repointing fixes mortar that is cracked or loose. What did the stem say about this mortar?",
    "Monitor it and re-inspect yearly": "Ask whether NC asks inspectors to schedule future visits, and what a yearly re-inspection would add."
  },
  "q-rt-07": {
    "It is in scope and inspected the same as the main house": "Check what NC .1107 says about buildings that stand apart from the house.",
    "It may not be inspected, even if the client asks": "An SOP sets a minimum for an inspection. Ask whether a minimum also forbids doing anything beyond it.",
    "Its electrical and roof are inspected, nothing else": "Ask whether the SOP carves out particular systems of a detached building, or treats the building as a whole."
  },
  "q-rt-08": {
    "A roof that holds shingles will hold tile as well": "Ask whether shingles and tile weigh about the same per square foot of roof.",
    "The underlayment needs upgrading, but not the framing": "Review what the 25 Standards course says about changing roof covering types on existing framing before choosing again.",
    "Tile is lighter than asphalt, so framing is fine": "Look up typical installed weights per square for clay tile and asphalt shingles, then reread the remaining options."
  },
  "q-eg-01": {
    "36 in above the floor": "Lower sills are allowed; the question asks for the highest permitted. Is that figure really this low?",
    "48 in above the floor": "Picture a small child or an impaired adult trying to climb over a sill four feet up.",
    "54 in above the floor": "Picture a small child trying to climb over a sill at an adult's chest height. Could they?"
  },
  "q-eg-02": {
    "Bedrooms on upper floors, not the ground floor": "Ask whether a sleeping person on the ground floor is any less likely to be trapped by a fire.",
    "Each habitable room, including the kitchen": "Ask who is most likely to be trapped in a fire, and which rooms they would be in.",
    "The primary bedroom and the basement": "Ask whether a child asleep in a secondary bedroom faces less risk in a fire than the owners."
  },
  "q-eg-03": {
    "4 sq ft, with 24 in of projection and width": "Picture an adult climbing into a 2 ft by 2 ft well. Would that leave room to climb back out?",
    "10 sq ft, with 42 in of projection and width": "Recheck both numbers, and ask whether the projection and width you picked actually produce the area listed.",
    "7 sq ft, with 32 in of projection and width": "Picture an adult in a winter coat climbing out of a well under 3 ft across. Is there room?"
  },
  "q-eg-04": {
    "Acceptable, since the bars improve the bedroom's security": "Ask whether security is the only job a bedroom window has under the rules you studied.",
    "Refer to the fire marshal to condemn the bedroom": "Ask whether a fire marshal inspects private homes for a sale, and whether closing off a room is your call.",
    "Acceptable if the bedroom door leads to two exits": "Ask whether the escape rule counts exits through the door, or treats the window on its own."
  },
  "q-eg-05": {
    "Mark them acceptable, since a release lever is present": "Ask whether seeing a release lever tells you everything you need to report about these bars.",
    "Operate the release yourself, using force if needed, to be sure": "Not required to operate does not mean you should force it. Ask what forcing a mechanism could break.",
    "Report them as a code violation and recommend removal": "Inspectors are not code officials. Ask whether a release lever makes removal the right recommendation."
  },
  "q-eg-06": {
    "A 4 in sphere must not pass": "The 4 in rule covers most of the guard. Ask whether the stair triangle is treated the same way.",
    "A 2 in sphere must not pass": "That gap would be tighter than anywhere else on the guard. Ask whether the triangle is stricter or looser.",
    "No test applies to the triangle": "Ask whether a child could slip through that triangle if no rule applied to it."
  },
  "q-eg-07": {
    "A door from the garage into an inside hallway": "Ask where the concern about hallway doors came from. Reread the 25 Standards garage section and what it says about each opening.",
    "A solid 1-3/8 in door from the garage into the kitchen": "Notice the door spec given. Ask why a course would name a solid door of that thickness.",
    "An overhead door with photo-eyes and an auto-reverse": "Photo-eyes and auto-reverse are safety features. Ask whether they sound like what the course calls hazardous."
  },
  "q-eg-08": {
    "28 in of clear width and 72 in of height": "Six feet of height would make many adults duck. Recall the IRC minimums, which are larger on both counts.",
    "36 in of clear width and 84 in of height": "Ask whether you are remembering a common door size rather than the minimum clear opening the IRC requires.",
    "30 in of clear width and 80 in of height": "80 in is a common door height. Ask whether you are remembering the door slab, not the IRC clear opening figures."
  },
  "q-eg-09": {
    "18 in": "Ask whether a step this low would really need a guard. Recall the height that triggers one.",
    "24 in": "Ask whether you are remembering a figure from another rule. Recheck the guard trigger height.",
    "42 in": "That is closer to guard heights in other building types. Ask what height above the floor triggers a residential guard."
  },
  "q-pl-01": {
    "It drains too slowly and clogs more than a P-trap": "Ask whether trap shape changes drain speed much, or matters for a different reason.",
    "It is a dated style choice with no real effect": "Model code prohibits S-traps. Ask what a mere style difference would fail to explain about that ban.",
    "It wastes water each time the fixture is used": "Water use is set by the faucet and how long it runs, not by the shape of the trap below."
  },
  "q-pl-02": {
    "1/2 to 1 in": "Ask how long a shallow seal would last against evaporation or a siphoning pull.",
    "4 to 6 in": "Ask what a deep seal collects over time at the bottom of the trap.",
    "6 to 8 in": "A very deep seal holds standing water low in the trap. Ask what settles there over time."
  },
  "q-pl-03": {
    "Yes, cycle each stop to prove it shuts off": "Thoroughness is good, but ask whether your SOP's plumbing section lists stop valves among the things you operate.",
    "Yes, but just the hot side, where scale builds up": "Scale does build on hot lines, but that makes an old hot stop more likely to stick or leak, not less.",
    "Yes, if the client asks you to check them": "Ask whether your SOP ties what you operate to client requests, or to a fixed list in its plumbing section."
  },
  "q-pl-04": {
    "It is the modern standard, replacing rigid PVC drain pipe": "Ask whether newer and flexible means a material is allowed for drains, and where you would check.",
    "It is acceptable if the run is short and well sloped": "Ask whether a short run changes what kind of pipe this is, or only how much of it there is.",
    "It matters at bathroom sinks, not at the kitchen sink": "Ask whether drain material rules in model plumbing codes change from one room's sink to another's."
  },
  "q-pl-05": {
    "Sewage hazard; refer to the health department": "Ask what a county health department oversees, and whether one joint in a private drain line is theirs.",
    "Not reportable, because the crawlspace is excluded": "Ask whether NC excludes the crawlspace, or asks you to inspect the plumbing you can reach and see there.",
    "Monitor it and re-check at the final walkthrough": "Ask whether an active drip you can see today is something to wait on, and who attends a final walkthrough."
  },
  "q-pl-06": {
    "Report it as polybutylene, a known failure-prone pipe": "Polybutylene and PEX are both flexible plastic, but they are different materials with different markings and track records.",
    "Report it as a defect, since plastic supply is not allowed": "Ask whether modern approved supply materials include any plastics.",
    "Recommend replacing it with galvanized steel piping": "Galvanized steel corrodes inside over time. It is the material many older houses are replacing, not a modern upgrade."
  },
  "q-pl-07": {
    "6 to 12 in": "Ask what a short standpipe does when a washer pumps out water fast.",
    "12 to 18 in": "Ask whether this range is tall enough to catch the surge from a washer's pump without spilling.",
    "42 to 60 in": "Ask what a very tall standpipe does to the trap below as fast water falls through it."
  },
  "q-pl-08": {
    "Acceptable, since toilets can rock a little": "Toilets are designed to sit firm on the floor. Ask whether any rocking at all is a normal design condition.",
    "Cosmetic, once the caulk at the base is redone": "Caulk at the base holds nothing down. Ask whether fresh caulk would stop the movement you felt.",
    "Tighten the flange bolts yourself and move on": "Tightening bolts is a repair. Ask whether repairs are part of a home inspector's role during an inspection."
  },
  "q-pl-09": {
    "A flow rate of at least 5 gallons per minute at the main": "Ask whether NC defines this term by a measured number, or by how fixtures work in use.",
    "Steady flow at the kitchen faucet with nothing else on": "Ask whether NC asks you to judge flow at one faucet, or something about the system as a whole.",
    "Static water pressure above 40 psi at the hose bib": "Static pressure is read with nothing flowing. Ask whether that tells you how fixtures perform in use."
  },
  "q-pl-10": {
    "40 psi": "Ask whether that figure is the high or the low end of a comfortable pressure range.",
    "60 psi": "Ask whether 60 psi would stress hoses and valves, or sits comfortably within the typical range.",
    "120 psi": "Ask how long hoses and the water heater would sit under stress before pressure climbed that high."
  },
  "q-pl-11": {
    "Whether the water supply is public or a private well": "Check whether NC asks you to decide the source of the supply, or to describe something you can see on site.",
    "The water quality from the well, by test kit": "Ask whether testing water quality fits a visual inspection under NC rules.",
    "Whether a backflow device is present at the main": "Check what NC says about backflow devices before listing one as a required description."
  },
  "q-pl-12": {
    "To let rainwater in to flush the drain lines": "Ask whether anyone would want rainwater entering a drain system through the roof.",
    "To cool the drain pipes when hot water is draining": "Ask whether drain pipes need cooling at all, and what else a vent might carry.",
    "To raise water pressure at the upper fixtures": "Drains and supply are separate systems. Ask whether a drain vent could affect supply pressure."
  },
  "q-st-01": {
    "Acceptable if the cut is small and near the end": "Ask whether a truss member has spare capacity to give up, even near its ends.",
    "Acceptable if the ceiling below has no cracks": "Ask whether a ceiling that looks fine today proves the truss is carrying its load as designed.",
    "Repair it by nailing a scrap board over the cut": "Repairs are outside a home inspector's role, and you would own whatever your fix did to the house."
  },
  "q-st-02": {
    "One-half of the joist depth (D/2)": "Picture a joist with half its depth cut away. Would the outer thirds still carry their load?",
    "One-third of the joist depth (D/3)": "Ask whether you are remembering the hole rule rather than the notch rule. They use different fractions.",
    "One-quarter of the joist depth (D/4)": "D/4 is a real notch figure. Ask which location along the span it applies to."
  },
  "q-st-03": {
    "No larger than D/2, close to the top or bottom edge": "Ask where in a joist the fibers carry the most stress, and whether a hole belongs there.",
    "No larger than D/6, at least 2 in from each edge": "D/6 belongs to a different rule. Ask whether holes and notches share the same limit.",
    "As large as needed, as long as it is centered": "Centering helps, but ask whether a hole of any size leaves enough wood to carry the load."
  },
  "q-st-04": {
    "Structural movement; refer to an engineer to evaluate": "Ask what signs of movement you would expect: offset, widening, binding doors. Does the stem show any?",
    "Foundation failure; recommend underpinning the piers": "Ask whether a single hairline crack justifies a major repair, and whether recommending methods is your role.",
    "Moisture damage; refer to a roofer to find the leak": "Ask what evidence of water the stem gives you. A taped joint crack alone shows no staining."
  },
  "q-st-05": {
    "Dead load is snow on the roof; live load is the wind": "Model code treats snow and wind as their own load types. Ask what dead and live each describe.",
    "Dead load is what a failed member carries; live, a sound one": "Ask whether these terms describe a member's condition, or the kinds of weight a building carries.",
    "They are two names for the same total design load": "If the two terms meant the same thing, why would NC define a structural component as carrying both?"
  },
  "q-st-06": {
    "Joists to trusses to walls to footings to soil": "Trusses carry the roof. Ask what floor joists rest on in a crawlspace house built on piers.",
    "Girder to joists to piers to footings to soil": "Ask which member is larger and collects load from the others. Which one bears on which?",
    "Joists to piers to girder to footings to soil": "Sketch the crawlspace framing from the floor surface downward, drawing each member where it sits, before choosing again."
  },
  "q-st-07": {
    "Foundation settlement under the interior wall each winter": "Ask whether settlement would open a gap in winter and close it again every summer.",
    "Seasonal shrinkage of the drywall tape at the wall corner": "Ask whether tape shrinkage would reverse itself each summer. What could move back and forth with the seasons?",
    "Roof leaks soaking and sagging the ceiling drywall": "A wet, sagging ceiling would show stains, and it would not close up on its own each summer."
  },
  "q-st-08": {
    "The adequacy of the foundation anchor bolting": "Reread InterNACHI 3.3 and list what it says you shall report, then compare each option to that list.",
    "The load capacity of each floor joist and girder": "Recall the exact items InterNACHI 3.3 tells you to report, and check each remaining option against them.",
    "The engineering design of the roof truss system": "Ask whether reviewing a truss system's engineering design is something an inspector does on site."
  }
};

// Quizzes that skip the retry and go straight to the explanation. Empty since every "Best report?" item got an overcall distractor (2026-11-08).
export const NO_RETRY = [];
