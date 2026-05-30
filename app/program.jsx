// program.jsx — the training-program engine.
// Generates per-day planned sessions from the embedded camp program, plus the
// target weight curve. Pure functions, no React. Exports to window.

// The camp clock. Anchored to the camp start so the seeded narrative reads true.
const APP_TODAY = '2026-05-29';
const FIGHT_DATE = '2026-09-16';

// ---- date utils (local, no timezone surprises) ----
function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function toISO(dt) { return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; }
function addDays(s, n) { const d = parseISO(typeof s === 'string' ? s : toISO(s)); d.setDate(d.getDate() + n); return toISO(d); }
function weekdayMon0(s) { const d = parseISO(s).getDay(); return (d + 6) % 7; } // 0=Mon .. 6=Sun
function startOfWeek(s) { return addDays(s, -weekdayMon0(s)); }
function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
function fmtShort(s) { const d = parseISO(s); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function fmtWeekday(s) { return parseISO(s).toLocaleDateString('en-US', { weekday: 'short' }); }
function fmtTime(t) {
  if (!t) return '';
  const m = /^(\d{1,2}):(\d{2})/.exec(t); if (!m) return '';
  let h = +m[1]; const min = m[2]; const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${min} ${ap}`;
}
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---- session type metadata ----
const TYPES = {
  box:      { key: 'box',      label: '1-on-1 boxing', short: 'Boxing',   glyph: '🥊', dot: '#f5c518' },
  spar:     { key: 'spar',     label: 'Sparring',      short: 'Sparring', glyph: '🥋', dot: '#e0683a' },
  group:    { key: 'group',    label: 'Group boxing',  short: 'Group',    glyph: '👥', dot: '#b061c4' },
  hiit:     { key: 'hiit',     label: 'HIIT',          short: 'HIIT',     glyph: '🔥', dot: '#3f86d6' },
  weights:  { key: 'weights',  label: 'Weights',       short: 'Weights',  glyph: '🏋', dot: '#5b9279' },
  road:     { key: 'road',     label: 'Roadwork',      short: 'Roadwork', glyph: '👟', dot: '#5b8fb0' },
  mobility: { key: 'mobility', label: 'Mobility',      short: 'Mobility', glyph: '🧘', dot: '#8a8f98' },
  other:    { key: 'other',    label: 'Other',         short: 'Other',    glyph: '•',  dot: '#8a8f98' },
};
const TYPE_ORDER = ['box', 'spar', 'group', 'hiit', 'weights', 'other'];

// ---- blocks (editable at runtime via setProgram) ----
const CAMP_PLAN_START = '2026-05-25'; // Monday of camp week 1 (fixed)
let START_WEIGHT = 215;               // camp-start bodyweight (editable)
let START_BF = 18;                    // camp-start body-fat % (editable)
let GOAL_BF = 12;                     // fight-day body-fat % goal (editable)
const DEFAULT_BLOCKS = [
  { key: 'base',    name: 'Base',    phase: 'Build a base',  start: '2026-05-25', officialStart: '2026-05-29', end: '2026-06-07', color: '#5b9279', wt: 212 },
  { key: 'travel',  name: 'Travel',  phase: 'Maintain',      start: '2026-06-08', officialStart: '2026-06-08', end: '2026-06-21', color: '#6b7785', wt: 211 },
  { key: 'base2',   name: 'Base',    phase: 'Build a base',  start: '2026-06-22', officialStart: '2026-06-22', end: '2026-07-11', color: '#5b9279', wt: 208 },
  { key: 'build',   name: 'Build',   phase: 'Add volume',    start: '2026-07-12', officialStart: '2026-07-12', end: '2026-08-01', color: '#7b86c2', wt: 203 },
  { key: 'sharpen', name: 'Sharpen', phase: 'Hard sparring', start: '2026-08-02', officialStart: '2026-08-02', end: '2026-08-22', color: '#c2895b', wt: 199 },
  { key: 'peak',    name: 'Peak',    phase: 'Peak → taper',  start: '2026-08-23', officialStart: '2026-08-23', end: '2026-09-16', color: '#cf5b54', wt: 195 },
];
const BLOCKS = DEFAULT_BLOCKS.map(b => ({ ...b }));   // stable identity; mutated in place
const MILESTONES = [];                                 // derived; rebuilt in place

function rebuildProgram() {
  // chain starts: first block anchored to camp start, each next begins the day after the prior ends
  for (let i = 0; i < BLOCKS.length; i++) {
    if (i === 0) { BLOCKS[0].start = CAMP_PLAN_START; }
    else { BLOCKS[i].start = addDays(BLOCKS[i - 1].end, 1); BLOCKS[i].officialStart = BLOCKS[i].start; }
  }
  // rebuild the target-weight curve from start weight + each block's target
  MILESTONES.length = 0;
  MILESTONES.push([BLOCKS[0].officialStart, START_WEIGHT]);
  BLOCKS.forEach(b => MILESTONES.push([b.end, b.wt]));
}

function setProgram(over) {
  if (over) {
    if (typeof over.startWeight === 'number' && isFinite(over.startWeight)) START_WEIGHT = over.startWeight;
    if (Array.isArray(over.blocks)) {
      over.blocks.forEach(o => {
        const b = BLOCKS.find(x => x.key === o.key);
        if (!b) return;
        if (o.name != null) b.name = o.name;
        if (o.phase != null) b.phase = o.phase;
        if (o.end != null) b.end = o.end;
        if (typeof o.wt === 'number' && isFinite(o.wt)) b.wt = o.wt;
      });
    }
    if (typeof over.startBodyFat === 'number' && isFinite(over.startBodyFat)) START_BF = over.startBodyFat;
    if (typeof over.goalBodyFat === 'number' && isFinite(over.goalBodyFat)) GOAL_BF = over.goalBodyFat;
  }
  rebuildProgram();
}
function getProgram() {
  return { startWeight: START_WEIGHT, fightDate: FIGHT_DATE, startBodyFat: START_BF, goalBodyFat: GOAL_BF,
    blocks: BLOCKS.map(b => ({ key: b.key, name: b.name, phase: b.phase, start: b.start, officialStart: b.officialStart, end: b.end, wt: b.wt, color: b.color })) };
}
function resetProgram() { START_WEIGHT = 215; START_BF = 18; GOAL_BF = 12; DEFAULT_BLOCKS.forEach((d, i) => Object.assign(BLOCKS[i], d)); rebuildProgram(); }
rebuildProgram(); // initialise milestones from defaults

function blockForDate(s) {
  for (const b of BLOCKS) if (s >= b.start && s <= b.end) return b;
  return null;
}

// camp week 1 = the week containing the start
const CAMP_WEEK1_START = startOfWeek('2026-05-29'); // = 2026-05-25
function weekOfCamp(s) { return Math.floor(daysBetween(CAMP_WEEK1_START, startOfWeek(s)) / 7) + 1; }
const TOTAL_CAMP_WEEKS = weekOfCamp(FIGHT_DATE);

// ---- target weight curve (piecewise-linear between milestones) ----
function targetWeight(s) {
  if (s <= MILESTONES[0][0]) return MILESTONES[0][1];
  if (s >= MILESTONES[MILESTONES.length - 1][0]) return MILESTONES[MILESTONES.length - 1][1];
  for (let i = 1; i < MILESTONES.length; i++) {
    const [d0, w0] = MILESTONES[i - 1], [d1, w1] = MILESTONES[i];
    if (s <= d1) { const t = daysBetween(d0, s) / daysBetween(d0, d1); return w0 + (w1 - w0) * t; }
  }
  return MILESTONES[MILESTONES.length - 1][1];
}

// ---- body-fat target curve (linear from camp start to fight-day goal) ----
function targetBodyFat(s) {
  const d0 = BLOCKS[0].officialStart, d1 = FIGHT_DATE;
  if (s <= d0) return START_BF;
  if (s >= d1) return GOAL_BF;
  const t = daysBetween(d0, s) / daysBetween(d0, d1);
  return START_BF + (GOAL_BF - START_BF) * t;
}

// ---- weekly templates ----
// helper to build a planned item
const mk = (type, intensity, note, optional) => ({ type, intensity, note: note || '', optional: !!optional });

function planForDate(s) {
  const block = blockForDate(s);
  const wd = weekdayMon0(s); // 0=Mon..6=Sun
  const dtf = daysBetween(s, FIGHT_DATE);
  const out = { date: s, block, weekOfCamp: weekOfCamp(s), items: [], fightDay: s === FIGHT_DATE, deload: false, note: '' };
  if (s === FIGHT_DATE) { out.note = 'FIGHT NIGHT — 3 × 2 min.'; return out; }
  if (!block) return out; // before camp / out of range
  // future days are left empty — the athlete plans their own sessions
  if (s > APP_TODAY) { return out; }

  // home week — first calendar week of camp (regardless of phase)
  if (s >= CAMP_PLAN_START && s <= '2026-05-31') {
    const home = [
      [],                                            // Mon
      [mk('box', 'moderate', 'Bag + technique')],     // Tue
      [mk('box', 'moderate'), mk('hiit', 'moderate', 'Short finisher')], // Wed
      [mk('weights', 'moderate', 'Full-body')],       // Thu
      [mk('spar', 'easy', 'Light, controlled'), mk('box', 'moderate')],  // Fri
      [],                                             // Sat
      [],                                            // Sun
    ];
    out.items = home[wd];
    out.note = 'Home week — bank the habit before you travel.';
    return out;
  }

  if (block.key === 'travel') {
    // travel weeks — 3 sessions, no equipment
    const trav = [
      [mk('hiit', 'moderate', 'Conditioning circuit ~25 min')], // Mon
      [],                                                       // Tue
      [mk('box', 'moderate', 'Shadow, 4–5 × 2-min, form focus')],// Wed
      [],                                                       // Thu
      [mk('hiit', 'moderate', 'Bodyweight + core circuit ~20 min')], // Fri
      [],                                                       // Sat
      [],                                                       // Sun
    ];
    out.items = trav[wd];
    out.note = 'Travel week — keep it alive: 10–15 min daily shadow.';
    return out;
  }

  if (block.key === 'base' || block.key === 'base2') {
    const t = [
      [mk('box', 'moderate'), mk('weights', 'moderate', 'Heavier')],   // Mon
      [mk('spar', 'easy', 'Light'), mk('hiit', 'moderate', 'Short')],  // Tue
      [mk('group', 'easy', 'Optional', true)],                        // Wed
      [mk('box', 'moderate'), mk('weights', 'moderate', 'Heavier')],   // Thu
      [],                                                            // Fri
      [], [],                                                        // Sat/Sun rest
    ];
    out.items = t[wd];
    return out;
  }

  if (block.key === 'build') {
    const t = [
      [mk('box', 'moderate'), mk('weights', 'moderate')],                 // Mon
      [mk('spar', 'moderate', 'Controlled'), mk('hiit', 'moderate', 'Short')], // Tue
      [mk('group', 'easy', 'Optional', true)],                           // Wed
      [mk('box', 'moderate'), mk('weights', 'moderate')],                 // Thu
      [mk('spar', 'moderate', 'Controlled'), mk('hiit', 'moderate', 'Short')], // Fri
      [],                                                                // Sat
      [],                                                               // Sun
    ];
    out.items = t[wd];
    return out;
  }

  if (block.key === 'sharpen') {
    const deload = s >= '2026-08-16'; // lighter week before Peak
    out.deload = deload;
    if (deload) {
      const t = [
        [mk('box', 'moderate', 'Sharp, low volume'), mk('weights', 'easy', 'Maintain')], // Mon
        [mk('spar', 'moderate', 'Controlled — deload')],                                // Tue
        [],                                                                            // Wed rest
        [mk('box', 'moderate', 'Sharp, low volume'), mk('weights', 'easy')],             // Thu
        [mk('hiit', 'easy', 'Short')],                                                  // Fri
        [], [],                                                                        // weekend rest
      ];
      out.items = t[wd];
      out.note = 'Deload — recovery is the limiter under a deficit.';
    } else {
      const t = [
        [mk('box', 'moderate'), mk('weights', 'moderate')],            // Mon
        [mk('spar', 'hard', 'Hard'), mk('hiit', 'moderate', 'Short')], // Tue
        [mk('group', 'easy', 'Lighter')],                             // Wed
        [mk('box', 'moderate'), mk('weights', 'moderate')],            // Thu
        [mk('spar', 'hard', 'Hard'), mk('hiit', 'moderate', 'Short')], // Fri
        [],                                                           // Sat
        [],                                                          // Sun
      ];
      out.items = t[wd];
    }
    return out;
  }

  if (block.key === 'peak') {
    if (dtf > 10) {
      // Aug 23 – ~Sep 5: sparring still allowed, beginning to taper
      const t = [
        [mk('box', 'moderate'), mk('weights', 'moderate')],          // Mon
        [mk('spar', 'hard', 'Sharp'), mk('hiit', 'moderate', 'Short')], // Tue
        [mk('group', 'easy', 'Optional', true)],                    // Wed
        [mk('box', 'moderate'), mk('weights', 'easy')],              // Thu
        [mk('spar', 'hard', 'Sharp'), mk('hiit', 'moderate', 'Short')], // Fri
        [],                                                         // Sat
        [],                                                        // Sun
      ];
      out.items = t[wd];
      out.note = 'Peak — sharp work, sparring tapering down.';
    } else if (dtf > 2) {
      // ~Sep 6 – Sep 13: taper, NO sparring, two rest days
      const t = [
        [mk('box', 'easy', 'Technique, light')], // Mon
        [mk('hiit', 'easy', 'Short, easy')],      // Tue
        [],                                      // Wed rest
        [mk('box', 'easy', 'Light'), mk('weights', 'easy', 'Maintain')], // Thu
        [mk('box', 'easy', 'Easy movement, stay loose')],    // Fri
        [], [],                                  // weekend rest
      ];
      out.items = t[wd];
      out.note = 'Taper — sparring is done. Arrive healthy.';
    } else {
      // final 2 days
      out.items = dtf === 2 ? [mk('box', 'easy', 'Movement, stay loose')] : [mk('box', 'easy', 'Light shakeout, stay loose')];
      out.note = 'Fight week — rest, hydrate, stay sharp.';
    }
    return out;
  }

  return out;
}

// All planned items for a date as fully-formed objects with stable ids.
function plannedSessions(s) {
  const p = planForDate(s);
  return p.items.map((it, i) => ({
    id: `plan-${s}-${it.type}-${i}`,
    date: s, type: it.type, intensity: it.intensity, note: it.note,
    optional: it.optional, planned: true, order: i,
  }));
}

Object.assign(window, {
  APP_TODAY, FIGHT_DATE, TYPES, TYPE_ORDER, BLOCKS, MILESTONES, TOTAL_CAMP_WEEKS, CAMP_WEEK1_START, WD,
  parseISO, toISO, addDays, weekdayMon0, startOfWeek, daysBetween, fmtShort, fmtWeekday, fmtTime,
  blockForDate, weekOfCamp, targetWeight, targetBodyFat, planForDate, plannedSessions,
  setProgram, getProgram, resetProgram,
});
