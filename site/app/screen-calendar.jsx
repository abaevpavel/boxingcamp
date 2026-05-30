// screen-calendar.jsx
function CalendarScreen({ ui }) {
  const { state } = window.useStore();
  const T = window.T;
  const [view, setView] = React.useState('month');
  const [anchor, setAnchor] = React.useState(window.APP_TODAY);

  const monthStart = anchor.slice(0, 7) + '-01';
  const monthLabel = window.parseISO(monthStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const shiftMonth = n => {
    const d = window.parseISO(monthStart); d.setMonth(d.getMonth() + n);
    const iso = window.toISO(d);
    if (iso >= '2026-05-01' && iso <= '2026-09-01') setAnchor(iso);
  };
  const shiftWeek = n => {
    const iso = window.addDays(window.startOfWeek(anchor), n * 7);
    if (iso >= '2026-05-18' && iso <= '2026-09-16') setAnchor(iso);
  };

  return (
    <window.Screen title="Calendar" sub="Schedule"
      right={<window.Seg options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} value={view} onChange={setView} style={{ width: 150 }} />}>

      {/* legend */}
      <div style={{ marginBottom: 14, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: '12px 14px' }}>
        {/* workout type colors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center' }}>
          {['box', 'spar', 'group', 'hiit', 'weights'].map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: window.TYPES[k].dot }} />
              <span style={{ fontFamily: T.font, fontSize: 11.5, fontWeight: 700, color: T.text }}>{window.TYPES[k].short}</span>
            </div>
          ))}
        </div>
        {/* planned vs logged */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', marginTop: 11, paddingTop: 11, borderTop: `1px solid ${T.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, border: `1.5px solid ${T.muted}`, boxSizing: 'border-box' }} />
            <span style={{ fontFamily: T.font, fontSize: 11.5, fontWeight: 700, color: T.muted }}>Planned</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: T.muted }} />
            <span style={{ fontFamily: T.font, fontSize: 11.5, fontWeight: 700, color: T.muted }}>Logged</span>
          </div>
        </div>
        {/* training phases — own line */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 13px', marginTop: 11, paddingTop: 11, borderTop: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: T.font, fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: T.faint, marginRight: 2 }}>Phase</span>
          {window.BLOCKS.map(b => (
            <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: b.color }} />
              <span style={{ fontFamily: T.font, fontSize: 11.5, fontWeight: 700, color: T.muted }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {view === 'month' ? (
        <MonthView monthStart={monthStart} label={monthLabel} onShift={shiftMonth} onDay={ui.openDay} state={state} />
      ) : (
        <WeekView anchor={anchor} onShift={shiftWeek} onDay={ui.openDay} state={state} />
      )}
    </window.Screen>
  );
}

function NavHead({ label, onPrev, onNext }) {
  const T = window.T;
  const btn = { background: window.T.card, border: `1px solid ${T.line}`, color: T.text, width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <button style={btn} onClick={onPrev}><window.Icon name="left" size={18} /></button>
      <div style={{ fontFamily: T.font, fontSize: 17, fontWeight: 800 }}>{label}</div>
      <button style={btn} onClick={onNext}><window.Icon name="right" size={18} /></button>
    </div>
  );
}

function MonthView({ monthStart, label, onShift, onDay, state }) {
  const T = window.T;
  const first = window.parseISO(monthStart);
  const lead = (first.getDay() + 6) % 7; // Mon-based blanks
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(window.toISO(new Date(first.getFullYear(), first.getMonth(), d)));
  while (cells.length % 7) cells.push(null);

  return (
    <div>
      <NavHead label={label} onPrev={() => onShift(-1)} onNext={() => onShift(1)} />
      {(() => {
        let total = 0, done = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const iso = window.toISO(new Date(first.getFullYear(), first.getMonth(), d));
          window.daySessions(iso, state).forEach(r => {
            if (r.planned && !r.optional) total++;
            if (r.status === 'done') done++;
          });
        }
        const pct = total > 0 ? Math.round((Math.min(done, total) / total) * 100) : (done > 0 ? 100 : 0);
        const stat = (lab, val, color) => (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: color || T.text }}>{val}</div>
            <window.Label style={{ marginTop: 2, textAlign: 'center' }}>{lab}</window.Label>
          </div>
        );
        return (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: '14px 16px', marginBottom: 12 }}>
            {total === 0 && done === 0 ? (
              <div style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 600, color: T.muted, textAlign: 'center' }}>Nothing planned this month — tap a day to add sessions.</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {stat('Planned', total)}
                  <div style={{ width: 1, alignSelf: 'stretch', background: T.line }} />
                  {stat('Done', done, T.accent)}
                  <div style={{ width: 1, alignSelf: 'stretch', background: T.line }} />
                  {stat('Complete', pct + '%', pct >= 80 ? T.accent : pct > 0 ? T.text : T.muted)}
                </div>
                <div style={{ marginTop: 12, height: 7, borderRadius: 99, background: T.track, overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: T.accent, borderRadius: 99, transition: 'width .3s' }} />
                </div>
              </>
            )}
          </div>
        );
      })()}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5, marginBottom: 6 }}>
        {window.WD.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.faint }}>{d[0]}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const block = window.blockForDate(iso);
          const rows = window.daySessions(iso, state);
          const planned = rows.filter(r => !r.optional || r.status === 'done');
          const isToday = iso === window.APP_TODAY;
          const isFight = iso === window.FIGHT_DATE;
          const dayNum = +iso.slice(8, 10);
          return (
            <button key={i} onClick={() => onDay(iso)} style={{
              aspectRatio: '1', borderRadius: 10, cursor: 'pointer', position: 'relative', overflow: 'hidden',
              background: isFight ? T.accent : block ? block.color + '2e' : T.card,
              border: isToday ? `1.5px solid ${T.accent}` : `1px solid ${block ? block.color + '5e' : T.line}`,
              borderTop: isFight ? `1.5px solid ${T.accent}` : block ? `4px solid ${block.color}` : `1px solid ${T.line}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
              padding: '5px 2px 2px', WebkitTapHighlightColor: 'transparent',
            }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: isFight ? T.ink : isToday ? T.accent : T.text }}>{isFight ? '🥊' : dayNum}</span>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto', maxWidth: '100%' }}>
                {planned.slice(0, 4).map((r, j) => {
                  const c = window.TYPES[r.type].dot;
                  const done = r.status === 'done', missed = r.status === 'missed';
                  return <span key={j} style={{
                    width: 8, height: 8, borderRadius: 99, boxSizing: 'border-box',
                    background: done ? c : 'transparent',
                    border: `1.5px solid ${c}`,
                    opacity: missed ? 0.35 : 1,
                  }} />;
                })}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontSize: 12.5, color: T.faint, fontWeight: 600, textAlign: 'center' }}>Tap any day to check sessions off or add a note.</div>
    </div>
  );
}

function WeekView({ anchor, onShift, onDay, state }) {
  const T = window.T;
  const start = window.startOfWeek(anchor);
  const label = `${window.fmtShort(start)} – ${window.fmtShort(window.addDays(start, 6))}`;
  return (
    <div>
      <NavHead label={label} onPrev={() => onShift(-1)} onNext={() => onShift(1)} />
      {(() => {
        const sum = window.weekSummary(anchor, state);
        const total = sum.planned, done = sum.done;
        const pct = total > 0 ? Math.round((Math.min(done, total) / total) * 100) : (done > 0 ? 100 : 0);
        const stat = (label, val, color) => (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: color || T.text }}>{val}</div>
            <window.Label style={{ marginTop: 2, textAlign: 'center' }}>{label}</window.Label>
          </div>
        );
        return (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: '14px 16px', marginBottom: 12 }}>
            {total === 0 && done === 0 ? (
              <div style={{ fontFamily: T.font, fontSize: 13.5, fontWeight: 600, color: T.muted, textAlign: 'center' }}>Nothing planned this week — tap a day to add sessions.</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {stat('Planned', total)}
                  <div style={{ width: 1, alignSelf: 'stretch', background: T.line }} />
                  {stat('Done', done, T.accent)}
                  <div style={{ width: 1, alignSelf: 'stretch', background: T.line }} />
                  {stat('Complete', pct + '%', pct >= 80 ? T.accent : pct > 0 ? T.text : T.muted)}
                </div>
                <div style={{ marginTop: 12, height: 7, borderRadius: 99, background: T.track, overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: T.accent, borderRadius: 99, transition: 'width .3s' }} />
                </div>
              </>
            )}
          </div>
        );
      })()}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const iso = window.addDays(start, i);
          const block = window.blockForDate(iso);
          const rows = window.daySessions(iso, state);
          const isToday = iso === window.APP_TODAY;
          const isFight = iso === window.FIGHT_DATE;
          return (
            <div key={iso} onClick={() => onDay(iso)} style={{
              background: T.card, border: `1px solid ${isToday ? T.accent + '66' : T.line}`, borderRadius: 16,
              padding: '12px 14px', cursor: 'pointer', borderLeft: `4px solid ${isFight ? T.accent : block ? block.color : T.line2}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: T.font, fontSize: 15, fontWeight: 800, color: isToday ? T.accent : T.text }}>{window.WD[i]}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{window.fmtShort(iso)}</span>
                  {isFight && <window.Chip on>FIGHT</window.Chip>}
                </div>
                {rows.length > 0 && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{rows.filter(r => r.status === 'done').length}/{rows.filter(r => !r.optional || r.status === 'done').length}</span>}
              </div>
              {rows.length === 0 ? (
                <div style={{ fontSize: 13, color: T.faint, fontWeight: 600, marginTop: 4 }}>Rest</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
                  {rows.map((r, j) => (
                    <span key={j} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: T.font, fontSize: 12, fontWeight: 700,
                      padding: '4px 8px', borderRadius: 7,
                      background: r.status === 'done' ? T.accentDim : T.track,
                      color: r.status === 'done' ? T.accent : r.status === 'missed' ? T.warn : T.muted,
                      textDecoration: r.status === 'missed' ? 'line-through' : 'none',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: window.TYPES[r.type].dot }} />
                      {window.TYPES[r.type].short}{r.time ? ' · ' + window.fmtTime(r.time) : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.CalendarScreen = CalendarScreen;
