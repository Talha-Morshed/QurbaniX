import { useNavigate } from 'react-router-dom';

export default function CTAButton({ children }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/login/customer')}
      className="inline-flex items-center gap-3 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-3 font-semibold shadow-lg transition-transform transform hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}
