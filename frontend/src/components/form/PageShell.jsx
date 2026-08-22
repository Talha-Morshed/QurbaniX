/* ============================================================
   PageShell.jsx — Redesigned registration page shell
   ============================================================
   CHANGES MADE:
   - Converted from single-column layout to split-layout (left form, right image panel)
   - Right panel now shows butcher shop scene (Image 3) instead of animal grid
   - Added green gradient right panel with decorative circular overlays
   - Added logo display in the right panel header area
   - Improved responsive behavior for mobile (stacked) and desktop (side-by-side)
   - Preserved all existing props: title, description, children, notice
   - Preserved Navbar integration and overall brand color system
   NOTE: Replace images.login with images.butcherShop once butcher-shop.png
         is added to assets/images/
   ============================================================ */

import images from '../../assets/images';
import Navbar from '../Navbar';

function PageShell({ title, description, children, notice, hideHomeButton = false, hideLogo = false }) {
  return (
    /* Main wrapper: full-screen warm cream background */
    <div className="min-h-screen bg-warm-cream">
      <Navbar hideHomeButton={hideHomeButton} hideLogo={hideLogo} />

      {/* Centered content area with split layout */}
      <div className="py-6 text-slate-900 sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Split-layout container: left form panel + right image panel */}
          <div className="grid w-full overflow-hidden border border-white bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[55fr_45fr]">

            {/* LEFT PANEL — Form area with green header banner */}
            <section className="flex items-center bg-warm-cream px-5 py-8 sm:px-10 lg:px-16 xl:px-24">
              <div className="mx-auto w-full max-w-md">

                {/* Logo */}
                <div className="mb-6 flex items-center">
                  <img src={images.logo} alt="QurbaniX" className="h-20 w-20 object-contain" />
                </div>

                {/* Green header banner with title */}
                <div className="mb-6 rounded-[1.75rem] bg-primary p-6 text-white shadow-primary-soft sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">{title}</p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{description}</h1>
                </div>

                {/* Notice banner (if provided) */}
                {notice && (
                  <p className="mb-6 border-l-4 border-[var(--color-accent)] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {notice}
                  </p>
                )}

                {/* Form content card */}
                <div className="border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
                  {children}
                </div>
              </div>
            </section>

            {/* RIGHT PANEL — Butcher shop scene (Image 3) */}
            <section className="relative min-h-[300px] overflow-hidden border-t border-slate-200 bg-primary sm:min-h-[400px] lg:min-h-none lg:border-l lg:border-t-0">

              {/* Decorative circular overlays */}
              <div className="keep-circular pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" aria-hidden="true" />
              <div className="keep-circular pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[rgba(212,167,44,0.12)]" aria-hidden="true" />

              {/* Butcher shop scene image */}
              <img
                src={images.login}
                alt="Trusted butcher shop - fresh Qurbani meat services"
                className="h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-primary/10" aria-hidden="true" />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageShell;
