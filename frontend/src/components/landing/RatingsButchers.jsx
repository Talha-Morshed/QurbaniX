import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';
import { mapDirectoryButcher } from '../../utils/butcherDirectory';

const Star = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="#D4A72C" className={className} aria-hidden="true">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
  </svg>
);

const VerifiedBadge = () => (
  <svg viewBox="0 0 24 24" fill="#14532D" className="w-4 h-4 shrink-0" aria-label="Verified butcher">
    <path d="M12 1.8l2.4 2 3.1-.3 1 3 2.7 1.6-1 3 1 3-2.7 1.6-1 3-3.1-.3-2.4 2-2.4-2-3.1.3-1-3L2.8 15l1-3-1-3 2.7-1.6 1-3 3.1.3 2.4-2z" />
    <path d="M8.6 12.2l2.2 2.2 4.6-4.8" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function RatingsButchers() {
  const [butchers, setButchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const loadButchers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.butchers({ per_page: 3, sort: 'rating' });
      setButchers((response.data || []).map(mapDirectoryButcher));
    } catch (requestError) {
      setButchers([]);
      setError(requestError?.message || 'Unable to load verified butcher profiles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadButchers();
  }, [loadButchers, retryKey]);

  return (
    <section id="ratings" className="bg-gray-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-sm uppercase tracking-widest">Ratings &amp; Reviews</span>
          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-900">Explore Verified Butchers</h2>
          <p className="mt-4 text-lg text-slate-600">Review actual butcher profiles, services, ratings, and published customer feedback.</p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 auto-rows-fr gap-10">
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-emerald-900">About customer ratings</h3>
              <span className="text-sm font-semibold text-[#D4A72C] uppercase tracking-wider">Published reviews</span>
            </div>
            <div className="mt-4 flex-1 bg-white ring-1 ring-slate-200 shadow-sm p-8 flex flex-col justify-center gap-4">
              <p className="text-lg font-semibold text-emerald-900">Ratings belong to each butcher profile.</p>
              <p className="text-sm leading-relaxed text-slate-600">The directory shows each profile&apos;s published review average and count. Butchers without published reviews are identified as having no reviews yet.</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-emerald-900">Verified butchers</h3>
              <span className="text-sm font-semibold text-[#D4A72C] uppercase tracking-wider">From the directory</span>
            </div>
            <div className="mt-4 flex-1 bg-white ring-1 ring-slate-200 shadow-sm p-6 flex flex-col justify-between gap-4">
              {isLoading ? <p className="text-sm text-slate-500" role="status">Loading verified butcher profiles...</p> : null}
              {!isLoading && error ? (
                <div className="text-sm text-slate-600" role="alert">
                  <p>{error}</p>
                  <button type="button" className="mt-3 font-semibold text-emerald-800" onClick={() => setRetryKey((current) => current + 1)}>Try again</button>
                </div>
              ) : null}
              {!isLoading && !error && butchers.length === 0 ? <p className="text-sm text-slate-500">No verified butcher profiles are currently listed.</p> : null}
              {!isLoading && !error ? butchers.map((butcher) => (
                <div key={butcher.id} className="premium-action bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg p-5 flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-emerald-800 font-bold text-white" aria-hidden="true">{butcher.initials}</span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-emerald-900 truncate">{butcher.name}</p>
                      {butcher.verified ? <VerifiedBadge /> : null}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{[butcher.services.join(', '), butcher.area].filter(Boolean).join(' · ')}</p>
                  </div>

                  <div className="text-right shrink-0">
                    {butcher.reviews > 0 ? (
                      <>
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-4 h-4" />
                          <span className="font-bold text-emerald-900">{butcher.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-slate-500">{butcher.reviews} reviews</p>
                      </>
                    ) : <p className="text-xs text-slate-500">No published reviews</p>}
                    <p className="text-xs text-slate-500">{butcher.completedServices} completed services</p>
                  </div>
                </div>
              )) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
