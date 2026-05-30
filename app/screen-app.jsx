// screen-app.jsx — shell: tab nav, more menu, sheet orchestration, responsive container.
function MoreScreen({ ui }) {
  const T = window.T;
  const rows = [
    { key: 'checkin', icon: 'note', title: 'Weekly check-in', sub: 'Reflect on the week, note to next-week you' },
    { key: 'progress', icon: 'chart', title: 'Progress & benchmarks', sub: 'Camp consistency + conditioning trend' },
    { key: 'settings', icon: 'settings', title: 'Settings', sub: 'Export / import backup, program reference' },
  ];
  return (
    <window.Screen title="More" sub="Tools">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(r => (
          <window.Card key={r.key} pad={16} onClick={() => ui.go(r.key)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: T.accentDim, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Icon name={r.icon} size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 800 }}>{r.title}</div>
              <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.muted, fontWeight: 600, marginTop: 1 }}>{r.sub}</div>
            </div>
            <window.Icon name="right" size={18} />
          </window.Card>
        ))}
      </div>
    </window.Screen>
  );
}

function TabBar({ screen, ui }) {
  const T = window.T;
  const group = ['checkin', 'progress', 'settings', 'more'].includes(screen) ? 'more' : screen;
  const items = [
    { key: 'dashboard', icon: 'home', label: 'Home' },
    { key: 'calendar', icon: 'calendar', label: 'Calendar' },
    { key: '__log', icon: 'plus', label: 'Log', center: true },
    { key: 'weight', icon: 'scale', label: 'Weight' },
    { key: 'more', icon: 'more', label: 'More' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 520, zIndex: 100, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '9px 10px calc(9px + env(safe-area-inset-bottom))', background: T.chrome,
      borderTop: `1px solid ${T.line}`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
    }}>
      {items.map(it => {
        if (it.center) return (
          <button key={it.key} onClick={() => ui.openAdd()} style={{
            width: 52, height: 52, borderRadius: 17, background: T.accent, color: T.ink, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -4, boxShadow: T.shadow, WebkitTapHighlightColor: 'transparent',
          }}><window.Icon name="plus" size={28} stroke={2.6} /></button>
        );
        const on = group === it.key;
        return (
          <button key={it.key} onClick={() => ui.go(it.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer',
            color: on ? T.accent : T.muted, width: 60, WebkitTapHighlightColor: 'transparent',
          }}>
            <window.Icon name={it.icon} size={23} stroke={on ? 2.4 : 2} />
            <span style={{ fontFamily: T.font, fontSize: 10.5, fontWeight: 700 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const T = window.T;
  const { state } = window.useStore(); // subscribe so the shell repaints on theme change
  const passcode = state.settings && state.settings.passcode;
  const [unlocked, setUnlocked] = React.useState(false);
  const [screen, setScreen] = React.useState(() => { try { return localStorage.getItem('bct.screen') || 'dashboard'; } catch (e) { return 'dashboard'; } });
  const [logOpen, setLogOpen] = React.useState(false);
  const [logDate, setLogDate] = React.useState(null);
  const [weightOpen, setWeightOpen] = React.useState(false);
  const [dayOpen, setDayOpen] = React.useState(false);
  const [dayDate, setDayDate] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailSession, setDetailSession] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const scrollRef = React.useRef(null);

  const go = s => { setScreen(s); try { localStorage.setItem('bct.screen', s); } catch (e) {} if (scrollRef.current) scrollRef.current.scrollTop = 0; };

  const ui = {
    go,
    openLog: () => { setLogDate(null); setLogOpen(true); },
    openAdd: () => setAddOpen(true),
    openLogFor: d => { setDayOpen(false); setLogDate(d); setLogOpen(true); },
    openWeight: () => setWeightOpen(true),
    openDay: d => { setDayDate(d); setDayOpen(true); },
    openSession: s => { setDetailSession(s); setDetailOpen(true); },
  };

  const screens = {
    dashboard: <window.DashboardScreen ui={ui} />,
    calendar: <window.CalendarScreen ui={ui} />,
    weight: <window.WeightScreen ui={ui} />,
    checkin: <window.CheckinScreen ui={ui} />,
    progress: <window.ProgressScreen ui={ui} />,
    settings: <window.SettingsScreen ui={ui} />,
    more: <MoreScreen ui={ui} />,
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '100dvh', background: T.bg2, display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 520, height: '100%', background: T.bg, display: 'flex', flexDirection: 'column', boxShadow: '0 0 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'calc(18px + env(safe-area-inset-top)) 18px calc(92px + env(safe-area-inset-bottom))', color: T.text, fontFamily: T.font }}>
          {screens[screen]}
        </div>
        <TabBar screen={screen} ui={ui} />
        <window.LogSheet open={logOpen} onClose={() => setLogOpen(false)} prefillDate={logDate} />
        <window.WeightSheet open={weightOpen} onClose={() => setWeightOpen(false)} />
        <window.DaySheet open={dayOpen} onClose={() => setDayOpen(false)} date={dayDate} openLogFor={ui.openLogFor} onSession={ui.openSession} />
        <window.SessionDetailSheet open={detailOpen} onClose={() => setDetailOpen(false)} session={detailSession} />
        <window.AddSheet open={addOpen} onClose={() => setAddOpen(false)} onLog={() => ui.openLog()} onWeight={() => ui.openWeight()} />
      </div>
      {passcode && !unlocked && <window.LockScreen expected={passcode} onUnlock={() => setUnlocked(true)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(window.StoreProvider, null, React.createElement(App))
);
