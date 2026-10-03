import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import EarningsBreakdown from '../../components/butcher/EarningsBreakdown';
import EarningsChart from '../../components/butcher/EarningsChart';
import EarningsOverview from '../../components/butcher/EarningsOverview';
import PaymentDetails from '../../components/butcher/PaymentDetails';
import PaymentHistory from '../../components/butcher/PaymentHistory';
import '../dashboard/ButcherDashboard.css';
import './Earnings.css';

const paymentFilters = ['All', 'paid', 'pending', 'failed', 'cancelled'];

function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

function formatDate(date) {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function mapPayment(booking, payment) {
  const service = booking.service || {};
  return {
    paymentId: payment.id,
    transactionId: payment.provider_reference || String(payment.id),
    bookingId: booking.reference || String(booking.id),
    customer: booking.customer?.name || 'Customer',
    phone: booking.customer?.phone || '—',
    location: [booking.area, booking.city].filter(Boolean).join(', ') || '—',
    service: service.name || 'Service',
    animal: service.animal || '—',
    date: formatDate(payment.created_at),
    createdAt: payment.created_at,
    amount: formatMoney(payment.amount),
    amountValue: Number(payment.amount || 0),
    method: payment.method,
    purpose: payment.purpose,
    status: payment.status,
    bookingStatus: booking.status,
    bookingPaymentStatus: booking.payment_status,
    payerConfirmedAt: payment.payer_confirmed_at,
    receiverConfirmedAt: payment.receiver_confirmed_at,
  };
}

function paymentsFromBookings(bookings) {
  return bookings.flatMap((booking) => (booking.payments || []).map((payment) => mapPayment(booking, payment)));
}

function Earnings() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const bookings = [];
      let page = 1;
      let lastPage = 1;
      do {
        const response = await api.butcherBookings({ per_page: 100, page });
        bookings.push(...(response.data || []));
        lastPage = response.last_page || 1;
        page += 1;
      } while (page <= lastPage);
      const loadedPayments = paymentsFromBookings(bookings);
      setPayments(loadedPayments);
      return loadedPayments;
    } catch (error) {
      setLoadError(error.message || 'Unable to load payments. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const visiblePayments = useMemo(() => payments.filter((payment) => {
    const matchesFilter = activeFilter === 'All' || payment.status === activeFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${payment.transactionId} ${payment.bookingId} ${payment.customer}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  }), [activeFilter, payments, search]);

  const paidPayments = useMemo(() => payments.filter((payment) => payment.status === 'paid'), [payments]);
  const pendingPayments = useMemo(() => payments.filter((payment) => payment.status === 'pending'), [payments]);
  const earningsOverview = useMemo(() => {
    const now = new Date();
    const thisMonthPayments = paidPayments.filter((payment) => {
      const date = new Date(payment.createdAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
    const paidTotal = (list) => list.reduce((total, payment) => total + payment.amountValue, 0);

    return [
      { label: 'Total earnings', value: formatMoney(paidTotal(paidPayments)), note: `${paidPayments.length} paid payments`, tone: 'green' },
      { label: 'This month', value: formatMoney(paidTotal(thisMonthPayments)), note: `${thisMonthPayments.length} paid payments`, tone: 'gold' },
      { label: 'Pending payments', value: formatMoney(paidTotal(pendingPayments)), note: `${pendingPayments.length} awaiting confirmation`, tone: 'blue' },
      { label: 'Completed payments', value: String(paidPayments.length), note: 'Paid transactions', tone: 'dark' },
    ];
  }, [paidPayments, pendingPayments]);

  const earningsChart = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const total = paidPayments.reduce((sum, payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getFullYear() === monthDate.getFullYear()
          && paymentDate.getMonth() === monthDate.getMonth()
          ? sum + payment.amountValue
          : sum;
      }, 0);
      return {
        label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        value: total,
      };
    });
  }, [paidPayments]);

  const earningsBreakdown = useMemo(() => {
    const totals = new Map();
    paidPayments.forEach((payment) => {
      totals.set(payment.animal, (totals.get(payment.animal) || 0) + payment.amountValue);
    });
    return Array.from(totals, ([label, value]) => ({ label, value }));
  }, [paidPayments]);

  const confirmPayment = async (paymentId) => {
    const currentPayment = payments.find((payment) => payment.paymentId === paymentId);
    if (!currentPayment || isConfirming) return;

    setIsConfirming(true);
    setConfirmationError('');
    try {
      const response = await api.butcherConfirmPayment(paymentId);
      const refreshedPayments = await loadPayments();
      if (refreshedPayments) {
        setSelectedPayment(refreshedPayments.find((payment) => payment.paymentId === paymentId) || null);
      } else {
        const updatedPayment = {
          ...currentPayment,
          status: response.payment.status,
          receiverConfirmedAt: response.payment.receiver_confirmed_at,
          bookingStatus: response.booking.status,
          bookingPaymentStatus: response.booking.payment_status,
        };
        setPayments((current) => current.map((payment) => payment.paymentId === paymentId ? updatedPayment : payment));
        setSelectedPayment(updatedPayment);
      }
    } catch (error) {
      setConfirmationError(error.message || 'Unable to confirm this cash payment.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="butcher-dashboard earnings-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar earnings-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Earnings</h1><p>Track your earnings, payments, and completed Qurbani services.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header>
        <div className="earnings-toolbar"><div><p className="eyebrow">Financial overview</p><h2>Your earnings</h2></div><Link to="/dashboard/butcher" className="earnings-dashboard-link">← Dashboard</Link></div>
        <EarningsOverview stats={earningsOverview} />
        <div className="earnings-main-grid"><EarningsChart data={earningsChart} /><section className="butcher-panel payout-panel"><div className="panel-heading"><div><p className="eyebrow">Withdrawals</p><h2>Payout balance</h2></div></div><div className="payout-balance"><span>Available balance</span><strong>Not available</strong></div><div className="payout-pending"><span>Pending balance</span><strong>Not available</strong></div><button type="button" className="payout-button" disabled>Request Payout</button><p className="payout-note">Payout balances are not provided by the payment API.</p></section></div>
        <div className="earnings-lower-grid"><EarningsBreakdown items={earningsBreakdown} /><section className="butcher-panel payment-filters-panel"><div className="panel-heading"><div><p className="eyebrow">Find a transaction</p><h2>Payment filters</h2></div></div><div className="earnings-filter-tabs" role="tablist">{paymentFilters.map((filter) => <button key={filter} type="button" role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} onClick={() => setActiveFilter(filter)}>{filter === 'All' ? filter : filter[0].toUpperCase() + filter.slice(1)}</button>)}</div><label className="earnings-search"><span aria-hidden="true">⌕</span><span className="sr-only">Search payments</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or booking" /></label><p className="payment-filter-count">Showing {visiblePayments.length} of {payments.length} payments</p></section></div>
        <PaymentHistory payments={visiblePayments} isLoading={isLoading} error={loadError} onRetry={loadPayments} onView={(payment) => { setSelectedPayment(payment); setConfirmationError(''); }} />
      </main>
      <PaymentDetails payment={selectedPayment} onClose={() => { setSelectedPayment(null); setConfirmationError(''); }} onConfirm={confirmPayment} isConfirming={isConfirming} error={confirmationError} />
    </div>
  );
}

export default Earnings;
