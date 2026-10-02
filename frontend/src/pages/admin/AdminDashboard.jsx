import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [butchers, setButchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadButchers = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await api.adminUsers({ role: 'butcher' });
      const users = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setButchers(users.filter((entry) => entry?.role === 'butcher'));
    } catch (error) {
      setErrorMsg(error.message || 'Unable to load verification queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadButchers();
  }, []);

  const handleStatusUpdate = async (butcherId, verificationStatus) => {
    try {
      setErrorMsg('');
      await api.verifyButcher(butcherId, { verification_status: verificationStatus });
      await loadButchers();
    } catch (error) {
      setErrorMsg(error.message || 'Unable to update verification status.');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Ignore logout API failure and clear local session.
    } finally {
      logout();
      navigate('/login/admin', { replace: true });
    }
  };

  const pendingButchers = butchers.filter((butcher) => butcher?.butcher_profile?.verification_status === 'pending');

  return (
    <div className="min-h-screen bg-warm-cream px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Verification dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary">{user?.name || 'Administrator'}</div>
            <button type="button" onClick={handleLogout} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50">
              Sign out
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total butchers</p>
            <p className="mt-3 text-3xl font-bold">{butchers.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending review</p>
            <p className="mt-3 text-3xl font-bold">{pendingButchers.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-3 text-xl font-semibold text-primary">Operational</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Butcher verification queue</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              {pendingButchers.length} pending
            </span>
          </div>

          {isLoading ? (
            <div className="text-sm text-slate-600">Loading verification queue...</div>
          ) : pendingButchers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No butchers are awaiting verification.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingButchers.map((butcher) => (
                <div key={butcher.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold">{butcher.name || 'Unnamed butcher'}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {butcher.phone || 'No phone'} · {butcher.butcher_profile?.city || 'No city'} · {butcher.butcher_profile?.area || 'No area'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleStatusUpdate(butcher.id, 'verified')} className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                        Approve
                      </button>
                      <button type="button" onClick={() => handleStatusUpdate(butcher.id, 'rejected')} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
