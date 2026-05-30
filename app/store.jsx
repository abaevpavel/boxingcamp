// store.jsx — state, persistence, seed data, actions, selectors. Exports StoreProvider + useStore.
const LS_KEY = 'bct.v1';

function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

// ---------- seed data (the athlete's real home-week logs + weigh-ins) ----------
function seedState() {
  const s = (date, type, intensity, when, notes) => ({
    id: uid(), date, type, intensity, duration: null,
    notes: (notes || ''), when: when || '', time: when === 'AM' ? '06:30' : when === 'PM' ? '18:30' : '', status: 'done', planned: true,
  });
  return {
    version: 1,
    log: [
      // prior week (pre-camp prep) — builds chart depth
      s('2026-05-19', 'box', 'moderate', 'AM'),
      s('2026-05-20', 'hiit', 'moderate', 'PM'),
      s('2026-05-21', 'box', 'moderate', 'AM'),
      s('2026-05-22', 'weights', 'moderate', 'PM'),
      // camp week 1 (home week) — matches the program plan
      s('2026-05-26', 'box', 'moderate', 'AM'),
      s('2026-05-27', 'box', 'moderate', 'AM'),
      s('2026-05-27', 'hiit', 'moderate', 'PM', 'Short burpee finisher'),
      s('2026-05-28', 'weights', 'moderate', 'PM', 'Full-body'),
      s('2026-05-29', 'spar', 'easy', 'PM', 'First light touch — felt rusty but good'),
      s('2026-05-29', 'box', 'moderate', 'PM'),
    ],
    weights: [],
    checkIns: [],
    benchmarks: [
      { id: uid(), date: '2026-05-20', type: '3-mile run', value: '24:10', notes: 'Baseline. Lungs were the limiter.' },
    ],
    program: null,
    settings: { lastExport: null, weightUnit: 'lb', theme: 'dark' },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) { const s = seedState(); localStorage.setItem(LS_KEY, JSON.stringify(s)); return s; }
    return JSON.parse(raw);
  } catch (e) { return seedState(); }
}

