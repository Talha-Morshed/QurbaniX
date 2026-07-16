import { useNavigate } from 'react-router-dom';
import TermsSection from '../../components/terms/TermsSection';
import TableOfContents from '../../components/terms/TableOfContents';

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white/90 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#9b1455]">QurbaniX</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Terms & Conditions</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              These are the basic rules for using QurbaniX. They are written in simple language so everyone can understand them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-600 transition hover:border-[#9b1455] hover:text-[#9b1455]"
            aria-label="Close terms and conditions"
          >
            ×
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-6">
            <TableOfContents />
          </div>

          <div className="space-y-6">
            <TermsSection id="introduction" title="Introduction" description="Welcome to QurbaniX. By using our platform, you agree to comply with these Terms & Conditions.">
              <p>QurbaniX is a trusted marketplace that connects customers with verified butchers and administrators for Qurbani-related services. These terms help create a safe, transparent, and fair experience for all users.</p>
            </TermsSection>

            <TermsSection id="definitions" title="Definitions">
              <p><strong>Platform:</strong> The QurbaniX website and services.</p>
              <p><strong>Customer:</strong> A person booking or requesting Qurbani services.</p>
              <p><strong>Butcher:</strong> A verified service provider offering Qurbani services.</p>
              <p><strong>Administrator:</strong> A person who helps manage the platform.</p>
            </TermsSection>

            <TermsSection id="eligibility" title="User Eligibility" description="You must use the platform honestly and responsibly.">
              <p>Users must be at least 18 years old or have permission to create an account. False information or fake accounts may be removed.</p>
            </TermsSection>

            <TermsSection id="customer-responsibilities" title="Customer Responsibilities">
              <p>Customers should provide correct details, pay on time, and communicate clearly with butchers. They should not misuse the platform or try to manipulate reviews.</p>
            </TermsSection>

            <TermsSection id="butcher-responsibilities" title="Butcher Responsibilities">
              <p>Butchers should keep their profile accurate, honor confirmed bookings, and act professionally. They must follow platform rules and local laws.</p>
            </TermsSection>

            <TermsSection id="booking-policy" title="Booking Policy">
              <p>Bookings are confirmed only when the customer receives a valid confirmation. Please review all details before confirming a booking.</p>
            </TermsSection>

            <TermsSection id="payment-policy" title="Payment Policy">
              <p>Payments must be made using approved methods. Fraud or unauthorized payments may lead to account suspension.</p>
            </TermsSection>

            <TermsSection id="cancellation-refund" title="Cancellation & Refund Policy">
              <p>Cancellation rules depend on the timing of the request. Refunds are reviewed based on platform policy and applicable rules.</p>
            </TermsSection>

            <TermsSection id="ratings-reviews" title="Ratings & Reviews Policy">
              <p>Reviews should be honest and fair. Fake or abusive reviews may be removed.</p>
            </TermsSection>

            <TermsSection id="privacy-data" title="Privacy & Data Usage">
              <p>QurbaniX uses your information to run the platform, support accounts, and improve services. Your data is handled responsibly and in line with privacy standards.</p>
            </TermsSection>

            <TermsSection id="prohibited-activities" title="Prohibited Activities">
              <p>Users may not spam, impersonate others, post harmful content, or try to bypass platform rules. Violations may lead to account restrictions.</p>
            </TermsSection>

            <TermsSection id="liability" title="Limitation of Liability">
              <p>QurbaniX is not responsible for indirect or unexpected losses caused by platform use, except where the law says otherwise.</p>
            </TermsSection>

            <TermsSection id="changes" title="Changes to Terms">
              <p>QurbaniX may update these terms from time to time. Continued use of the platform means you accept the latest version.</p>
            </TermsSection>

            <TermsSection id="contact" title="Contact Information">
              <p>If you have questions, please contact the QurbaniX support team through the official contact channels.</p>
            </TermsSection>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
