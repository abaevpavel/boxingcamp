// screen-checkin.jsx
function weekStats(weekOf, state) {
  const sum = window.weekSummary(weekOf, state);
  const inWeek = state.weights.filter(w => w.date >= sum.start && w.date <= sum.end).sort((a, b) => a.date < b.date ? -1 : 1);
  const wStart = inWeek[0], wEnd = inWeek[inWeek.length - 1];
  const change = wStart && wEnd ? +(wEnd.weightLb - wStart.weightLb).toFixed(1) : null;
  const tgt = wEnd ? window.targetWeight(wEnd.date) : null;
  const vsCurve = wEnd ? +(tgt - wEnd.weightLb).toFixed(1) : null;
  return { sum, change, latest: wEnd ? wEnd.weightLb : null, vsCurve };
}

function CheckinScreen() {
  const { state, saveCheckIn, deleteCheckIn } = window.useStore();
  const T = window.T;
  const weekOf = window.startOfWeek(window.APP_TODAY);
  const existing = state.checkIns.find(c => c.weekOf === weekOf);
  const [felt, setFelt] = React.useState(existing ? existing.felt : '');
  const [worked, setWorked] = React.useState(existing ? existing.worked : '');
  const [fix, setFix] = React.useState(existing ? existing.fix : '');
  const [noteToNext, setNote] = React.useState(existing ? existing.noteToNext : '');
  const [saved, setSaved] = React.useState(false);

  const st = weekStats(weekOf, state);
  const block = window.blockForDate(window.APP_TODAY);

  const save = () => {
    saveCheckIn({ weekOf, felt, worked, fix, noteToNext, savedAt: new Date().toISOString() });
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };

  const past = state.checkIns.filter(c => c.weekOf !== weekOf);

  return (
    <window.Screen title="Check-in" sub={`${block ? block.name + ' · ' : ''}week of ${window.fmtShort(weekOf)}`}>
      {/* auto summary */}
      <window.Card style={{ marginBottom: 14 }}>
        <window.Label style={{ marginBottom: 12 }}>This week, by the numbers</window.Label>
        <div style={{ display: 'flex' }}>
          {[
            ['Sessions', `${st.sum.done}/${st.sum.planned}`, T.text],
            ['Consistency', st.sum.consistency + '%', st.sum.consistency >= 80 ? T.accent : T.warn],
            ['Weight', st.change != null ? (st.change <= 0 ? st.change.toFixed(1) : '+' + st.change.toFixed(1)) : '—', T.text],
            ['Vs curve', st.vsCurve != null ? (st.vsCurve >= 0 ? '−' + Math.abs(st.vsCurve).toFixed(1) : '+' + Math.abs(st.vsCurve).toFixed(1)) : '—', st.vsCurve >= 0 ? T.accent : T.warn],
          ].map(([k, v, c], i) => (
            <div key={k} style={{ flex: 1, borderLeft: i ? `1px solid ${T.line}` : 'none', paddingLeft: i ? 12 : 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
              <window.Label style={{ marginTop: 2 }}>{k}</window.Label>
            </div>
          ))}
        </div>
      </window.Card>

      <window.Field label="How did it feel?"><window.TextArea value={felt} onChange={setFelt} placeholder="Energy, soreness, head space…" rows={3} /></window.Field>
      <window.Field label="What worked?"><window.TextArea value={worked} onChange={setWorked} placeholder="Keep doing this." rows={2} /></window.Field>
      <window.Field label="What to fix?"><window.TextArea value={fix} onChange={setFix} placeholder="Be honest. What slipped?" rows={2} /></window.Field>
      <window.Field label="Note to next-week me"><window.TextArea value={noteToNext} onChange={setNote} placeholder="One instruction. Make it count." rows={2} /></window.Field>

      <window.Btn full size="lg" onClick={save} style={saved ? { background: T.good } : {}}>
        <window.Icon name="check" size={20} stroke={2.5} />{saved ? 'Saved' : existing ? 'Update check-in' : 'Save check-in'}
      </window.Btn>

      {past.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <window.Label style={{ marginBottom: 12 }}>History</window.Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {past.sort((a, b) => a.weekOf < b.weekOf ? 1 : -1).map(c => {
              const cs = weekStats(c.weekOf, state);
              return (
                <window.Card key={c.weekOf} pad={16}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 800 }}>Week of {window.fmtShort(c.weekOf)}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{cs.sum.done}/{cs.sum.planned} · {cs.sum.consistency}%</span>
                      <button onClick={() => deleteCheckIn(c.weekOf)} style={{ background: 'none', border: 'none', color: T.faint, cursor: 'pointer', padding: 2 }}><window.Icon name="trash" size={15} /></button>
                    </div>
                  </div>
                  {c.felt && <CIRow label="Felt" text={c.felt} />}
                  {c.worked && <CIRow label="Worked" text={c.worked} />}
                  {c.fix && <CIRow label="Fix" text={c.fix} />}
                  {c.noteToNext && <CIRow label="Next me" text={c.noteToNext} />}
                </window.Card>
              );
            })}
          </div>
        </div>
      )}
    </window.Screen>
  );
}
function CIRow({ label, text }) {
  const T = window.T;
  return <div style={{ marginBottom: 6 }}><span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, color: T.faint, letterSpacing: 0.5, textTransform: 'uppercase', marginRight: 8 }}>{label}</span><span style={{ fontFamily: T.font, fontSize: 13.5, color: T.text, lineHeight: 1.45 }}>{text}</span></div>;
}
window.CheckinScreen = CheckinScreen;
