function EarningsOverview({ stats }) {
  return <section className="earnings-overview">{stats.map((stat) => <article className={`earnings-stat earnings-stat-${stat.tone}`} key={stat.label}><p>{stat.label}</p><strong>{stat.value}</strong><span>{stat.note}</span></article>)}</section>;
}

export default EarningsOverview;