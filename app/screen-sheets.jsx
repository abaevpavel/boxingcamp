// screen-sheets.jsx — Log session, Log weight, Day detail, Session detail (bottom sheets)
function TypeGrid({ value, onChange }) {
  const T = window.T;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
      {window.TYPE_ORDER.map(k => {
        const t = window.TYPES[k], on = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer',
            background: on ? T.accentDim : T.bg2, border: `1px solid ${on ? T.accent : T.line}`,
            borderRadius: 13, padding: '11px 4px', WebkitTapHighlightColor: 'transparent',
          }}>
            <span style={{ fontSize: 20 }}>{t.glyph}</span>
            <span style={{ fontFamily: T.font, fontSize: 10.5, fontWeight: 700, color: on ? T.accent : T.muted, textAlign: 'center', lineHeight: 1.1 }}>{t.short}</span>
          </button>
        );
      })}
    </div>
  );
}

function dateInputStyle() {
  return { ...window.inputStyle, colorScheme: window.T.scheme };
}

function LogSheet({ open, onClose, prefillDate }) {
  const store = window.useStore();
  const T = window.T;
  const date = prefillDate || window.APP_TODAY;
  const [type, setType] = React.useState('box');
  const [notes, setNotes] = React.useState('');
  const [time, setTime] = React.useState('');
  const [d, setD] = React.useState(date);
  React.useEffect(() => { if (open) { setD(prefillDate || window.APP_TODAY); setType('box'); setNotes(''); setTime(''); } }, [open, prefillDate]);

  const todayRows = window.daySessions(window.APP_TODAY, store.state);
  const planMode = d > window.APP_TODAY; // future date => plan; today/past => log
  const save = () => {
    store.logSession({ date: d, type, notes, time, status: planMode ? 'planned' : 'done' });
    onClose();
  };
  return (
    <window.Sheet open={open} onClose={onClose} title={planMode ? 'Plan a session' : 'Log a session'}>
      {/* one-tap from today's plan */}
      {prefillDate == null && todayRows.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <window.Label style={{ marginBottom: 6 }}>Today's plan — one tap to log</window.Label>
          <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 14, padding: '2px 14px' }}>
            {todayRows.map((s, i) => (
              <div key={s.id} style={{ borderTop: i ? `1px solid ${T.line}` : 'none' }}>
                <window.SessionRow s={s} onToggle={sr => store.toggleRow(sr)} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontFamily: T.mono, fontSize: 11, color: T.faint, margin: '14px 0 4px', letterSpacing: 1 }}>— OR ADD ONE —</div>
        </div>
      )}

      {/* mode is determined by the date: future = plan, today/past = log */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: planMode ? 'rgba(154,163,214,0.12)' : T.accentDim, border: `1px solid ${planMode ? 'rgba(154,163,214,0.35)' : T.line2}`, borderRadius: 12, padding: '11px 13px', marginBottom: 16 }}>
        <window.Icon name={planMode ? 'calendar' : 'check'} size={18} />
        <div style={{ fontSize: 12.5, fontWeight: 700, color: planMode ? '#aab2dc' : T.accent }}>
          {planMode ? 'Future date — saved as a planned session (hollow).' : 'Today or earlier — saved as a completed session.'}
        </div>
      </div>
      <window.Field label="Type"><TypeGrid value={type} onChange={setType} /></window.Field>
      <window.Field label="Date"><input type="date" value={d} min="2026-05-18" max="2026-09-16" onChange={e => setD(e.target.value)} style={dateInputStyle()} /></window.Field>
      <window.Field label="Time"><input type="time" value={time} onChange={e => setTime(e.target.value)} style={dateInputStyle()} /></window.Field>
      <window.Field label="Notes"><window.TextArea value={notes} onChange={setNotes} placeholder={planMode ? 'Anything to remember for this session…' : "How'd it go? Tap the mic and talk…"} rows={3} /></window.Field>
      <window.Btn full size="lg" onClick={save}><window.Icon name={planMode ? 'calendar' : 'check'} size={20} stroke={2.5} />{planMode ? 'Add to plan' : 'Log it'}</window.Btn>
    </window.Sheet>
  );
}
window.LogSheet = LogSheet;

