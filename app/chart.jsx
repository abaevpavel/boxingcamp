// chart.jsx — weight-vs-target-curve chart + dashboard sparkline. Hand-built SVG.
function WeightChart({ weights, from, to, height = 220, showBodyFat = true, showAxis = true, padTop = 14 }) {
  const T = window.T;
  const W = 560, H = height;
  const padL = showAxis ? 34 : 8, padR = showAxis ? 34 : 8, padB = showAxis ? 22 : 8, padT = padTop;
  const total = Math.max(1, window.daysBetween(from, to));
  const xFor = d => padL + (window.daysBetween(from, d) / total) * (W - padL - padR);

  // weight domain
  const inRange = weights.filter(w => w.date >= from && w.date <= to).sort((a, b) => a.date < b.date ? -1 : 1);
  const wVals = inRange.map(w => w.weightLb);
  // include target endpoints in domain
  const tgtFrom = window.targetWeight(from), tgtTo = window.targetWeight(to);
  const lo = Math.min(193, ...wVals, tgtFrom, tgtTo) - 1;
  const hi = Math.max(...(wVals.length ? wVals : [216]), tgtFrom, 216) + 1;
  const ymin = Math.floor(lo), ymax = Math.ceil(hi);
  const yFor = w => padT + (1 - (w - ymin) / (ymax - ymin)) * (H - padT - padB);

  // target curve sampled across range (piecewise from milestones -> sample weekly)
  const tgtPts = [];
  for (let d = from; d <= to; d = window.addDays(d, 3)) tgtPts.push([d, window.targetWeight(d)]);
  if (tgtPts[tgtPts.length - 1][0] !== to) tgtPts.push([to, window.targetWeight(to)]);
  const tgtPath = tgtPts.map((p, i) => (i ? 'L' : 'M') + xFor(p[0]).toFixed(1) + ' ' + yFor(p[1]).toFixed(1)).join(' ');

  // actual weight path + area
  const wPath = inRange.map((p, i) => (i ? 'L' : 'M') + xFor(p.date).toFixed(1) + ' ' + yFor(p.weightLb).toFixed(1)).join(' ');
  const areaPath = inRange.length ? wPath + `L${xFor(inRange[inRange.length - 1].date).toFixed(1)} ${(H - padB).toFixed(1)}L${xFor(inRange[0].date).toFixed(1)} ${(H - padB).toFixed(1)}Z` : '';

  // body fat secondary (own scale)
  // body fat secondary — FIXED domain 5–25% on a right-hand axis
  const BF_MIN = 5, BF_MAX = 25, bfColor = '#9aa3d6';
  const yBf = v => padT + (1 - (v - BF_MIN) / (BF_MAX - BF_MIN)) * (H - padT - padB);
  const bf = inRange.filter(w => w.bodyFatPct != null);
  let bfPath = '', bfLast = null, bfTgtPath = '';
  if (showBodyFat && bf.length > 0) {
    bfPath = bf.map((p, i) => (i ? 'L' : 'M') + xFor(p.date).toFixed(1) + ' ' + yBf(p.bodyFatPct).toFixed(1)).join(' ');
    bfLast = { x: xFor(bf[bf.length - 1].date), y: yBf(bf[bf.length - 1].bodyFatPct) };
    // body-fat target curve sampled across range
    const pts = [];
    for (let d = from; d <= to; d = window.addDays(d, 4)) pts.push([d, window.targetBodyFat(d)]);
    if (pts[pts.length - 1][0] !== to) pts.push([to, window.targetBodyFat(to)]);
    bfTgtPath = pts.map((p, i) => (i ? 'L' : 'M') + xFor(p[0]).toFixed(1) + ' ' + yBf(p[1]).toFixed(1)).join(' ');
  }

  // y gridlines at multiples of 5
  const grid = [];
  for (let w = Math.ceil(ymin / 5) * 5; w <= ymax; w += 5) grid.push(w);

  // month ticks
  const months = [];
  let cur = from.slice(0, 7);
  for (let d = from; d <= to; d = window.addDays(d, 1)) {
    const m = d.slice(0, 7);
    if (m !== cur || d === from) { months.push(d); cur = m; }
  }

  const todayX = (window.APP_TODAY >= from && window.APP_TODAY <= to) ? xFor(window.APP_TODAY) : null;
  const last = inRange[inRange.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.accent} stopOpacity="0.26" />
          <stop offset="1" stopColor={T.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* left axis: weight gridlines */}
      {grid.map(w => (
        <g key={w}>
          <line x1={padL} y1={yFor(w)} x2={W - padR} y2={yFor(w)} stroke={T.grid} strokeWidth="1" />
          {showAxis && <text x={padL - 6} y={yFor(w) + 3} textAnchor="end" fontFamily={T.mono} fontSize="9" fill={T.faint}>{w}</text>}
        </g>
      ))}
      {/* right axis: body fat % (5–25) */}
      {showAxis && showBodyFat && [5, 10, 15, 20, 25].map(v => (
        <text key={'bf' + v} x={W - padR + 7} y={yBf(v) + 3} textAnchor="start" fontFamily={T.mono} fontSize="9" fill={bfColor} opacity="0.9">{v}</text>
      ))}
      {/* month ticks */}
      {showAxis && months.map(d => (
        <text key={d} x={xFor(d)} y={H - 6} textAnchor="middle" fontFamily={T.mono} fontSize="9" fill={T.faint}>
          {window.parseISO(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
        </text>
      ))}
      {/* today marker */}
      {todayX != null && <line x1={todayX} y1={padT} x2={todayX} y2={H - padB} stroke={T.line2} strokeWidth="1" strokeDasharray="2 3" />}
      {/* target curve */}
      <path d={tgtPath} fill="none" stroke={T.muted} strokeWidth="1.6" strokeDasharray="4 4" opacity="0.7" />
      {/* actual */}
      {areaPath && <path d={areaPath} fill="url(#wgrad)" />}
      {wPath && <path d={wPath} fill="none" stroke={T.accent} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />}
      {/* body fat */}
      {bfTgtPath && <path d={bfTgtPath} fill="none" stroke={bfColor} strokeWidth="1.6" strokeDasharray="4 4" opacity="0.55" />}
      {bfPath && <path d={bfPath} fill="none" stroke={bfColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />}
      {bfLast && <circle cx={bfLast.x} cy={bfLast.y} r="3.5" fill={bfColor} />}
      {/* last weight point */}
      {last && <circle cx={xFor(last.date)} cy={yFor(last.weightLb)} r="4.5" fill={T.bg} stroke={T.accent} strokeWidth="2.6" />}
    </svg>
  );
}
window.WeightChart = WeightChart;

// compact sparkline for the dashboard
function Sparkline({ weights, from, to, height = 92 }) {
  return <WeightChart weights={weights} from={from} to={to} height={height} showBodyFat={true} showAxis={false} padTop={10} />;
}
window.Sparkline = Sparkline;
