// ui.jsx — theme tokens + shared primitives. Direction A (Floorplan) visual language.
const DARK = {
  bg: '#0b0c0e', bg2: '#101216', card: '#15171b', card2: '#1c1f25',
  line: 'rgba(255,255,255,0.07)', line2: 'rgba(255,255,255,0.13)',
  text: '#f3f5f7', muted: '#888e97', faint: '#5a616b',
  accent: '#f5c518', accentDim: 'rgba(245,197,24,0.13)', ink: '#1a1500',
  good: '#6fae84', warn: '#d6675f', shadow: '0 6px 18px rgba(245,197,24,0.3)',
  track: 'rgba(255,255,255,0.08)', grid: 'rgba(255,255,255,0.05)',
  chrome: 'rgba(11,12,14,0.93)', sheetShadow: '0 -20px 60px rgba(0,0,0,0.5)',
  font: "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  scheme: 'dark',
};
const LIGHT = {
  bg: '#f5f3ec', bg2: '#eceae1', card: '#ffffff', card2: '#f1efe7',
  line: 'rgba(24,22,18,0.09)', line2: 'rgba(24,22,18,0.17)',
  text: '#1a1c1f', muted: '#5f636b', faint: '#9aa0a8',
  accent: '#9a7200', accentDim: 'rgba(154,114,0,0.13)', ink: '#ffffff',
  good: '#3f8f5c', warn: '#c4453c', shadow: '0 6px 16px rgba(154,114,0,0.28)',
  track: 'rgba(24,22,18,0.08)', grid: 'rgba(24,22,18,0.07)',
  chrome: 'rgba(245,243,236,0.92)', sheetShadow: '0 -20px 60px rgba(40,36,28,0.22)',
  font: "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  scheme: 'light',
};
const T = Object.assign({}, DARK);
window.T = T;
window.THEMES = { dark: DARK, light: LIGHT };
window.resolveTheme = function (setting) {
  return setting === 'light' ? 'light' : 'dark';
};
window.applyTheme = function (mode) {
  Object.assign(window.T, mode === 'light' ? LIGHT : DARK);
  try { document.body.style.background = window.T.bg; } catch (e) {}
  return mode;
};

// ---------- icons (simple line glyphs, currentColor) ----------
function Icon({ name, size = 22, stroke = 2 }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" {...p} /><path d="M5 9.5V21h14V9.5" {...p} /></>,
    calendar: <><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" {...p} /><path d="M3 9h18M8 2.5v4M16 2.5v4" {...p} /></>,
    plus: <path d="M12 5v14M5 12h14" {...p} />,
    scale: <><path d="M4 8h16l-2 12H6L4 8Z" {...p} /><path d="M9 8a3 3 0 0 1 6 0" {...p} /><path d="M12 12v3" {...p} /></>,
    more: <><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" /></>,
    check: <path d="M4 12.5 9.5 18 20 6" {...p} />,
    x: <path d="M6 6l12 12M18 6 6 18" {...p} />,
    left: <path d="M15 5l-7 7 7 7" {...p} />,
    right: <path d="M9 5l7 7-7 7" {...p} />,
    down: <path d="M5 9l7 7 7-7" {...p} />,
    download: <><path d="M12 3v12M7 10l5 5 5-5" {...p} /><path d="M4 20h16" {...p} /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" {...p} /><path d="M4 20h16" {...p} /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...p} /></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" {...p} /><path d="M14 6l4 4" {...p} /></>,
    flag: <><path d="M5 21V4M5 4h11l-2 4 2 4H5" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7.5V12l3 2" {...p} /></>,
    note: <><path d="M5 3.5h10l4 4V20.5H5z" {...p} /><path d="M14 3.5V8h4M8 13h8M8 16.5h5" {...p} /></>,
    bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" {...p} />,
    chart: <><path d="M4 4v16h16" {...p} /><path d="M7 14l4-5 3 3 5-7" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3.2" {...p} /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" {...p} /></>,
    sun: <><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" {...p} /></>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" {...p} />,
    target: <><circle cx="12" cy="12" r="8.5" {...p} /><circle cx="12" cy="12" r="4" {...p} /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" {...p} /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>{paths[name]}</svg>;
}
window.Icon = Icon;

