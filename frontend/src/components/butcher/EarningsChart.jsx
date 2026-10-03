function EarningsChart({ data }) {
  const maxValue = Math.max(1000, ...data.map((item) => item.value));
  const scaleMax = Math.ceil(maxValue / 1000) * 1000;
  const points = data.map((item, index) => `${40 + (index * 120)},${188 - ((item.value / scaleMax) * 142)}`).join(' ');

  return <section className="butcher-panel earnings-chart-panel"><div className="panel-heading"><div><p className="eyebrow">Performance overview</p><h2>Earnings over time</h2></div><span className="chart-period">Last 6 months</span></div><div className="earnings-chart"><svg viewBox="0 0 640 220" role="img" aria-label={`Earnings over ${data.map((item) => item.label).join(', ')}`}><line x1="40" y1="188" x2="640" y2="188" /><line x1="40" y1="117" x2="640" y2="117" /><line x1="40" y1="46" x2="640" y2="46" /><polyline points={points} /><polyline points={`40,188 ${points} 640,188`} className="chart-area" />{data.map((item, index) => { const x = 40 + (index * 120); const y = 188 - ((item.value / scaleMax) * 142); return <g key={item.label}><circle cx={x} cy={y} r="4" /><text x={x} y="210" textAnchor="middle">{item.label}</text></g>; })}</svg><div className="chart-scale"><span>৳0</span><span>৳{Math.round(scaleMax / 2).toLocaleString()}</span><span>৳{scaleMax.toLocaleString()}</span></div></div></section>;
}

export default EarningsChart;