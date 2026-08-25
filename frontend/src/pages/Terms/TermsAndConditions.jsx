import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsSection from '../../components/terms/TermsSection';
import TableOfContents from '../../components/terms/TableOfContents';

const termsSections = [
  { id: 'introduction', number: '01', title: 'Introduction', description: 'Welcome to QurbaniX. By using our platform, you agree to comply with these Terms & Conditions.', content: <p>QurbaniX is a trusted marketplace that connects customers with verified butchers and administrators for Qurbani-related services. These terms help create a safe, transparent, and fair experience for all users.</p> },
  { id: 'definitions', number: '02', title: 'Definitions', content: <><p><strong>Platform:</strong> The QurbaniX website and services.</p><p><strong>Customer:</strong> A person booking or requesting Qurbani services.</p><p><strong>Butcher:</strong> A verified service provider offering Qurbani services.</p><p><strong>Administrator:</strong> A person who helps manage the platform.</p></> },
  { id: 'eligibility', number: '03', title: 'User Eligibility', description: 'You must use the platform honestly and responsibly.', content: <p>Users must be at least 18 years old or have permission to create an account. False information or fake accounts may be removed.</p> },
  { id: 'customer-responsibilities', number: '04', title: 'Customer Responsibilities', content: <p>Customers should provide correct details, pay on time, and communicate clearly with butchers. They should not misuse the platform or try to manipulate reviews.</p> },
  { id: 'butcher-responsibilities', number: '05', title: 'Butcher Responsibilities', content: <p>Butchers should keep their profile accurate, honor confirmed bookings, and act professionally. They must follow platform rules and local laws.</p> },
  { id: 'booking-policy', number: '06', title: 'Booking Policy', content: <p>Bookings are confirmed only when the customer receives a valid confirmation. Please review all details before confirming a booking.</p> },
  { id: 'payment-policy', number: '07', title: 'Payment Policy', content: <p>Payments must be made using approved methods. Fraud or unauthorized payments may lead to account suspension.</p> },
  { id: 'cancellation-refund', number: '08', title: 'Cancellation & Refund Policy', content: <p>Cancellation rules depend on the timing of the request. Refunds are reviewed based on platform policy and applicable rules.</p> },
  { id: 'ratings-reviews', number: '09', title: 'Ratings & Reviews Policy', content: <p>Reviews should be honest and fair. Fake or abusive reviews may be removed.</p> },
  { id: 'privacy-data', number: '10', title: 'Privacy & Data Usage', content: <p>QurbaniX uses your information to run the platform, support accounts, and improve services. Your data is handled responsibly and in line with privacy standards.</p> },
  { id: 'prohibited-activities', number: '11', title: 'Prohibited Activities', content: <p>Users may not spam, impersonate others, post harmful content, or try to bypass platform rules. Violations may lead to account restrictions.</p> },
  { id: 'liability', number: '12', title: 'Limitation of Liability', content: <p>QurbaniX is not responsible for indirect or unexpected losses caused by platform use, except where the law says otherwise.</p> },
  { id: 'changes', number: '13', title: 'Changes to Terms', content: <p>QurbaniX may update these terms from time to time. Continued use of the platform means you accept the latest version.</p> },
  { id: 'contact-information', number: '14', title: 'Contact Information', content: <p>If you have questions, please contact the QurbaniX support team through the official contact channels.</p> },
];

if (import.meta.env.DEV && (termsSections.length !== 14 || new Set(termsSections.map((section) => section.id)).size !== termsSections.length)) {
  console.error('Terms section validation failed: expected 14 unique sections.');
}

function TermsAndConditions() {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;

    const sections = Array.from(content.querySelectorAll('section[id]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { root: content, rootMargin: '-12% 0px -70% 0px', threshold: [0, 0.2, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const selectSection = (id) => {
    setActiveSection(id);
    contentRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-warm-cream p-3 text-slate-900 sm:p-5 lg:h-screen lg:overflow-hidden lg:p-8">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col overflow-hidden border border-white/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)] lg:h-[calc(100vh-4rem)] lg:grid lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 shrink-0 flex-col overflow-hidden bg-primary px-6 py-6 text-white sm:px-8 lg:sticky lg:top-0 lg:px-7 lg:py-8">
          <div className="shrink-0 border-b border-white/15 pb-6">
            <p className="text-sm font-semibold tracking-wide">QurbaniX</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/55">Platform agreement</p>
          </div>

          <div className="hidden shrink-0 py-8 lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4a72c]">Legal / 01</p>
            <p className="mt-3 max-w-[170px] text-2xl font-semibold leading-tight tracking-tight">The rules behind a trusted service.</p>
          </div>

          <div className="mt-2 min-h-0 overflow-hidden lg:mt-0 lg:flex-1">
            <TableOfContents sections={termsSections} activeSection={activeSection} onSelect={selectSection} />
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden bg-[#fbfaf5] text-slate-900 lg:min-h-0">
          <header className="flex shrink-0 items-start justify-between gap-5 border-b border-primary/25 px-6 py-6 sm:px-10 sm:py-8 lg:px-16 lg:py-10">
            <div className="max-w-3xl">
              <h1 className="mt-5 text-4xl font-semibold leading-[0.9] tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl">
                Terms<br />&amp; Conditions<span className="text-[#d4a72c]">.</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Everything you need to know about using the QurbaniX platform with clarity, confidence, and care.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-300 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span>Last updated / August 2026</span>
                <span>Version / 1.0</span>
              </div>
            </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="premium-action inline-flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 text-2xl leading-none text-slate-600 hover:border-primary hover:text-primary"
            aria-label="Close terms and conditions"
          >
            ×
          </button>
          </header>

          <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8 sm:px-10 lg:min-h-0 lg:px-16 lg:py-12">
            <div className="mx-auto max-w-3xl space-y-1">
            {termsSections.map((section) => (
              <TermsSection key={section.id} {...section}>
                {section.content}
              </TermsSection>
            ))}
            </div>
          </div>
        </section>
        </div>
    </main>
  );
}

export default TermsAndConditions;
