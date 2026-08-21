import images from '../../assets/images';

const Star = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="#D4A72C" className={className}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
  </svg>
);


const StarOutline = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#D4A72C" strokeWidth="1.6" strokeLinejoin="round" className={className}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
  </svg>
);

const VerifiedBadge = () => (
  <svg viewBox="0 0 24 24" fill="#14532D" className="w-4 h-4 shrink-0">
    <path d="M12 1.8l2.4 2 3.1-.3 1 3 2.7 1.6-1 3 1 3-2.7 1.6-1 3-3.1-.3-2.4 2-2.4-2-3.1.3-1-3L2.8 15l1-3-1-3 2.7-1.6 1-3 3.1.3 2.4-2z" />
    <path d="M8.6 12.2l2.2 2.2 4.6-4.8" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ratingBreakdown = [
  { stars: 5, percent: 84 },
  { stars: 4, percent: 11 },
  { stars: 3, percent: 3 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

const topButchers = [
  { image: images.RA, name: 'Rashid Ali', specialty: 'Cow & Camel Specialist', area: 'Dhanmondi, Dhaka', rating: 4.9, orders: 342 },
  { image: images.KS, name: 'Kamran Sheikh', specialty: 'Goat & Sheep Expert', area: 'Gulshan, Dhaka', rating: 4.8, orders: 298 },
  { image: images.IH, name: 'Imran Hossain', specialty: 'Shared Qurbani (7 Shares)', area: 'Mirpur, Dhaka', rating: 4.8, orders: 275 },
];

function Stars({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-6 h-6" />
      ))}
    </div>
  );
}

export default function RatingsButchers() {
  return (
    <section id="ratings" className="bg-gray-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-sm uppercase tracking-widest">Ratings & Reviews</span>
          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-900">Trusted By Thousands Of Families</h2>
          <p className="mt-4 text-lg text-slate-600">Real ratings from real customers—and the top-rated professionals making it happen.</p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 auto-rows-fr gap-10">
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-emerald-900">Overall Rating</h3>
              <span className="text-sm font-semibold text-[#D4A72C] uppercase tracking-wider">Verified Reviews</span>
            </div>
            <div className="mt-4 flex-1 bg-white ring-1 ring-slate-200 shadow-sm p-8 flex flex-col gap-6">
              <div className="flex items-end gap-4">
                <span className="text-6xl font-extrabold text-emerald-900 leading-none">4.8</span>
                <div className="flex flex-col gap-1 pb-1">
                  <Stars />
                  <span className="text-sm text-slate-500">Based on 3,200+ verified reviews</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600 w-7">{row.stars}★</span>
                    <div className="flex-1 h-2.5 bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#D4A72C]" style={{ width: `${row.percent}%` }}></div>
                    </div>
                    <span className="text-sm text-slate-500 w-10 text-right">{row.percent}%</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-2xl font-extrabold text-emerald-900">98%</p>
                  <p className="text-sm text-slate-500">on-time arrivals</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-emerald-900">15k+</p>
                  <p className="text-sm text-slate-500">Qurbani completed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-emerald-900">Top Rated Butchers</h3>
              <span className="text-sm font-semibold text-[#D4A72C] uppercase tracking-wider">This Season</span>
            </div>
            <div className="mt-4 flex-1 bg-white ring-1 ring-slate-200 shadow-sm p-6 flex flex-col justify-between gap-4">
              {topButchers.map((butcher) => (
                <div
                  key={butcher.name}
                  className="premium-action bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg p-5 flex items-center gap-4"
                >
                  <img
                    src={butcher.image}
                    alt={butcher.name}
                    className="keep-circular w-14 h-14 shrink-0 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-emerald-900 truncate">{butcher.name}</p>
                      <VerifiedBadge />
                    </div>
                    <p className="text-sm text-slate-500 truncate">{butcher.specialty} · {butcher.area}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-4 h-4" />
                      <span className="font-bold text-emerald-900">{butcher.rating}</span>
                    </div>
                    <p className="text-xs text-slate-500">{butcher.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
