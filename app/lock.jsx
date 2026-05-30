// lock.jsx — local passcode lock (no backend; a privacy screen-lock on this device).
function hashPin(pin) {
  let h = 2166136261 >>> 0;
  const s = 'bct\u00a7' + String(pin);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
window.hashPin = hashPin;

function PinDots({ len, n = 4, error }) {
  const T = window.T;
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          width: 15, height: 15, borderRadius: 99, boxSizing: 'border-box',
          border: `2px solid ${error ? T.warn : i < len ? T.accent : T.line2}`,
          background: i < len ? (error ? T.warn : T.accent) : 'transparent',
          transition: 'all .12s',
        }} />
      ))}
    </div>
  );
}

function PinPad({ onKey, onDelete }) {
  const T = window.T;
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  const Key = ({ k }) => {
    if (k === '') return <div />;
    if (k === 'del') return (
      <button onClick={onDelete} aria-label="delete" style={padBtn(T, true)}><window.Icon name="left" size={24} /></button>
    );
    return <button onClick={() => onKey(k)} style={padBtn(T, false)}>{k}</button>;
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 280, margin: '0 auto' }}>
      {keys.map((k, i) => <Key key={i} k={k} />)}
    </div>
  );
}
function padBtn(T, ghost) {
  return {
    width: 74, height: 74, borderRadius: 99, margin: '0 auto', cursor: 'pointer',
    fontFamily: T.font, fontSize: 28, fontWeight: 700, color: T.text,
    background: ghost ? 'transparent' : T.card, border: `1px solid ${ghost ? 'transparent' : T.line}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent',
  };
}

// Full-screen lock shown on load when a passcode is set
function LockScreen({ expected, onUnlock }) {
  const store = window.useStore();
  const T = window.T;
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (pin.length < 4) return;
    const t = setTimeout(() => {
      if (hashPin(pin) === expected) onUnlock();
      else { setError(true); setTimeout(() => { setError(false); setPin(''); }, 600); }
    }, 110);
    return () => clearTimeout(t);
  }, [pin]);

  const onKey = k => { if (error) return; setPin(p => p.length < 4 ? p + k : p); };
  const onDelete = () => { setError(false); setPin(p => p.slice(0, -1)); };
  const forgot = () => {
    if (confirm("There's no password recovery — your data is stored only on this device, with no server to verify you.\n\nReset will WIPE all data and remove the passcode. Export a backup first if you can.\n\nReset now?")) {
      store.wipeAll(); store.clearPasscode(); onUnlock();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', color: T.text }}>
      <img src="app-icon-192.png" alt="" width="68" height="68" style={{ borderRadius: 18, marginBottom: 22 }} />
      <div style={{ fontFamily: T.font, fontSize: 21, fontWeight: 800, marginBottom: 6, whiteSpace: 'nowrap' }}>Camp Tracker</div>
      <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: error ? T.warn : T.muted, marginBottom: 28 }}>{error ? 'Wrong passcode' : 'Enter your passcode'}</div>
      <div style={{ marginBottom: 36, animation: error ? 'pinShake .4s' : 'none' }}><PinDots len={pin.length} error={error} /></div>
      <PinPad onKey={onKey} onDelete={onDelete} />
      <button onClick={forgot} style={{ marginTop: 30, background: 'none', border: 'none', color: T.faint, fontFamily: T.font, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Forgot passcode?</button>
    </div>
  );
}
window.LockScreen = LockScreen;

// Sheet to set / change / confirm a passcode (used in Settings)
function PasscodeSheet({ open, onClose }) {
  const store = window.useStore();
  const T = window.T;
  const [stage, setStage] = React.useState('new'); // new -> confirm
  const [first, setFirst] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(false);
  React.useEffect(() => { if (open) { setStage('new'); setFirst(''); setPin(''); setError(false); } }, [open]);
  React.useEffect(() => {
    if (pin.length < 4) return;
    const t = setTimeout(() => {
      if (stage === 'new') { setFirst(pin); setPin(''); setStage('confirm'); }
      else if (pin === first) { store.setPasscode(pin); onClose(); }
      else { setError(true); setTimeout(() => { setError(false); setPin(''); setFirst(''); setStage('new'); }, 700); }
    }, 110);
    return () => clearTimeout(t);
  }, [pin]);
  if (!open) return null;

  const onKey = k => { if (error) return; setPin(p => p.length < 4 ? p + k : p); };
  const onDelete = () => setPin(p => p.slice(0, -1));

  return (
    <window.Sheet open={open} onClose={onClose} title="Set a passcode">
      <div style={{ textAlign: 'center', padding: '6px 0 18px' }}>
        <div style={{ fontFamily: T.font, fontSize: 14.5, fontWeight: 700, color: error ? T.warn : T.muted, marginBottom: 22 }}>
          {error ? "Didn't match — start over" : stage === 'new' ? 'Choose a 4-digit passcode' : 'Re-enter to confirm'}
        </div>
        <div style={{ marginBottom: 30, animation: error ? 'pinShake .4s' : 'none' }}><PinDots len={pin.length} error={error} /></div>
        <PinPad onKey={onKey} onDelete={onDelete} />
        <div style={{ fontFamily: T.font, fontSize: 12, color: T.faint, fontWeight: 600, marginTop: 22, lineHeight: 1.5, padding: '0 8px' }}>
          A local lock for this device only. It keeps casual eyes out — but it isn't account security, and there's no recovery, so keep a backup.
        </div>
      </div>
    </window.Sheet>
  );
}
window.PasscodeSheet = PasscodeSheet;
