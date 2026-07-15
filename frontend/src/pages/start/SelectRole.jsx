import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleCard from '../../components/RoleCard';
import './styles.css';

const roles = [
  {
    icon: '👤',
    title: 'Customer',
    description: 'Browse verified butchers, compare prices, and book your Qurbani service with confidence.',
    action: '/register/customer',
  },
  {
    icon: '🔪',
    title: 'Butcher (কসাই)',
    description: 'Manage availability, accept bookings, and offer verified Qurbani services to customers.',
    action: '/register/butcher',
  },
  {
    icon: '🛡️',
    title: 'Administrator',
    description: 'Review registrations, verify butchers, and supervise bookings across the platform.',
    action: '/register/admin',
  },
];

function SelectRole() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

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
              <RoleCard key={role.title} {...role} isSelected={selectedRole === role.title} onSelect={() => setSelectedRole(role.title)} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              disabled={!selectedRole}
              onClick={() => {
                if (selectedRole) {
                  navigate(roles.find((role) => role.title === selectedRole).action);
                }
              }}
              className={`inline-flex w-full max-w-xs items-center justify-center rounded-3xl px-6 py-4 text-sm font-semibold text-white transition duration-200 ${
                selectedRole
                  ? 'bg-[#9b1455] hover:bg-[#7a0f40]'
                  : 'cursor-not-allowed bg-slate-300 text-slate-500'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SelectRole;