function AddSheet({ open, onClose, onLog, onWeight }) {
  const T = window.T;
  const choice = (icon, title, sub, onClick, primary) => (
    <button onClick={() => { onClose(); onClick(); }} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', cursor: 'pointer',
      background: primary ? T.accentDim : T.bg2, border: `1px solid ${primary ? 'transparent' : T.line}`, borderRadius: 16, padding: 16,
      WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: primary ? T.accent : T.card2, color: primary ? T.ink : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Icon name={icon} size={24} stroke={2.4} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.font, fontSize: 16.5, fontWeight: 800, color: T.text }}>{title}</div>
        <div style={{ fontFamily: T.font, fontSize: 12.5, fontWeight: 600, color: T.muted, marginTop: 1 }}>{sub}</div>
      </div>
      <window.Icon name="right" size={18} />
    </button>
  );
  return (
    <window.Sheet open={open} onClose={onClose} title="Add">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 6 }}>
        {choice('plus', 'Log a session', 'Boxing, sparring, HIIT, weights…', onLog, true)}
        {choice('scale', 'Log weight', 'Bodyweight & body fat', onWeight, false)}
      </div>
    </window.Sheet>
  );
}
window.AddSheet = AddSheet;

function WeightSheet({ open, onClose }) {
  const store = window.useStore();
  const T = window.T;
  const [w, setW] = React.useState('');
  const [bf, setBf] = React.useState('');
  const [d, setD] = React.useState(window.APP_TODAY);
  React.useEffect(() => {
    if (open) {
      const ex = store.state.weights.find(x => x.date === window.APP_TODAY);
      setD(window.APP_TODAY); setW(ex ? String(ex.weightLb) : ''); setBf(ex && ex.bodyFatPct != null ? String(ex.bodyFatPct) : '');
    }
  }, [open]);

  const tgt = window.targetWeight(d);
  const delta = w ? +(tgt - +w).toFixed(1) : null;
  const save = () => { if (!w) return; store.addWeight({ date: d, weightLb: +w, bodyFatPct: bf ? +bf : null }); onClose(); };

  return (
    <window.Sheet open={open} onClose={onClose} title="Log weight">
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <window.Label style={{ marginBottom: 8 }}>Weight (lb)</window.Label>
          <input type="number" inputMode="decimal" autoFocus value={w} onChange={e => setW(e.target.value)} placeholder="214.6"
            style={{ ...window.inputStyle, fontSize: 40, fontWeight: 800, padding: '8px 14px', letterSpacing: -1, fontFamily: T.font }} />
        </div>
      </div>
      {delta != null && (
        <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: delta >= 0 ? T.accent : T.warn }}>
          Target {tgt.toFixed(1)} · {Math.abs(delta) < 0.1 ? 'dead on the curve' : `${Math.abs(delta).toFixed(1)} lb ${delta >= 0 ? 'ahead' : 'behind'}`}
        </div>
      )}
      <window.Field label="Body fat % (optional)"><input type="number" inputMode="decimal" value={bf} onChange={e => setBf(e.target.value)} placeholder="manual or scanner" style={window.inputStyle} /></window.Field>
      <window.Field label="Date"><input type="date" value={d} min="2026-05-18" max="2026-09-16" onChange={e => setD(e.target.value)} style={dateInputStyle()} /></window.Field>
      <window.Btn full size="lg" onClick={save}><window.Icon name="check" size={20} stroke={2.5} />Save weigh-in</window.Btn>
    </window.Sheet>
  );
}
window.WeightSheet = WeightSheet;

