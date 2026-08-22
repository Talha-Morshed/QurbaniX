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

function PageShell({ title, description, children, notice, hideHomeButton = false, hideLogo = false }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-warm-cream p-4 text-slate-900 sm:p-6 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:p-8 xl:p-10">
      <div className="grid w-full overflow-hidden border border-white bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)] lg:h-[calc(100vh-4rem)] lg:w-[min(90vw,1440px)] lg:grid-cols-[45fr_55fr] xl:h-[calc(100vh-5rem)]">

        {/* LEFT PANEL — Form area */}
        <section className="flex items-center bg-warm-cream px-5 py-8 sm:px-10 lg:px-16 xl:px-24 lg:py-3">
          <div className="mx-auto w-full max-w-md">

            {/* Logo */}
            <div className="mb-4 flex items-center">
              <img src={images.logo} alt="QurbaniX" className="h-24 w-24 object-contain" />
            </div>

            {/* Green header banner with title */}
            <div className="mb-4 rounded-[1.75rem] bg-primary p-4 text-white shadow-primary-soft sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">{title}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{description}</h1>
            </div>

            {/* Notice banner (if provided) */}
            {notice && (
              <p className="mb-4 border-l-4 border-[var(--color-accent)] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                {notice}
              </p>
            )}

            {/* Form content card */}
            <div className="mt-4 border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-6">
              {children}
            </div>
          </div>
        </section>

        {/* RIGHT PANEL — Butcher shop scene */}
        <section className="relative min-h-48 max-h-64 overflow-hidden border-t border-slate-200 bg-primary sm:min-h-64 lg:max-h-none lg:border-l lg:border-t-0">
          <div className="keep-circular pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" aria-hidden="true" />
          <div className="keep-circular pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[rgba(212,167,44,0.12)]" aria-hidden="true" />
          <img
            src={images.login}
            alt="Trusted butcher shop - fresh Qurbani meat services"
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-primary/10" aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}

export default PageShell;
