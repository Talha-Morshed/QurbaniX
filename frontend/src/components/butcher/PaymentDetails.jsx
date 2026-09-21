import { Icon } from './ButcherSidebar';

function DetailGroup({ title, items }) {
  return <div className="payment-detail-group"><p className="eyebrow">{title}</p>{items.map(([label, value]) => <div className="payment-detail-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function PaymentDetails({ payment, onClose }) {
  if (!payment) return null;
  return <div className="payment-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="payment-details" role="dialog" aria-modal="true" aria-labelledby="payment-details-title"><div className="payment-details-header"><div><p className="eyebrow">Payment details</p><h2 id="payment-details-title">{payment.transactionId}</h2></div><button type="button" className="payment-close" onClick={onClose} aria-label="Close payment details"><Icon name="close" size={20} /></button></div><div className="payment-detail-status"><span className={`payment-status payment-status-${payment.status.toLowerCase()}`}>{payment.status}</span><span>{payment.amount}</span></div><DetailGroup title="Transaction information" items={[["Transaction ID", payment.transactionId], ["Booking ID", payment.bookingId], ["Date", payment.date], ["Payment method", payment.method], ["Payment status", payment.status]]} /><DetailGroup title="Customer information" items={[["Name", payment.customer], ["Phone", payment.phone], ["Location", payment.location]]} /><DetailGroup title="Service information" items={[["Service", payment.service], ["Animal", payment.animal], ["Amount", payment.amount]]} /><button type="button" className="outline-action payment-close-button" onClick={onClose}>Close</button></aside></div>;
}

export default PaymentDetails;