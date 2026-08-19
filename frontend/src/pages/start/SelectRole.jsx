import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleCard from '../../components/RoleCard';
import Navbar from '../../components/Navbar';
import './styles.css';

const roles = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 21a9 9 0 1118 0H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Customer',
    description: 'Browse verified butchers, compare prices, and book your Qurbani service with confidence.',
    action: '/register/customer',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 3v5.5A4.5 4.5 0 0016 8.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11.5 8.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Butcher (কসাই)',
    description: 'Manage availability, accept bookings, and offer verified Qurbani services to customers.',
    action: '/register/butcher',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 2.7V12c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V5.7L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
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
      <Navbar />
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
              className={`premium-action inline-flex w-full max-w-xs items-center justify-center rounded-3xl px-6 py-4 text-sm font-semibold text-white ${
                selectedRole
                  ? 'bg-primary hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-1'
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
