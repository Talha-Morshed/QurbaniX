import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import EarningsBreakdown from '../../components/butcher/EarningsBreakdown';
import EarningsChart from '../../components/butcher/EarningsChart';
import EarningsOverview from '../../components/butcher/EarningsOverview';
import PaymentDetails from '../../components/butcher/PaymentDetails';
import PaymentHistory from '../../components/butcher/PaymentHistory';
import { earningsBreakdown, earningsChart, earningsOverview, paymentHistory } from '../../components/butcher/earningsData';
import '../dashboard/ButcherDashboard.css';
import './Earnings.css';

const paymentFilters = ['All', 'Paid', 'Pending', 'Refunded'];

function Earnings() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const visiblePayments = useMemo(() => paymentHistory.filter((payment) => {
    const matchesFilter = activeFilter === 'All' || payment.status === activeFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${payment.transactionId} ${payment.bookingId} ${payment.customer}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  }), [activeFilter, search]);

  return (
    <div className="butcher-dashboard earnings-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar earnings-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Earnings</h1><p>Track your earnings, payments, and completed Qurbani services.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header>
        <div className="earnings-toolbar"><div><p className="eyebrow">Financial overview</p><h2>Your earnings</h2></div><Link to="/dashboard/butcher" className="earnings-dashboard-link">← Dashboard</Link></div>
        <EarningsOverview stats={earningsOverview} />
        <div className="earnings-main-grid"><EarningsChart data={earningsChart} /><section className="butcher-panel payout-panel"><div className="panel-heading"><div><p className="eyebrow">Withdrawals</p><h2>Payout balance</h2></div></div><div className="payout-balance"><span>Available balance</span><strong>৳24,000</strong></div><div className="payout-pending"><span>Pending balance</span><strong>৳8,500</strong></div><button type="button" className="payout-button">Request Payout</button><p className="payout-note">Payout requests are UI-only for now.</p></section></div>
        <div className="earnings-lower-grid"><EarningsBreakdown items={earningsBreakdown} /><section className="butcher-panel payment-filters-panel"><div className="panel-heading"><div><p className="eyebrow">Find a transaction</p><h2>Payment filters</h2></div></div><div className="earnings-filter-tabs" role="tablist">{paymentFilters.map((filter) => <button key={filter} type="button" role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><label className="earnings-search"><span aria-hidden="true">⌕</span><span className="sr-only">Search payments</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or booking" /></label><p className="payment-filter-count">Showing {visiblePayments.length} of {paymentHistory.length} payments</p></section></div>
        <PaymentHistory payments={visiblePayments} onView={setSelectedPayment} />
      </main>
      <PaymentDetails payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
    </div>
  );
}

export default Earnings;