// ---------- store ----------
const StoreCtx = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(load);
  React.useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }, [state]);

  // apply program overrides + theme synchronously before children render
  window.setProgram(state.program || null);
  window.applyTheme(window.resolveTheme((state.settings && state.settings.theme) || 'dark'));

  const actions = React.useMemo(() => ({
    setTheme(mode) { setState(st => ({ ...st, settings: { ...st.settings, theme: mode } })); },
    setPasscode(pin) { setState(st => ({ ...st, settings: { ...st.settings, passcode: window.hashPin(pin) } })); },
    clearPasscode() { setState(st => ({ ...st, settings: { ...st.settings, passcode: null } })); },
    saveProgram(over) { window.setProgram(over); setState(st => ({ ...st, program: over })); },
    resetProgram() { window.resetProgram(); setState(st => ({ ...st, program: null })); },
    logSession(entry) {
      setState(st => ({ ...st, log: [...st.log, { id: uid(), status: 'done', planned: false, when: '', time: '', notes: '', duration: null, ...entry }] }));
    },
    // toggle a planned session done/undone by matching date+type
    togglePlannedDone(date, type, intensity) {
      setState(st => {
        const idx = st.log.findIndex(l => l.date === date && l.type === type && l.status === 'done' && l.planned);
        if (idx >= 0) { const log = st.log.slice(); log.splice(idx, 1); return { ...st, log }; }
        return { ...st, log: [...st.log, { id: uid(), date, type, intensity: intensity || 'moderate', status: 'done', planned: true, when: '', notes: '', duration: null }] };
      });
    },
    updateLog(id, patch) { setState(st => ({ ...st, log: st.log.map(l => l.id === id ? { ...l, ...patch } : l) })); },
    // delete a session: standalone logs are removed; program slots get a "skipped" override so they don't regenerate
    deleteSession(row) {
      setState(st => {
        let log = st.log.slice();
        if (row.logId && (row.custom || row.adhoc)) {
          log = log.filter(l => l.id !== row.logId);
        } else {
          if (row.logId) log = log.filter(l => l.id !== row.logId);
          log.push({ id: uid(), date: row.date, type: row.type, status: 'skipped', intensity: row.intensity || 'moderate', notes: '', when: '', duration: null });
        }
        return { ...st, log };
      });
    },
    // move a session to a new date
    rescheduleSession(row, newDate) {
      setState(st => {
        let log = st.log.slice();
        if (row.logId && (row.custom || row.adhoc)) {
          log = log.filter(l => l.id !== row.logId);
        } else {
          if (row.logId) log = log.filter(l => l.id !== row.logId);
          log.push({ id: uid(), date: row.date, type: row.type, status: 'skipped', intensity: row.intensity || 'moderate', notes: '', when: '', duration: null });
        }
        const newStatus = row.status === 'done' ? 'done' : 'planned';
        log.push({ id: uid(), date: newDate, type: row.type, intensity: row.intensity || 'moderate', status: newStatus, notes: row.notes || '', when: row.when || '', time: row.time || '', duration: row.duration != null ? row.duration : null });
        return { ...st, log };
      });
    },
    // edit intensity/notes/duration/status; creates a backing log for program slots
    saveSession(row, patch) {
      setState(st => {
        if (row.logId) return { ...st, log: st.log.map(l => l.id === row.logId ? { ...l, ...patch } : l) };
        const status = patch.status || (row.status === 'done' ? 'done' : 'planned');
        return { ...st, log: [...st.log, { id: uid(), date: row.date, type: row.type, intensity: patch.intensity || row.intensity || 'moderate', status, notes: patch.notes || '', when: patch.when || row.when || '', time: patch.time != null ? patch.time : (row.time || ''), duration: patch.duration != null ? patch.duration : (row.duration != null ? row.duration : null) }] };
      });
    },
    // unified toggle used by every session row (program slot OR a custom log entry)
    toggleRow(r) {
      setState(st => {
        if (r.src === 'log' && r.logId) {
          return { ...st, log: st.log.map(l => l.id === r.logId ? { ...l, status: l.status === 'done' ? 'planned' : 'done' } : l) };
        }
        const idx = st.log.findIndex(l => l.date === r.date && l.type === r.type && l.status === 'done');
        if (idx >= 0) { const log = st.log.slice(); log.splice(idx, 1); return { ...st, log }; }
        return { ...st, log: [...st.log, { id: uid(), date: r.date, type: r.type, intensity: r.intensity || 'moderate', status: 'done', planned: true, when: '', notes: '', duration: null }] };
      });
    },
    deleteLog(id) { setState(st => ({ ...st, log: st.log.filter(l => l.id !== id) })); },
    addWeight(entry) {
      setState(st => {
        const others = st.weights.filter(w => w.date !== entry.date);
        return { ...st, weights: [...others, { bodyFatPct: null, ...entry }].sort((a, b) => a.date < b.date ? -1 : 1) };
      });
    },
    deleteWeight(date) { setState(st => ({ ...st, weights: st.weights.filter(w => w.date !== date) })); },
    saveCheckIn(entry) {
      setState(st => {
        const others = st.checkIns.filter(c => c.weekOf !== entry.weekOf);
        return { ...st, checkIns: [...others, { id: uid(), ...entry }].sort((a, b) => a.weekOf < b.weekOf ? 1 : -1) };
      });
    },
    deleteCheckIn(weekOf) { setState(st => ({ ...st, checkIns: st.checkIns.filter(c => c.weekOf !== weekOf) })); },
    addBenchmark(entry) { setState(st => ({ ...st, benchmarks: [...st.benchmarks, { id: uid(), ...entry }].sort((a, b) => a.date < b.date ? -1 : 1) })); },
    deleteBenchmark(id) { setState(st => ({ ...st, benchmarks: st.benchmarks.filter(b => b.id !== id) })); },
    markExported() { setState(st => ({ ...st, settings: { ...st.settings, lastExport: new Date().toISOString() } })); },
    importData(obj) {
      setState(st => ({
        version: 1,
        log: Array.isArray(obj.log) ? obj.log : st.log,
        weights: Array.isArray(obj.weights) ? obj.weights : st.weights,
        checkIns: Array.isArray(obj.checkIns) ? obj.checkIns : st.checkIns,
        benchmarks: Array.isArray(obj.benchmarks) ? obj.benchmarks : st.benchmarks,
        program: obj.program !== undefined ? obj.program : st.program,
        settings: { ...(st.settings || {}), ...(obj.settings || {}) },
      }));
    },
    resetAll() { const s = seedState(); setState(s); },
    wipeAll() { setState({ version: 1, log: [], weights: [], checkIns: [], benchmarks: [], program: null, settings: { lastExport: null, weightUnit: 'lb', theme: 'dark' } }); },
  }), []);

  return React.createElement(StoreCtx.Provider, { value: { state, ...actions } }, children);
}

