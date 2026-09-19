import { Icon } from './ButcherSidebar';

function RecentActivity({ activities }) {
  return (
    <section className="butcher-panel activity-panel" id="reviews">
      <div className="panel-heading"><div><p className="eyebrow">Your latest updates</p><h2>Recent activity</h2></div><button type="button" className="icon-action" aria-label="More activity options">•••</button></div>
      <div className="activity-list">{activities.map((activity) => <div className="activity-item" key={`${activity.title}-${activity.time}`}>
        <span className="activity-icon"><Icon name={activity.icon === 'payment' ? 'chart' : activity.icon} size={16} /></span>
        <div><strong>{activity.title}</strong><p>{activity.detail}</p></div><time>{activity.time}</time>
      </div>)}</div>
    </section>
  );
}

export default RecentActivity;