// ---------- buttons ----------
function Btn({ children, kind = 'primary', size = 'md', full, onClick, style = {}, type = 'button' }) {
  const base = {
    fontFamily: T.font, fontWeight: 700, border: '1px solid transparent', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 13, transition: 'transform .08s ease, background .15s', width: full ? '100%' : undefined,
    WebkitTapHighlightColor: 'transparent', whiteSpace: 'nowrap',
  };
  const sizes = { sm: { padding: '9px 14px', fontSize: 13 }, md: { padding: '14px 18px', fontSize: 15 }, lg: { padding: '17px 20px', fontSize: 16 } };
  const kinds = {
    primary: { background: T.accent, color: T.ink },
    secondary: { background: T.card2, color: T.text, borderColor: T.line2 },
    ghost: { background: 'transparent', color: T.muted, borderColor: T.line },
    danger: { background: 'transparent', color: T.warn, borderColor: 'rgba(214,103,95,0.4)' },
  };
  return <button type={type} onClick={onClick} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'} onMouseUp={e => e.currentTarget.style.transform = ''} onMouseLeave={e => e.currentTarget.style.transform = ''} style={{ ...base, ...sizes[size], ...kinds[kind], ...style }}>{children}</button>;
}
window.Btn = Btn;

// ---------- card ----------
function Card({ children, pad = 18, style = {}, onClick }) {
  return <div onClick={onClick} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 20, padding: pad, ...style }}>{children}</div>;
}
window.Card = Card;

// ---------- chip ----------
function Chip({ children, on, color, style = {} }) {
  return <span style={{
    fontFamily: T.font, fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
    padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap',
    color: on ? (color || T.accent) : T.muted,
    background: on ? (color ? color + '22' : T.accentDim) : T.track, ...style,
  }}>{children}</span>;
}
window.Chip = Chip;

// ---------- section label ----------
function Label({ children, style = {} }) {
  return <div style={{ fontFamily: T.font, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: T.muted, ...style }}>{children}</div>;
}
window.Label = Label;

