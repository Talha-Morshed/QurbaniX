function EarningsBreakdown({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return <section className="butcher-panel earnings-breakdown"><div className="panel-heading"><div><p className="eyebrow">Service mix</p><h2>Earnings breakdown</h2></div></div><div className="breakdown-list">{items.map((item) => <div className="breakdown-row" key={item.label}><div><strong>{item.label}</strong><span style={{ width: `${total ? (item.value / total) * 100 : 0}%` }} /></div><b>৳{item.value.toLocaleString()}</b></div>)}{!items.length && <p className="earnings-empty" role="status">No completed payment records yet.</p>}</div></section>;
}

export default EarningsBreakdown;