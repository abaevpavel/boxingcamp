// screen-settings.jsx
function SettingsScreen() {
  const store = window.useStore();
  const { state, markExported, importData, resetAll, wipeAll, setTheme, clearPasscode } = store;
  const T = window.T;
  const fileRef = React.useRef(null);
  const [msg, setMsg] = React.useState('');
  const [progOpen, setProgOpen] = React.useState(false);
  const [pcOpen, setPcOpen] = React.useState(false);
  const hasPasscode = !!(state.settings && state.settings.passcode);
  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2200); };

  const doExport = () => {
    const data = { app: 'boxing-camp-tracker', version: 1, exportedAt: new Date().toISOString(), log: state.log, weights: state.weights, checkIns: state.checkIns, benchmarks: state.benchmarks, program: state.program, settings: state.settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `camp-backup-${window.APP_TODAY}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    markExported(); flash('Backup downloaded.');
  };
  const doImport = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const obj = JSON.parse(r.result); importData(obj); flash('Data restored.'); } catch (err) { flash('Bad file — could not read JSON.'); } };
    r.readAsText(f); e.target.value = '';
  };

  const last = state.settings && state.settings.lastExport;
  const lastTxt = last ? new Date(last).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'never';
  const counts = `${state.log.length} sessions · ${state.weights.length} weigh-ins · ${state.checkIns.length} check-ins · ${state.benchmarks.length} benchmarks`;
  const theme = (state.settings && state.settings.theme) || 'dark';
  const prog = window.getProgram();

  return (
    <window.Screen title="Settings" sub="Camp setup">
      {/* appearance */}
      <div style={{ marginBottom: 8 }}><window.Label>Appearance</window.Label></div>
      <window.Card style={{ marginBottom: 18 }}>
        <window.Seg options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={theme === 'light' ? 'light' : 'dark'} onChange={setTheme} />
        <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 600, marginTop: 10, lineHeight: 1.45 }}>
          {theme === 'light' ? 'Light by day.' : 'Dark for the gym.'} Tap the sun/moon on the dashboard to flip it fast.
        </div>
      </window.Card>

      {/* security / passcode */}
      <div style={{ marginBottom: 8 }}><window.Label>Passcode lock</window.Label></div>
      <window.Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: hasPasscode ? T.accentDim : T.bg2, color: hasPasscode ? T.accent : T.faint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Icon name={hasPasscode ? 'check' : 'flag'} size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 800 }}>{hasPasscode ? 'Passcode is on' : 'No passcode'}</div>
            <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.muted, fontWeight: 600, marginTop: 1 }}>{hasPasscode ? 'Asked for each time you open the app.' : 'Add a 4-digit lock for this device.'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {hasPasscode ? (
            <>
              <window.Btn kind="secondary" full onClick={() => setPcOpen(true)}>Change</window.Btn>
              <window.Btn kind="danger" full onClick={() => { if (confirm('Turn off the passcode lock?')) clearPasscode(); }}>Turn off</window.Btn>
            </>
          ) : (
            <window.Btn full onClick={() => setPcOpen(true)}><window.Icon name="check" size={18} stroke={2.5} />Set passcode</window.Btn>
          )}
        </div>
        <div style={{ fontFamily: T.font, fontSize: 11.5, color: T.faint, fontWeight: 600, marginTop: 12, lineHeight: 1.5 }}>A private lock on this device — not account security, and no recovery if forgotten. Keep a backup.</div>
      </window.Card>

      {/* program editor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <window.Label>The program</window.Label>
        <button onClick={() => setProgOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontFamily: T.font, fontSize: 13, fontWeight: 800 }}>
          <window.Icon name="edit" size={15} />Edit
        </button>
      </div>
      <window.Card pad={0} style={{ marginBottom: 8 }} onClick={() => setProgOpen(true)}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '13px 16px 8px' }}>
          <span style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 700, color: T.muted }}>Camp start weight</span>
          <span style={{ fontFamily: T.font, fontSize: 15, fontWeight: 800 }}>{prog.startWeight} lb</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 16px 10px' }}>
          <span style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 700, color: T.muted }}>Body-fat goal</span>
          <span style={{ fontFamily: T.font, fontSize: 15, fontWeight: 800 }}>{prog.startBodyFat}% → {prog.goalBodyFat}%</span>
        </div>
        {prog.blocks.map((b, i) => (
          <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `1px solid ${T.line}` }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.font, fontSize: 14.5, fontWeight: 800 }}>{b.name} <span style={{ color: T.muted, fontWeight: 600, fontSize: 12.5 }}>· {b.phase}</span></div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 1 }}>{window.fmtShort(b.officialStart)} – {window.fmtShort(b.end)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 800 }}>{b.wt}</div>
              <window.Label style={{ fontSize: 9.5 }}>target lb</window.Label>
            </div>
          </div>
        ))}
      </window.Card>
      <div style={{ fontSize: 12, color: T.faint, fontWeight: 600, marginBottom: 18, padding: '0 2px' }}>Tap to adjust phase names, end dates, and weight targets. The weight curve updates to match.</div>

      {/* backup */}
      <div style={{ marginBottom: 8 }}><window.Label>Backup</window.Label></div>
      <window.Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13.5, color: T.muted, fontWeight: 600, lineHeight: 1.5, marginBottom: 14 }}>
          Everything lives only in this browser. Clear the cache and it's gone. Export a backup regularly — last export: <span style={{ color: last ? T.accent : T.warn }}>{lastTxt}</span>.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <window.Btn full onClick={doExport}><window.Icon name="download" size={18} />Export JSON</window.Btn>
          <window.Btn kind="secondary" full onClick={() => fileRef.current.click()}><window.Icon name="upload" size={18} />Import</window.Btn>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={doImport} style={{ display: 'none' }} />
        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.faint, marginTop: 12, textAlign: 'center' }}>{counts}</div>
        {msg && <div style={{ marginTop: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, color: T.accent }}>{msg}</div>}
      </window.Card>

      {/* danger */}
      <div style={{ marginBottom: 8 }}><window.Label>Data</window.Label></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <window.Btn kind="ghost" full onClick={() => { if (confirm('Reset to the seeded demo data? This replaces everything currently logged.')) resetAll(); }}>Reset to demo</window.Btn>
        <window.Btn kind="danger" full onClick={() => { if (confirm('Wipe ALL data and start empty? Export a backup first if you want to keep it.')) wipeAll(); }}><window.Icon name="trash" size={17} />Wipe all</window.Btn>
      </div>
      <div style={{ height: 8 }} />

      <ProgramEditorSheet open={progOpen} onClose={() => setProgOpen(false)} />
      <window.PasscodeSheet open={pcOpen} onClose={() => setPcOpen(false)} />
    </window.Screen>
  );
}

function ProgramEditorSheet({ open, onClose }) {
  const store = window.useStore();
  const T = window.T;
  const [startWeight, setStartWeight] = React.useState('215');
  const [startBf, setStartBf] = React.useState('22.5');
  const [goalBf, setGoalBf] = React.useState('12');
  const [blocks, setBlocks] = React.useState([]);
  React.useEffect(() => {
    if (open) {
      const p = window.getProgram();
      setStartWeight(String(p.startWeight));
      setStartBf(String(p.startBodyFat));
      setGoalBf(String(p.goalBodyFat));
      setBlocks(p.blocks.map(b => ({ key: b.key, name: b.name, phase: b.phase, end: b.end, wt: String(b.wt), color: b.color })));
    }
  }, [open]);
  if (!open) return null;

  const FIGHT = window.FIGHT_DATE;
  const setBlock = (i, patch) => setBlocks(bs => bs.map((b, j) => j === i ? { ...b, ...patch } : b));

  const save = () => {
    const over = {
      startWeight: +startWeight || 215,
      startBodyFat: +startBf || 22.5,
      goalBodyFat: +goalBf || 12,
      blocks: blocks.map(b => ({ key: b.key, name: b.name.trim() || b.key, phase: b.phase.trim(), end: b.end, wt: +b.wt || 0 })),
    };
    store.saveProgram(over);
    onClose();
  };
  const reset = () => { if (confirm('Reset the program to its original phases, dates, and targets?')) { store.resetProgram(); onClose(); } };

  // chained start for display + min bounds: block i starts the day after block i-1 ends
  const startFor = i => i === 0 ? window.fmtShort(window.getProgram().blocks[0].officialStart) : window.fmtShort(window.addDays(blocks[i - 1].end, 1));

  return (
    <window.Sheet open={open} onClose={onClose} title="Edit program">
      <window.Field label="Camp start weight (lb)">
        <input type="number" inputMode="decimal" value={startWeight} onChange={e => setStartWeight(e.target.value)} style={window.inputStyle} />
      </window.Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><window.Field label="Start body fat %"><input type="number" inputMode="decimal" value={startBf} onChange={e => setStartBf(e.target.value)} style={window.inputStyle} /></window.Field></div>
        <div style={{ flex: 1 }}><window.Field label="Fight body-fat goal %"><input type="number" inputMode="decimal" value={goalBf} onChange={e => setGoalBf(e.target.value)} style={window.inputStyle} /></window.Field></div>
      </div>

      <window.Label style={{ marginBottom: 8 }}>Phases</window.Label>
      <div style={{ fontSize: 12, color: T.faint, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>
        Each phase starts the day after the one before. Set where it ends and its weight target. Fight day is locked to {window.fmtShort(FIGHT)}.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {blocks.map((b, i) => {
          const isLast = i === blocks.length - 1;
          const minEnd = window.addDays(i === 0 ? window.getProgram().blocks[0].officialStart : blocks[i - 1].end, i === 0 ? 7 : 7);
          const maxEnd = isLast ? FIGHT : window.addDays(FIGHT, -1);
          return (
            <div key={b.key} style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 14, padding: 14, borderLeft: `4px solid ${b.color}` }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <window.Label style={{ marginBottom: 5 }}>Name</window.Label>
                  <input value={b.name} onChange={e => setBlock(i, { name: e.target.value })} style={{ ...window.inputStyle, padding: '10px 12px', fontSize: 15 }} />
                </div>
                <div style={{ width: 96 }}>
                  <window.Label style={{ marginBottom: 5 }}>Target lb</window.Label>
                  <input type="number" inputMode="decimal" value={b.wt} onChange={e => setBlock(i, { wt: e.target.value })} style={{ ...window.inputStyle, padding: '10px 12px', fontSize: 15 }} />
                </div>
              </div>
              <window.Label style={{ marginBottom: 5 }}>Focus</window.Label>
              <input value={b.phase} onChange={e => setBlock(i, { phase: e.target.value })} style={{ ...window.inputStyle, padding: '10px 12px', fontSize: 14, marginBottom: 10 }} />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <window.Label style={{ marginBottom: 5 }}>Ends</window.Label>
                  {isLast ? (
                    <div style={{ ...window.inputStyle, padding: '10px 12px', fontSize: 14, color: T.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <window.Icon name="flag" size={15} />{window.fmtShort(FIGHT)} · fight day
                    </div>
                  ) : (
                    <input type="date" value={b.end} min={minEnd} max={maxEnd} onChange={e => setBlock(i, { end: e.target.value })} style={{ ...window.inputStyle, padding: '10px 12px', fontSize: 14, colorScheme: T.scheme }} />
                  )}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, paddingBottom: 12 }}>from {startFor(i)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <window.Btn kind="ghost" onClick={reset} style={{ flexShrink: 0 }}>Reset</window.Btn>
        <window.Btn full size="lg" onClick={save}><window.Icon name="check" size={20} stroke={2.5} />Save program</window.Btn>
      </div>
    </window.Sheet>
  );
}
window.SettingsScreen = SettingsScreen;
