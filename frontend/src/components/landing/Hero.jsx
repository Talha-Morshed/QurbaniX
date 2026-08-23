import HeroAnimalCard from './HeroAnimalCard';
import CTAButton from './CTAButton';
import images from '../../assets/images';

export default function Hero() {
  return (
    <section className="bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs sm:text-sm">Verified Butchers</span>
            <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-emerald-900">Trusted Qurbani Services, Delivered With Care</h1>
            <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-xl">Find verified butchers, compare transparent pricing, book online, and manage your Qurbani service—reliable professionals at your doorstep.</p>
            <div className="mt-8 flex items-center gap-4">
              <CTAButton>Get Started</CTAButton>
            </div>
          </div>

          <div className="lg:col-span-6">
            {/* Mobile: single clean image */}
            <div className="relative overflow-hidden shadow-2xl md:hidden">
              <img src={images.cow} alt="Cow" className="w-full h-64 sm:h-72 object-cover" />
            </div>

            {/* md+: layered animal collage */}
            <div className="relative hidden md:block w-full h-80 md:h-96 lg:h-[520px] overflow-hidden">
              {/* Top Left - Goat */}
              <div className="absolute left-0 md:-left-4 lg:-left-8 top-0 md:-top-8 lg:-top-12 w-32 h-32 md:w-56 md:h-56 transform rotate-3 z-10">
                <HeroAnimalCard src={images.goat} alt="Goat" />
              </div>

              {/* Top Right - Camel */}
              <div className="absolute right-0 md:-right-8 lg:-right-12 top-0 md:-top-6 lg:-top-8 w-40 h-40 md:w-72 md:h-72 transform md:-translate-y-6 lg:-translate-y-8 shadow-xl z-10">
                <HeroAnimalCard src={images.camel} alt="Camel" />
              </div>

              {/* Center - Cow (Large) - shifted left to avoid overlap */}
              <div className="absolute top-0 md:-top-8 lg:-top-12 flex items-center justify-center md:pl-16 lg:pl-32 h-full">
                <div className="w-56 h-56 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] overflow-hidden shadow-2xl">
                  <img src={images.cow} alt="Cow" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Bottom Left - Sheep (Even Bigger) */}
              <div className="absolute left-0 md:-left-4 lg:-left-8 bottom-0 md:-bottom-10 lg:-bottom-16 w-36 h-36 md:w-60 md:h-60 transform rotate-2">
                <HeroAnimalCard src={images.sheep} alt="Sheep" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
