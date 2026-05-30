// screen-dashboard.jsx
function DayNightToggle() {
  const T = window.T;
  const store = window.useStore();
  const dark = T.scheme === 'dark';
  return (
    <button onClick={() => store.setTheme(dark ? 'light' : 'dark')} aria-label="toggle day/night" style={{
      position: 'relative', width: 66, height: 34, borderRadius: 99, padding: 0, flexShrink: 0,
      border: `1px solid ${T.line2}`, background: T.bg2, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
    }}>
      <span style={{ position: 'absolute', left: 9, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: dark ? T.faint : T.accent }}><window.Icon name="sun" size={16} /></span>
      <span style={{ position: 'absolute', right: 9, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: dark ? T.accent : T.faint }}><window.Icon name="moon" size={15} /></span>
      <span style={{
        position: 'absolute', top: 2, left: dark ? 33 : 2, width: 29, height: 29, borderRadius: 99,
        background: T.accent, color: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'left .2s cubic-bezier(.2,.8,.2,1)', boxShadow: T.shadow,
      }}><window.Icon name={dark ? 'moon' : 'sun'} size={16} /></span>
    </button>
  );
}

function DashboardScreen({ ui }) {
  const store = window.useStore();
  const { state, togglePlannedDone } = store;
  const T = window.T;
  const today = window.APP_TODAY;
  const daysOut = window.daysBetween(today, window.FIGHT_DATE);
  const block = window.blockForDate(today) || window.BLOCKS[0];
  const wk = window.weekOfCamp(today);
  const wd = window.weightDelta(state, today);
  const wsum = window.weekSummary(today, state);
  const todayRows = window.daySessions(today, state);
  const plan = window.planForDate(today);

  const prog = window.getProgram();
  const startW = prog.startWeight, targetW = prog.blocks[prog.blocks.length - 1].wt;
  const pct = wd ? Math.max(0, Math.min(100, ((startW - wd.weight) / (startW - targetW)) * 100)) : 0;

  const deltaLabel = wd ? (Math.abs(wd.delta) < 0.1 ? 'On the curve' : `${Math.abs(wd.delta).toFixed(1)} lb ${wd.ahead ? 'ahead' : 'behind'}`) : '—';
  const bfEntry = state.weights.filter(w => w.bodyFatPct != null).sort((a, b) => a.date < b.date ? 1 : -1)[0];
  const bf = bfEntry ? bfEntry.bodyFatPct : null;
  const bfDelta = bfEntry ? +(window.targetBodyFat(bfEntry.date) - bf).toFixed(1) : null;
  const bfAhead = bfDelta != null && bfDelta >= 0;
  const startBf = prog.startBodyFat, goalBf = prog.goalBodyFat;
  const bfPct = bf != null ? Math.max(0, Math.min(100, ((startBf - bf) / (startBf - goalBf)) * 100)) : 0;
  const bfDeltaLabel = bfDelta != null ? (Math.abs(bfDelta) < 0.1 ? 'On pace' : `${Math.abs(bfDelta).toFixed(1)} ${bfAhead ? 'ahead' : 'behind'}`) : '—';
  const allDone = todayRows.length > 0 && todayRows.every(r => r.status === 'done');

  return (
    <window.Screen title={`${block.name} · Week ${wk}`} sub={`${plan.deload ? 'Deload week · ' : ''}${block.phase} · ${window.TOTAL_CAMP_WEEKS}-wk camp`}
      right={<DayNightToggle />}>

      {/* hero: countdown + weight + body fat (weight & body fat equally weighted) */}
      <window.Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>{daysOut}</span>
            <span style={{ fontSize: 13, color: T.muted, fontWeight: 700 }}>days to fight</span>
          </div>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Sept 16 · 3 × 2 min</span>
        </div>
        <div style={{ display: 'flex' }}>
          {[
            { label: 'Weight', val: wd ? wd.weight.toFixed(1) : '—', unit: 'lb', dLabel: wd ? deltaLabel : 'No data yet', ahead: wd ? wd.ahead : true, has: !!wd, pct, lo: startW + '', hi: targetW + '' },
            { label: 'Body fat', val: bf != null ? bf.toFixed(1) : '—', unit: '%', dLabel: bf != null ? bfDeltaLabel : 'No data yet', ahead: bfAhead, has: bf != null, pct: bfPct, lo: startBf + '%', hi: goalBf + '%' },
          ].map((c, i) => (
            <React.Fragment key={c.label}>
              {i === 1 && <div style={{ width: 1, background: T.line, margin: '2px 16px' }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <window.Label>{c.label}</window.Label>
                <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, letterSpacing: -1.5, marginTop: 4 }}>{c.val}<span style={{ fontSize: 17, color: T.muted, marginLeft: 3 }}>{c.unit}</span></div>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 4, color: !c.has ? T.muted : (c.ahead ? T.accent : T.warn) }}>{c.dLabel}</div>
                <div style={{ marginTop: 11, height: 7, borderRadius: 99, background: T.track, overflow: 'hidden' }}>
                  <div style={{ width: c.pct + '%', height: '100%', background: T.accent, borderRadius: 99, transition: 'width .4s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: T.muted, fontWeight: 600 }}>
                  <span>{c.lo}</span><span>{c.hi}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </window.Card>

      {/* today's work — the ledger view */}
      <window.Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 800, whiteSpace: 'nowrap' }}>Today's work</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{window.fmtWeekday(today).toUpperCase()} {window.fmtShort(today)}</span>
        </div>
        {todayRows.length === 0 ? (
          <div style={{ padding: '14px 0 6px', color: T.muted, fontWeight: 600, fontSize: 14 }}>Rest day. {plan.note || 'Recover — it counts.'}</div>
        ) : (
          <div style={{ marginTop: 2 }}>
            {todayRows.map((s, i) => (
              <div key={s.id} style={{ borderTop: i ? `1px solid ${T.line}` : 'none' }}>
                <window.SessionRow s={s} onToggle={sr => store.toggleRow(sr)} onOpen={() => ui.openSession(s)} />
              </div>
            ))}
          </div>
        )}
        {allDone && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: T.accent }}>All logged. Eat, sleep, repeat.</div>}
        {plan.note && todayRows.length > 0 && <div style={{ marginTop: 8, fontSize: 12.5, color: T.faint, fontWeight: 600 }}>{plan.note}</div>}
      </window.Card>

      {/* this week */}
      <window.Card style={{ marginBottom: 14 }} onClick={() => ui.go('calendar')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>This week</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: wsum.consistency >= 80 ? T.accent : T.muted }}>{wsum.consistency}% consistent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 13 }}>
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>{wsum.done}</span>
          <span style={{ fontSize: 16, color: T.muted, fontWeight: 700 }}>/ {wsum.planned} sessions done</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: Math.max(wsum.planned, wsum.done) }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 99, background: i < wsum.done ? T.accent : T.track }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {window.TYPE_ORDER.filter(t => wsum.byType[t]).map(t => (
            <window.Chip key={t} on color={window.TYPES[t].dot}>{wsum.byType[t]} {window.TYPES[t].short.toLowerCase()}</window.Chip>
          ))}
        </div>
      </window.Card>

      {/* weight vs curve card removed from dashboard — full chart lives on the Weight tab */}
    </window.Screen>
  );
}
window.DashboardScreen = DashboardScreen;