function DaySheet({ open, onClose, date, openLogFor, onSession }) {
  const store = window.useStore();
  const T = window.T;
  if (!open || !date) return null;
  const plan = window.planForDate(date);
  const block = window.blockForDate(date);
  const rows = window.daySessions(date, store.state);
  const future = date > window.APP_TODAY;
  // committed = real planned/logged work; optional = program "suggestions" not yet done
  const committed = rows.filter(r => !(r.optional && r.status !== 'done'));
  const optional = rows.filter(r => r.optional && r.status !== 'done');

  return (
    <window.Sheet open={open} onClose={onClose} title={`${window.fmtWeekday(date)} · ${window.fmtShort(date)}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {block && <window.Chip on color={block.color}>{block.name}{plan.deload ? ' · deload' : ''}</window.Chip>}
        {future && <window.Chip on color="#9aa3d6">Upcoming</window.Chip>}
        {date === window.FIGHT_DATE && <window.Chip on>FIGHT NIGHT</window.Chip>}
      </div>
      {plan.note && <div style={{ fontSize: 13.5, color: T.muted, fontWeight: 600, marginBottom: 14, lineHeight: 1.45 }}>{plan.note}</div>}

      {committed.length === 0 ? (
        <div style={{ padding: '20px 16px', textAlign: 'center', background: T.bg2, border: `1px dashed ${T.line2}`, borderRadius: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Nothing scheduled</div>
          <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, marginTop: 3 }}>{future ? 'A rest day — or plan a session below.' : 'Rest day. Recover hard.'}</div>
        </div>
      ) : (
        <div style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 14, padding: '2px 14px', marginBottom: 14 }}>
          {committed.map((s, i) => (
            <div key={s.id} style={{ borderTop: i ? `1px solid ${T.line}` : 'none' }}>
              <window.SessionRow s={s} showDate={false} onToggle={sr => store.toggleRow(sr)} onDelete={sr => store.deleteSession(sr)} onOpen={() => onSession && onSession(s)} />
            </div>
          ))}
        </div>
      )}

      {optional.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <window.Label style={{ marginBottom: 6 }}>Optional — tap ○ to add it</window.Label>
          <div style={{ background: T.track, border: `1px dashed ${T.line2}`, borderRadius: 14, padding: '2px 14px' }}>
            {optional.map((s, i) => (
              <div key={s.id} style={{ borderTop: i ? `1px solid ${T.line}` : 'none', opacity: 0.92 }}>
                <window.SessionRow s={s} showDate={false} onToggle={sr => store.toggleRow(sr)} onOpen={() => onSession && onSession(s)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <window.Btn kind="primary" full onClick={() => openLogFor(date)}><window.Icon name={future ? 'calendar' : 'plus'} size={18} stroke={2.5} />{future ? 'Plan a session' : 'Log a session'}</window.Btn>
    </window.Sheet>
  );
}
window.DaySheet = DaySheet;

function SessionDetailSheet({ open, onClose, session }) {
  const store = window.useStore();
  const T = window.T;
  const [notes, setNotes] = React.useState('');
  const [time, setTime] = React.useState('');
  const [moveDate, setMoveDate] = React.useState('');
  const [copyDate, setCopyDate] = React.useState('');
  const [copyMsg, setCopyMsg] = React.useState('');
  const [confirmDel, setConfirmDel] = React.useState(false);
  React.useEffect(() => {
    if (open && session) {
      setNotes(session.notes || '');
      setTime(session.time || '');
      setMoveDate(session.date);
      setCopyDate(window.addDays(session.date, 7) > window.FIGHT_DATE ? window.FIGHT_DATE : window.addDays(session.date, 7));
      setCopyMsg('');
      setConfirmDel(false);
    }
  }, [open, session]);
  if (!open || !session) return null;
  const t = window.TYPES[session.type] || window.TYPES.other;
  const block = window.blockForDate(session.date);
  const done = session.status === 'done';
  const patch = () => ({ notes, time });

  const toggleDone = () => { store.saveSession(session, { ...patch(), status: done ? 'planned' : 'done' }); onClose(); };
  const saveOnly = () => { store.saveSession(session, patch()); onClose(); };
  const reschedule = () => {
    if (moveDate && moveDate !== session.date) {
      store.rescheduleSession({ ...session, notes, time }, moveDate);
    } else { store.saveSession(session, patch()); }
    onClose();
  };
  const del = () => { store.deleteSession(session); onClose(); };
  const copy = () => {
    if (!copyDate) return;
    store.logSession({ date: copyDate, type: session.type, time, notes, status: copyDate > window.APP_TODAY ? 'planned' : 'done' });
    setCopyMsg('Copied to ' + window.fmtWeekday(copyDate) + ' ' + window.fmtShort(copyDate) + '.');
    const nxt = window.addDays(copyDate, 7);
    setCopyDate(nxt > window.FIGHT_DATE ? window.FIGHT_DATE : nxt);
  };

  return (
    <window.Sheet open={open} onClose={onClose} title={t.short}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <window.TypeBadge type={session.type} size={46} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.font, fontSize: 17, fontWeight: 800 }}>{t.label}</div>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, fontWeight: 600 }}>{window.fmtWeekday(session.date)} · {window.fmtShort(session.date)}{session.note ? ' · ' + session.note : ''}</div>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: done ? T.accent : session.status === 'missed' ? T.warn : T.faint }}>
          {done ? 'DONE' : session.status === 'missed' ? 'MISSED' : 'PLANNED'}
        </span>
      </div>

      {/* complete toggle */}
      <window.Btn full size="lg" kind={done ? 'secondary' : 'primary'} onClick={toggleDone} style={{ marginBottom: 18 }}>
        <window.Icon name={done ? 'x' : 'check'} size={20} stroke={2.5} />{done ? 'Mark as not done' : 'Mark as done'}
      </window.Btn>

      <window.Field label="Time"><input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...window.inputStyle, colorScheme: window.T.scheme }} /></window.Field>
      <window.Field label="Notes"><window.TextArea value={notes} onChange={setNotes} placeholder="Add a note…" rows={2} /></window.Field>

      {/* reschedule */}
      <window.Field label="Reschedule — move to">
        <input type="date" value={moveDate} min="2026-05-18" max="2026-09-16" onChange={e => setMoveDate(e.target.value)} style={{ ...window.inputStyle, colorScheme: window.T.scheme }} />
        {moveDate !== session.date && <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, marginTop: 7 }}>Saving will move this to {window.fmtShort(moveDate)}.</div>}
      </window.Field>

      {/* copy / repeat */}
      <window.Field label="Copy to another date">
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="date" value={copyDate} min="2026-05-18" max="2026-09-16" onChange={e => { setCopyDate(e.target.value); setCopyMsg(''); }} style={{ ...window.inputStyle, colorScheme: window.T.scheme, flex: 1 }} />
          <window.Btn kind="secondary" onClick={copy} style={{ flexShrink: 0 }}><window.Icon name="plus" size={18} stroke={2.5} />Copy</window.Btn>
        </div>
        <div style={{ fontSize: 12, color: copyMsg ? T.accent : T.faint, fontWeight: 600, marginTop: 7, lineHeight: 1.4 }}>
          {copyMsg || 'Duplicates the type, time & notes. Tap Copy again to repeat the next week.'}
        </div>
      </window.Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <window.Btn kind="secondary" full onClick={reschedule}><window.Icon name="check" size={18} stroke={2.5} />Save changes</window.Btn>
        {!confirmDel
          ? <window.Btn kind="danger" full onClick={() => setConfirmDel(true)}><window.Icon name="trash" size={17} />Delete</window.Btn>
          : <window.Btn kind="danger" full onClick={del} style={{ background: T.warn, color: '#1a0606', borderColor: T.warn }}><window.Icon name="trash" size={17} />Sure? Delete</window.Btn>}
      </div>
    </window.Sheet>
  );
}
window.SessionDetailSheet = SessionDetailSheet;