// ---------- type dot + glyph ----------
function TypeBadge({ type, size = 34 }) {
  const t = window.TYPES[type] || window.TYPES.other;
  return <div style={{ width: size, height: size, borderRadius: 10, background: t.dot + '22', border: `1px solid ${t.dot}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, flexShrink: 0 }}>{t.glyph}</div>;
}
window.TypeBadge = TypeBadge;

// ---------- session ledger row (Direction C list, Direction A skin) ----------
function SessionRow({ s, onToggle, onOpen, onDelete, showDate }) {
  const t = window.TYPES[s.type] || window.TYPES.other;
  const done = s.status === 'done', missed = s.status === 'missed';
  const statusColor = done ? T.accent : missed ? T.warn : T.faint;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0' }}>
      {/* tap-target checkbox */}
      <button onClick={() => onToggle && onToggle(s)} aria-label="toggle done" style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0, cursor: 'pointer',
        border: `1.5px solid ${done ? T.accent : T.line2}`, background: done ? T.accent : 'transparent',
        color: done ? T.ink : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent',
      }}><Icon name="check" size={18} stroke={2.6} /></button>

      <div onClick={() => onOpen && onOpen(s)} style={{ flex: 1, minWidth: 0, cursor: onOpen ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: T.font, fontSize: 15.5, fontWeight: 700, color: missed ? T.muted : T.text, textDecoration: missed ? 'line-through' : 'none' }}>{t.short}</span>
          {s.optional && <span style={{ fontFamily: T.font, fontSize: 10.5, fontWeight: 700, color: T.faint, letterSpacing: 0.5, textTransform: 'uppercase' }}>opt</span>}
          {s.adhoc && <span style={{ fontFamily: T.font, fontSize: 10.5, fontWeight: 700, color: T.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>+ad-hoc</span>}
        </div>
        <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {[showDate ? window.fmtWeekday(s.date) + ' ' + window.fmtShort(s.date) : null, window.fmtTime(s.time) || s.when, s.notes || s.note].filter(Boolean).join(' · ')}
        </div>
      </div>

      <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.8, color: statusColor, textTransform: 'uppercase' }}>
        {done ? 'DONE' : missed ? 'MISS' : 'PLAN'}
      </span>
      {onDelete && (s.custom || s.adhoc) && (
        <button onClick={() => onDelete(s)} aria-label="delete" style={{ background: 'none', border: 'none', color: T.faint, cursor: 'pointer', padding: 2, marginLeft: 2 }}><Icon name="trash" size={16} /></button>
      )}
    </div>
  );
}
window.SessionRow = SessionRow;

// ---------- segmented control ----------
function Seg({ options, value, onChange, style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 12, padding: 4, ...style }}>
      {options.map(o => {
        const v = typeof o === 'string' ? o : o.value, lab = typeof o === 'string' ? o : o.label;
        const on = v === value;
        return <button key={v} onClick={() => onChange(v)} style={{
          flex: 1, border: 'none', cursor: 'pointer', borderRadius: 9, padding: '9px 6px',
          fontFamily: T.font, fontSize: 13, fontWeight: 700, textTransform: 'capitalize',
          background: on ? T.accent : 'transparent', color: on ? T.ink : T.muted, WebkitTapHighlightColor: 'transparent',
        }}>{lab}</button>;
      })}
    </div>
  );
}
window.Seg = Seg;

// ---------- text input / textarea ----------
function Field({ label, children }) {
  return <div style={{ marginBottom: 16 }}>{label && <Label style={{ marginBottom: 8 }}>{label}</Label>}{children}</div>;
}
function mkInput() {
  const T = window.T;
  return {
    width: '100%', boxSizing: 'border-box', fontFamily: T.font, fontSize: 16,
    background: T.bg2, border: `1px solid ${T.line2}`, borderRadius: 12, color: T.text,
    padding: '13px 14px', outline: 'none',
  };
}
// live getter so inputs pick up the current theme
Object.defineProperty(window, 'inputStyle', { configurable: true, get: mkInput });
function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return <div style={{ position: 'relative' }}>
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...mkInput(), resize: 'vertical', lineHeight: 1.5 }} />
    <div style={{ position: 'absolute', right: 10, bottom: 10, color: window.T.faint, pointerEvents: 'none' }}><Icon name="mic" size={18} /></div>
  </div>;
}
window.Field = Field; window.TextArea = TextArea;

// ---------- bottom sheet ----------
function Sheet({ open, onClose, title, children, maxH = '88vh' }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 520, background: T.card, borderTopLeftRadius: 26, borderTopRightRadius: 26,
        borderTop: `1px solid ${T.line2}`, maxHeight: maxH, display: 'flex', flexDirection: 'column',
        boxShadow: T.sheetShadow, animation: 'sheetUp .22s cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 8px' }}>
          <div style={{ fontFamily: T.font, fontSize: 19, fontWeight: 800, color: T.text, whiteSpace: 'nowrap' }}>{title}</div>
          <button onClick={onClose} style={{ background: T.card2, border: `1px solid ${T.line}`, color: T.muted, width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ overflowY: 'auto', padding: '8px 18px 26px' }}>{children}</div>
      </div>
    </div>
  );
}
window.Sheet = Sheet;

// ---------- screen scaffolding ----------
function Screen({ title, sub, right, children }) {
  return (
    <div style={{ minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '6px 2px 14px' }}>
        <div>
          {sub && <Label style={{ marginBottom: 4, whiteSpace: 'nowrap' }}>{sub}</Label>}
          <div style={{ fontFamily: T.font, fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: T.text }}>{title}</div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
window.Screen = Screen;
