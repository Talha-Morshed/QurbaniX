import { Link } from 'react-router-dom';
import images from '../../assets/images';

const navigation = [
  ['Dashboard', 'grid'],
  ['Bookings', 'calendar'],
  ['Services & Pricing', 'tag'],
  ['Availability', 'clock'],
  ['Earnings', 'chart'],
  ['Reviews', 'star'],
  ['Profile', 'user'],
];

function Icon({ name, size = 18 }) {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    calendar: 'M5 4v3m14-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z',
    tag: 'm20 13-7 7-9-9V4h7l9 9ZM8 8h.01',
    clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    chart: 'M5 19V9m7 10V5m7 14v-7',
    star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
    user: 'M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    inbox: 'M4 5h16v14H4zM4 15h4l2 2h4l2-2h4',
    scissors: 'm6 6 12 12M6 18 18 6M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function ButcherSidebar() {
  return (
    <aside className="butcher-sidebar">
      <Link to="/dashboard/butcher" className="butcher-brand" aria-label="QurbaniX butcher dashboard">
        <img src={images.logo} alt="" />
        <span>Qurbani<span>X</span></span>
      </Link>
      <p className="butcher-nav-label">Workspace</p>
      <nav aria-label="Butcher dashboard navigation">
        {navigation.map(([label, icon], index) => (
          <a key={label} href={`#${label.toLowerCase().replaceAll(' ', '-')}`} className={`butcher-nav-item ${index === 0 ? 'is-active' : ''}`}>
            <Icon name={icon} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="butcher-sidebar-footer">
        <div className="butcher-help-mark">?</div>
        <div><strong>Need help?</strong><span>Visit support center</span></div>
      </div>
    </aside>
  );
}

export { Icon };
export default ButcherSidebar;