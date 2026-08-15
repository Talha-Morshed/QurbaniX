import React from 'react';
import HeroAnimalCard from './HeroAnimalCard';
import CTAButton from './CTAButton';
import images from '../../assets/images';

export default function Hero() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">Verified Butchers</span>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-emerald-900">Trusted Qurbani Services, Delivered With Care</h1>
            <p className="mt-4 text-lg text-slate-700 max-w-xl">Find verified butchers, compare transparent pricing, book online, and manage your Qurbani service—reliable professionals at your doorstep.</p>
            <div className="mt-8 flex items-center gap-4">
              <CTAButton>Get Started</CTAButton>
              <a href="#how-it-works" className="text-slate-700 font-semibold hover:text-emerald-800">How it works</a>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative w-full h-96 lg:h-[520px]">
              {/* Top Left - Goat */}
              <div className="absolute -left-8 -top-12 w-44 h-44 md:w-56 md:h-56 transform rotate-3 z-10">
                <HeroAnimalCard src={images.goat} alt="Goat" />
              </div>

              {/* Top Right - Camel */}
              <div className="absolute -right-6 -top-8 w-56 h-56 md:w-72 md:h-72 transform -translate-y-8 shadow-xl z-10">
                <HeroAnimalCard src={images.camel} alt="Camel" />
              </div>

              {/* Center - Cow (Large) - shifted left to avoid overlap */}
              <div className="absolute -top-12 flex items-center justify-start pl-8 h-full">
                <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] rounded-3xl overflow-hidden shadow-2xl">
                  <img src={images.cow} alt="Cow" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Bottom Left - Sheep (Even Bigger) */}
              <div className="absolute -left-24 -bottom-16 w-48 h-48 md:w-60 md:h-60 transform rotate-2">
                <HeroAnimalCard src={images.sheep} alt="Sheep" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
