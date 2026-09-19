function DashboardStats({ stats }) {
  return (
    <section className="butcher-stats" aria-label="Dashboard overview">
      {stats.map((stat) => (
        <article className={`butcher-stat butcher-stat-${stat.tone}`} key={stat.label}>
          <p>{stat.label}</p>
          <strong>{stat.value}</strong>
          <span>{stat.change}</span>
        </article>
      ))}
    </section>
  );
}

export default DashboardStats;