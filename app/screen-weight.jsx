// screen-weight.jsx
function WeightScreen({ ui }) {
  const { state, deleteWeight } = window.useStore();
  const T = window.T;
  const [range, setRange] = React.useState('camp');
  const [showBf, setShowBf] = React.useState(true);
  const wd = window.weightDelta(state, window.APP_TODAY);

  const ranges = { '2w': ['2026-05-18', window.addDays(window.APP_TODAY, 2)], camp: ['2026-05-18', '2026-09-16'], all: ['2026-05-18', '2026-09-16'] };
  const [from, to] = range === '2w' ? ['2026-05-15', window.addDays(window.APP_TODAY, 2)] : ['2026-05-15', '2026-09-16'];

  const sorted = state.weights.slice().sort((a, b) => a.date < b.date ? 1 : -1);
  const totalLost = state.weights.length ? +(state.weights.slice().sort((a, b) => a.date < b.date ? -1 : 1)[0].weightLb - wd.weight).toFixed(1) : 0;

  // body fat (optional, sparse)
  const BF = '#9aa3d6';
  const bfEntries = state.weights.filter(w => w.bodyFatPct != null).sort((a, b) => a.date < b.date ? -1 : 1);
  const latestBf = bfEntries.length ? bfEntries[bfEntries.length - 1] : null;
  const bfChange = bfEntries.length > 1 ? +(latestBf.bodyFatPct - bfEntries[0].bodyFatPct).toFixed(1) : null;
  const bfTargetNow = latestBf ? window.targetBodyFat(latestBf.date) : null;
  const bfDelta = latestBf ? +(bfTargetNow - latestBf.bodyFatPct).toFixed(1) : null; // + = below curve = ahead
  const bfAhead = bfDelta != null && bfDelta >= 0;
  const bfGoal = window.getProgram().goalBodyFat;

  return (
    <window.Screen title="Weight" sub="Accountability"
      right={<window.Btn size="sm" onClick={() => ui.openWeight()}><window.Icon name="plus" size={16} stroke={2.5} />Weigh in</window.Btn>}>

      {/* big delta */}
      <window.Card pad={15} style={{ marginBottom: 11 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <window.Label>Current</window.Label>
            <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1, letterSpacing: -2, marginTop: 4 }}>{wd ? wd.weight.toFixed(1) : '—'}<span style={{ fontSize: 19, color: T.muted, marginLeft: 6 }}>lb</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <window.Label style={{ textAlign: 'right' }}>Vs curve</window.Label>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, marginTop: 6, color: wd && wd.ahead ? T.accent : T.warn }}>{wd ? (wd.delta >= 0 ? '−' : '+') + Math.abs(wd.delta).toFixed(1) : '—'}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: wd && wd.ahead ? T.accent : T.warn, marginTop: 2 }}>{wd && wd.ahead ? 'AHEAD' : 'BEHIND'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, marginTop: 12, borderTop: `1px solid ${T.line}`, paddingTop: 11 }}>
          {[['Target now', wd ? wd.target.toFixed(1) : '—'], ['Fight target', '195'], ['Lost so far', totalLost + ' lb']].map(([k, v], i) => (
            <div key={k} style={{ flex: 1, borderLeft: i ? `1px solid ${T.line}` : 'none', paddingLeft: i ? 14 : 0 }}>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{v}</div>
              <window.Label style={{ marginTop: 2 }}>{k}</window.Label>
            </div>
          ))}
        </div>
      </window.Card>

      {/* body fat */}
      <window.Card pad={15} style={{ marginBottom: 11 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <window.Label>Body fat</window.Label>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: -1.5, marginTop: 4, color: latestBf ? T.text : T.faint }}>
              {latestBf ? latestBf.bodyFatPct.toFixed(1) : '—'}<span style={{ fontSize: 17, color: T.muted, marginLeft: 4 }}>%</span>
            </div>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, marginTop: 3 }}>
              {latestBf ? `last measured ${window.fmtShort(latestBf.date)} · optional` : 'optional — manual or scanner'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <window.Label style={{ textAlign: 'right' }}>Vs curve</window.Label>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, marginTop: 6, color: bfDelta != null ? (bfAhead ? T.accent : T.warn) : T.faint }}>
              {bfDelta != null ? (bfDelta >= 0 ? '−' : '+') + Math.abs(bfDelta).toFixed(1) : '—'}
            </div>
            <window.Label style={{ textAlign: 'right', marginTop: 2 }}>{bfDelta != null ? (bfAhead ? 'ahead' : 'behind') : 'pts'}</window.Label>
          </div>
        </div>
        {latestBf && (
          <div style={{ display: 'flex', gap: 0, marginTop: 12, borderTop: `1px solid ${T.line}`, paddingTop: 11 }}>
            {[['Target now', bfTargetNow != null ? bfTargetNow.toFixed(1) + '%' : '—'], ['Fight goal', bfGoal + '%'], ['Since start', bfChange != null ? (bfChange <= 0 ? '−' : '+') + Math.abs(bfChange).toFixed(1) + ' pts' : '—']].map(([k, v], i) => (
              <div key={k} style={{ flex: 1, borderLeft: i ? `1px solid ${T.line}` : 'none', paddingLeft: i ? 14 : 0 }}>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{v}</div>
                <window.Label style={{ marginTop: 2 }}>{k}</window.Label>
              </div>
            ))}
          </div>
        )}
      </window.Card>

      {/* chart */}
      <window.Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <window.Seg options={[{ value: '2w', label: '2 wk' }, { value: 'camp', label: 'Camp' }]} value={range} onChange={setRange} style={{ width: 150 }} />
          <button onClick={() => setShowBf(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ width: 18, height: 0, borderTop: `2px dashed ${showBf ? '#7b86c2' : T.faint}` }} />
            <span style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, color: showBf ? '#9aa3d6' : T.faint }}>Body fat</span>
          </button>
        </div>
        <window.WeightChart weights={state.weights} from={from} to={to} height={210} showBodyFat={showBf} />
        <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center' }}>
          <Legend color={T.accent} label="Weight" solid />
          <Legend color={T.muted} label="Target curve" />
          {showBf && <Legend color="#9aa3d6" label="Body fat" solid />}
          {showBf && <Legend color="#9aa3d6" label="BF target" />}
        </div>
      </window.Card>

      {/* recent weigh-ins */}
      <window.Card pad={0}>
        <div style={{ padding: '16px 18px 8px', fontSize: 16, fontWeight: 800 }}>Weigh-in log</div>
        <div style={{ padding: '0 18px 8px' }}>
          {sorted.length === 0 && <div style={{ color: T.faint, padding: '12px 0', fontWeight: 600 }}>No weigh-ins yet.</div>}
          {sorted.map((w, i) => {
            const tgt = window.targetWeight(w.date), del = +(tgt - w.weightLb).toFixed(1);
            return (
              <div key={w.date} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: i ? `1px solid ${T.line}` : 'none' }}>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, width: 58 }}>{window.fmtShort(w.date)}</span>
                <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 800, width: 64 }}>{w.weightLb.toFixed(1)}</span>
                {w.bodyFatPct != null && <span style={{ fontFamily: T.font, fontSize: 12.5, fontWeight: 700, color: '#9aa3d6' }}>{w.bodyFatPct}% bf</span>}
                <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, color: del >= 0 ? T.accent : T.warn }}>{del >= 0 ? '−' : '+'}{Math.abs(del).toFixed(1)}</span>
                <button onClick={() => deleteWeight(w.date)} style={{ background: 'none', border: 'none', color: T.faint, cursor: 'pointer', padding: 4 }}><window.Icon name="trash" size={16} /></button>
              </div>
            );
          })}
        </div>
      </window.Card>
    </window.Screen>
  );
}

function Legend({ color, label, solid }) {
  const T = window.T;
  return <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 16, height: 0, borderTop: `2px ${solid ? 'solid' : 'dashed'} ${color}` }} />
    <span style={{ fontFamily: T.font, fontSize: 11.5, fontWeight: 700, color: T.muted }}>{label}</span>
  </div>;
}
window.WeightScreen = WeightScreen;
