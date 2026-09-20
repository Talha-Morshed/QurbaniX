import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import ServiceForm, { emptyService } from '../../components/butcher/ServiceForm';
import ServiceList from '../../components/butcher/ServiceList';
import { initialServices } from '../../components/butcher/servicesData';
import '../dashboard/ButcherDashboard.css';
import './ServicesPricing.css';

function ServicesPricing() {
  const [services, setServices] = useState(initialServices);
  const [formService, setFormService] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  const saveService = (service) => {
    setServices((current) => service.id ? current.map((item) => item.id === service.id ? service : item) : [...current, { ...service, id: Date.now() }]);
    setFormService(null);
  };
  const toggleAvailability = (id) => setServices((current) => current.map((service) => service.id === id ? { ...service, available: !service.available } : service));

  return (
    <div className="butcher-dashboard services-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar services-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Services &amp; Pricing</h1><p>Manage the services you offer and set transparent pricing for your customers.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header>
        <div className="services-toolbar"><div><p className="eyebrow">Service management</p><h2>Offerings and pricing</h2></div><div className="services-toolbar-actions"><Link to="/dashboard/butcher" className="services-dashboard-link">← Dashboard</Link><button type="button" className="services-add" onClick={() => setFormService({ ...emptyService })}>+ Add Service</button></div></div>
        <div className="pricing-note"><div className="pricing-note-mark">৳</div><div><strong>Keep pricing clear and current</strong><p>Customers see your service price before requesting a booking. Additional charges are shown as an estimate.</p></div></div>
        <ServiceList services={services} onEdit={setFormService} onRemove={setRemoveTarget} onToggle={toggleAvailability} />
      </main>
      {formService && <ServiceForm service={formService} onChange={setFormService} onSave={saveService} onCancel={() => setFormService(null)} />}
      {removeTarget && <div className="remove-modal-backdrop" role="presentation"><div className="remove-modal" role="alertdialog" aria-modal="true"><p className="eyebrow">Remove service</p><h2>Remove this service?</h2><p><strong>{removeTarget.name}</strong> will no longer appear in your customer catalog.</p><div><button type="button" className="service-cancel" onClick={() => setRemoveTarget(null)}>Cancel</button><button type="button" className="service-remove-confirm" onClick={() => { setServices((current) => current.filter((service) => service.id !== removeTarget.id)); setRemoveTarget(null); }}>Remove</button></div></div></div>}
    </div>
  );
}

export default ServicesPricing;