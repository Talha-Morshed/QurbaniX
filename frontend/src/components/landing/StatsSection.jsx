import React from 'react';
import CTAButton from './CTAButton';

export default function StatsSection() {
  return (
    <section className="max-w-6xl mx-auto mt-12 px-6">
      <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="text-3xl font-extrabold text-emerald-900">500+</div>
          <div className="text-sm text-slate-600">Verified Butchers</div>
        </div>

        <div className="flex-1 text-center">
          <div className="inline-block bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xl font-bold text-emerald-900">Find Your Trusted Butcher</div>
            <div className="mt-3">
              <CTAButton>Explore Butchers →</CTAButton>
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-right">
          <div className="text-3xl font-extrabold text-amber-700">4.8 ★</div>
          <div className="text-sm text-slate-600">Average Customer Rating</div>
        </div>
      </div>
    </section>
  );
}
