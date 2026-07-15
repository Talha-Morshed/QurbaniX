import RoleCard from '../../components/RoleCard';
import './styles.css';

const roles = [
  {
    icon: '👤',
    title: 'Customer',
    description: 'Browse verified butchers, compare prices, and book your Qurbani service with confidence.',
  },
  {
    icon: '🔪',
    title: 'Butcher (কসাই)',
    description: 'Manage availability, accept bookings, and offer verified Qurbani services to customers.',
  },
  {
    icon: '🛡️',
    title: 'Administrator',
    description: 'Review registrations, verify butchers, and supervise bookings across the platform.',
  },
];

function SelectRole() {
  return (
    <div className="role-selection">
      <main className="role-selection__container">
        <div className="role-selection__panel">
          <div className="role-selection__header">
            <span className="role-selection__badge">Choose your path</span>
            <h1 className="role-selection__title">Who is using QurbaniX today?</h1>
            <p className="role-selection__description">
              Select the experience that matches your role. This is a safe place to explore the platform.
            </p>
          </div>

          <div className="role-selection__grid">
            {roles.map((role) => (
              <RoleCard key={role.title} {...role} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SelectRole;
