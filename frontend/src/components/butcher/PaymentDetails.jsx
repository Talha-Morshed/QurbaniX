import { Icon } from './ButcherSidebar';

function DetailGroup({ title, items }) {
  return <div className="payment-detail-group"><p className="eyebrow">{title}</p>{items.map(([label, value]) => <div className="payment-detail-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function PaymentDetails({ payment, onClose, onConfirm, isConfirming, error }) {
  if (!payment) return null;
  const canConfirm = payment.method === 'cash'
    && payment.status === 'pending'
    && !payment.receiverConfirmedAt
    && payment.bookingStatus !== 'Cancelled'
    && (payment.purpose !== 'balance' || payment.bookingStatus === 'Completed');
  const awaitingCustomerConfirmation = payment.method === 'cash'
    && payment.status === 'pending'
    && payment.receiverConfirmedAt
    && !payment.payerConfirmedAt;

  return <div className="payment-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="payment-details" role="dialog" aria-modal="true" aria-labelledby="payment-details-title"><div className="payment-details-header"><div><p className="eyebrow">Payment details</p><h2 id="payment-details-title">{payment.transactionId}</h2></div><button type="button" className="payment-close" onClick={onClose} aria-label="Close payment details"><Icon name="close" size={20} /></button></div><div className="payment-detail-status"><span className={`payment-status payment-status-${payment.status.toLowerCase()}`}>{payment.status}</span><span>{payment.amount}</span></div><DetailGroup title="Transaction information" items={[["Payment ID", payment.paymentId], ["Transaction ID", payment.transactionId], ["Booking ID", payment.bookingId], ["Purpose", payment.purpose], ["Date", payment.date], ["Payment method", payment.method], ["Payment status", payment.status], ["Customer confirmation", payment.payerConfirmedAt ? 'Confirmed' : 'Awaiting'], ["Butcher confirmation", payment.receiverConfirmedAt ? 'Confirmed' : 'Awaiting']]} /><DetailGroup title="Customer information" items={[["Name", payment.customer], ["Phone", payment.phone], ["Location", payment.location]]} /><DetailGroup title="Service information" items={[["Service", payment.service], ["Animal", payment.animal], ["Amount", payment.amount]]} />{canConfirm && <button type="button" className="payment-confirm-action" onClick={() => onConfirm(payment.paymentId)} disabled={isConfirming}>{isConfirming ? 'Confirming...' : 'Confirm cash received'}</button>}{awaitingCustomerConfirmation && <p className="payment-confirm-note" role="status">Your confirmation is recorded. Waiting for the customer to confirm.</p>}{error && <p className="payment-confirm-error" role="alert">{error}</p>}<button type="button" className="outline-action payment-close-button" onClick={onClose}>Close</button></aside></div>;
}

export default PaymentDetails;