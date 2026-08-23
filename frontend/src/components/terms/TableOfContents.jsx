const links = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'definitions', label: 'Definitions' },
  { id: 'eligibility', label: 'User Eligibility' },
  { id: 'customer-responsibilities', label: 'Customer Responsibilities' },
  { id: 'butcher-responsibilities', label: 'Butcher Responsibilities' },
  { id: 'booking-policy', label: 'Booking Policy' },
  { id: 'payment-policy', label: 'Payment Policy' },
  { id: 'cancellation-refund', label: 'Cancellation & Refund Policy' },
  { id: 'ratings-reviews', label: 'Ratings & Reviews Policy' },
  { id: 'privacy-data', label: 'Privacy & Data Usage' },
  { id: 'prohibited-activities', label: 'Prohibited Activities' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact Information' },
];

function TableOfContents() {
  return (
    <nav className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
      <h3 className="text-sm sm:text-base font-semibold text-slate-900">Contents</h3>
      <ul className="mt-3 sm:mt-4 grid gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.id}>
            <a href={`#${link.id}`} className="transition hover:text-primary">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