function useStore() { return React.useContext(StoreCtx); }

// ---------- selectors (pure, take state) ----------
// Merge program-planned sessions with logged ones for a given date.
function daySessions(dateISO, state) {
  const planned = window.plannedSessions(dateISO);
  const logs = state.log.filter(l => l.date === dateISO);
  const isPast = dateISO < window.APP_TODAY;
  const used = new Set();
  const skips = logs.filter(l => l.status === 'skipped');
  const rows = [];
  planned.forEach(p => {
    // a "skipped" override removes this program slot for the day
    const sk = skips.find(l => !used.has(l.id) && l.type === p.type);
    if (sk) { used.add(sk.id); return; }
    // match one log of the same type to this program slot (prefer done, then planned)
    let m = logs.find(l => !used.has(l.id) && l.type === p.type && l.status === 'done');
    if (!m) m = logs.find(l => !used.has(l.id) && l.type === p.type && l.status === 'planned');
    if (m) {
      used.add(m.id);
      const done = m.status === 'done';
      rows.push({ ...p, src: 'log', logId: m.id, status: done ? 'done' : (isPast ? 'missed' : 'planned'),
        when: m.when, time: m.time, notes: m.notes, duration: m.duration, intensity: m.intensity || p.intensity, custom: false });
      return;
    }
    rows.push({ ...p, src: 'program', status: isPast ? 'missed' : 'planned' });
  });
  // any leftover logs become standalone rows (custom planned or ad-hoc done)
  logs.filter(l => !used.has(l.id) && l.status !== 'skipped').forEach(l => {
    const done = l.status === 'done';
    rows.push({ id: l.id, date: dateISO, type: l.type, intensity: l.intensity, note: '', optional: false,
      planned: !done, custom: !done, adhoc: done, src: 'log', logId: l.id,
      status: done ? 'done' : (isPast ? 'missed' : 'planned'), when: l.when, time: l.time, notes: l.notes, duration: l.duration });
  });
  rows.sort((a, b) => {
    const ta = a.time || '', tb = b.time || '';
    if (ta && tb && ta !== tb) return ta < tb ? -1 : 1;
    if (ta && !tb) return -1;
    if (!ta && tb) return 1;
    return window.TYPE_ORDER.indexOf(a.type) - window.TYPE_ORDER.indexOf(b.type);
  });
  return rows;
}

// week summary for the week containing dateISO (Mon-based)
function weekSummary(dateISO, state) {
  const start = window.startOfWeek(dateISO);
  let planned = 0, optional = 0, done = 0, missed = 0;
  const byType = {};
  for (let i = 0; i < 7; i++) {
    const d = window.addDays(start, i);
    const rows = daySessions(d, state);
    rows.forEach(r => {
      if (r.planned && r.optional) optional++;
      else if (r.planned) planned++;
      if (r.status === 'done') { done++; byType[r.type] = (byType[r.type] || 0) + 1; }
      if (r.status === 'missed' && !r.optional) missed++;
    });
  }
  const consistency = planned > 0 ? Math.round((Math.min(done, planned) / planned) * 100) : (done > 0 ? 100 : 0);
  return { start, end: window.addDays(start, 6), planned, optional, done, missed, consistency, byType };
}

function latestWeight(state) {
  if (!state.weights.length) return null;
  return state.weights.slice().sort((a, b) => a.date < b.date ? 1 : -1)[0];
}
function weightDelta(state, dateISO) {
  const lw = latestWeight(state); if (!lw) return null;
  const tgt = window.targetWeight(lw.date);
  const delta = +(tgt - lw.weightLb).toFixed(1); // positive = lighter than curve = ahead
  return { weight: lw.weightLb, date: lw.date, target: +tgt.toFixed(1), delta, ahead: delta >= 0 };
}

Object.assign(window, { StoreProvider, useStore, daySessions, weekSummary, latestWeight, weightDelta, seedState });
