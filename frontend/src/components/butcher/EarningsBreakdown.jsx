function EarningsBreakdown({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return <section className="butcher-panel earnings-breakdown"><div className="panel-heading"><div><p className="eyebrow">Service mix</p><h2>Earnings breakdown</h2></div></div><div className="breakdown-list">{items.map((item) => <div className="breakdown-row" key={item.label}><div><strong>{item.label}</strong><span style={{ width: `${(item.value / total) * 100}%` }} /></div><b>৳{item.value.toLocaleString()}</b></div>)}</div></section>;
}

export default EarningsBreakdown;