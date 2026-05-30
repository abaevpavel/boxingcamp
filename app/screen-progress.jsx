// screen-progress.jsx
function campStats(state) {
  const today = window.APP_TODAY;
  let planned = 0, done = 0;
  for (let wk = window.CAMP_WEEK1_START; wk <= window.startOfWeek(today); wk = window.addDays(wk, 7)) {
    const s = window.weekSummary(wk, state); planned += s.planned; done += s.done;
  }
  const consistency = planned ? Math.round((Math.min(done, planned) / planned) * 100) : 0;
  const totalSessions = state.log.filter(l => l.status === 'done').length;
  return { consistency, done, planned, totalSessions };
}

function ProgressScreen() {
  const store = window.useStore();
  const { state, deleteBenchmark } = store;
  const T = window.T;
  const cs = campStats(state);
  const [addOpen, setAddOpen] = React.useState(false);

  // group benchmarks by type for trend
  const byType = {};
  state.benchmarks.slice().sort((a, b) => a.date < b.date ? -1 : 1).forEach(b => { (byType[b.type] = byType[b.type] || []).push(b); });

  return (
    <window.Screen title="Progress" sub="Trend"
      right={<window.Btn size="sm" onClick={() => setAddOpen(true)}><window.Icon name="plus" size={16} stroke={2.5} />Benchmark</window.Btn>}>

      {/* camp consistency */}
      <window.Card style={{ marginBottom: 14 }}>
        <window.Label style={{ marginBottom: 10 }}>Camp consistency</window.Label>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 0.9, letterSpacing: -2, flexShrink: 0, color: cs.consistency >= 80 ? T.accent : T.text }}>{cs.consistency}<span style={{ fontSize: 26 }}>%</span></div>
          <div style={{ paddingBottom: 7 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: T.text }}>{cs.done}/{cs.planned}</div>
            <window.Label style={{ marginTop: 2 }}>sessions hit</window.Label>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 8, borderRadius: 99, background: T.track, overflow: 'hidden' }}>
          <div style={{ width: cs.consistency + '%', height: '100%', background: T.accent, borderRadius: 99 }} />
        </div>
      </window.Card>

      {/* benchmarks */}
      <div style={{ marginBottom: 8 }}><window.Label>Benchmarks</window.Label></div>
      {Object.keys(byType).length === 0 ? (
        <window.Card style={{ marginBottom: 14 }}><div style={{ color: T.faint, fontWeight: 600, fontSize: 14 }}>No benchmarks yet. Log a 3-mile time or burpee count every ~3 weeks to watch the engine improve.</div></window.Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {Object.entries(byType).map(([type, arr]) => (
            <window.Card key={type} pad={16}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontFamily: T.font, fontSize: 15, fontWeight: 800 }}>{type}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{arr.length} logged</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {arr.slice().reverse().map((b, i) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
                    <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.muted, width: 56 }}>{window.fmtShort(b.date)}</span>
                    <span style={{ fontFamily: T.font, fontSize: 17, fontWeight: 800, color: i === 0 ? T.accent : T.text }}>{b.value}</span>
                    {b.notes && <span style={{ fontFamily: T.font, fontSize: 12, color: T.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.notes}</span>}
                    <button onClick={() => deleteBenchmark(b.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T.faint, cursor: 'pointer', padding: 2 }}><window.Icon name="trash" size={15} /></button>
                  </div>
                ))}
              </div>
            </window.Card>
          ))}
        </div>
      )}

      {/* check-in history */}
      <div style={{ marginBottom: 8 }}><window.Label>Check-in history</window.Label></div>
      {state.checkIns.length === 0 ? (
        <window.Card><div style={{ color: T.faint, fontWeight: 600, fontSize: 14 }}>No check-ins yet.</div></window.Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.checkIns.slice().sort((a, b) => a.weekOf < b.weekOf ? 1 : -1).map(c => (
            <window.Card key={c.weekOf} pad={16}>
              <div style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 800, marginBottom: 6 }}>Week of {window.fmtShort(c.weekOf)}</div>
              {c.noteToNext && <div style={{ fontFamily: T.font, fontSize: 13.5, color: T.text, lineHeight: 1.45 }}>“{c.noteToNext}”</div>}
              {c.fix && <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.muted, marginTop: 4 }}>Fix: {c.fix}</div>}
            </window.Card>
          ))}
        </div>
      )}

      <BenchmarkSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </window.Screen>
  );
}

function BenchmarkSheet({ open, onClose }) {
  const { addBenchmark } = window.useStore();
  const T = window.T;
  const presets = ['3-mile run', 'Burpees / 5 min', 'Rounds at pace', 'Max push-ups'];
  const [type, setType] = React.useState('3-mile run');
  const [value, setValue] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [date, setDate] = React.useState(window.APP_TODAY);
  React.useEffect(() => { if (open) { setType('3-mile run'); setValue(''); setNotes(''); setDate(window.APP_TODAY); } }, [open]);
  const save = () => { if (!value) return; addBenchmark({ type, value, notes, date }); onClose(); };
  return (
    <window.Sheet open={open} onClose={onClose} title="Log a benchmark">
      <window.Field label="Test">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {presets.map(p => <window.Chip key={p} on={type === p} style={{ cursor: 'pointer' }}><span onClick={() => setType(p)}>{p}</span></window.Chip>)}
        </div>
        <input value={type} onChange={e => setType(e.target.value)} style={window.inputStyle} />
      </window.Field>
      <window.Field label="Result"><input value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 23:40" style={window.inputStyle} /></window.Field>
      <window.Field label="Date"><input type="date" value={date} min="2026-05-18" max="2026-09-16" onChange={e => setDate(e.target.value)} style={{ ...window.inputStyle, colorScheme: window.T.scheme }} /></window.Field>
      <window.Field label="Notes"><window.TextArea value={notes} onChange={setNotes} placeholder="Conditions, how it felt…" rows={2} /></window.Field>
      <window.Btn full size="lg" onClick={save}><window.Icon name="check" size={20} stroke={2.5} />Save benchmark</window.Btn>
    </window.Sheet>
  );
}
window.ProgressScreen = ProgressScreen;
