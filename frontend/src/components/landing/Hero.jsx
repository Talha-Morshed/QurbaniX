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
              <div className="absolute -left-8 top-6 w-36 h-36 md:w-44 md:h-44 transform rotate-3">
                <HeroAnimalCard src={images.goat} alt="Goat" />
              </div>

              <div className="absolute right-8 top-0 w-56 h-56 md:w-72 md:h-72 transform -translate-y-4 shadow-xl">
                <HeroAnimalCard src={images.sheep} alt="Sheep" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] rounded-3xl overflow-hidden shadow-2xl">
                  <img src={images.cow} alt="Cow" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="absolute left-6 bottom-6 w-28 h-28 md:w-36 md:h-36 transform rotate-2">
                <HeroAnimalCard src={images.cow2} alt="Cow 2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
