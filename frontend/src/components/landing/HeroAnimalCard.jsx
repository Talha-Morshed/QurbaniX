import React from 'react';

export default function HeroAnimalCard({ src, alt, className = '' }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg bg-white ring-1 ring-slate-100 ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover block" />
    </div>
  );
}
