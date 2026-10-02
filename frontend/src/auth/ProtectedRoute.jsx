import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const loginPaths = {
  customer: '/login/customer',
  butcher: '/login/butcher',
};

const dashboardPaths = {
  customer: '/dashboard/customer',
  butcher: '/dashboard/butcher',
};

export default function ProtectedRoute({ role }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center text-sm text-slate-600" role="status">Checking your session...</main>;
  }

  if (!user) {
    return <Navigate to={loginPaths[role]} replace state={{ from: location }} />;
  }

  if (user.role !== role) {
    return <Navigate to={dashboardPaths[user.role] || '/'} replace />;
  }

  return <Outlet />;
}