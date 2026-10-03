import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import ServiceForm, { emptyService } from '../../components/butcher/ServiceForm';
import ServiceList from '../../components/butcher/ServiceList';
import { serviceFromApi, serviceToApi } from '../../components/butcher/servicesData';
import '../dashboard/ButcherDashboard.css';
import './ServicesPricing.css';

function errorMessage(error) {
  const validationMessage = Object.values(error?.errors || {}).flat()[0];
  return validationMessage || error?.message || 'Something went wrong. Please try again.';
}

function ServicesPricing() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formService, setFormService] = useState(null);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [busyServiceIds, setBusyServiceIds] = useState(() => new Set());
  const [removeTarget, setRemoveTarget] = useState(null);
  const name = user?.name || '';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  async function loadServices() {
    setIsLoading(true);
    setPageError('');
    try {
      const response = await api.butcherServices();
      setServices(response.services.map(serviceFromApi));
    } catch (error) {
      setPageError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function saveService(service) {
    setIsSaving(true);
    setFormError('');
    try {
      const payload = serviceToApi(service);
      if (service.id) {
        await api.updateButcherService(service.id, payload);
      } else {
        await api.createButcherService(payload);
      }
      setFormService(null);
      await loadServices();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleAvailability(id) {
    const service = services.find((item) => item.id === id);
    if (!service) return;

    setPageError('');
    setBusyServiceIds((current) => new Set(current).add(id));
    try {
      await api.updateButcherService(id, { is_available: !service.available });
      await loadServices();
    } catch (error) {
      setPageError(errorMessage(error));
    } finally {
      setBusyServiceIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  async function removeService() {
    if (!removeTarget) return;

    setPageError('');
    setIsDeleting(true);
    try {
      await api.deleteButcherService(removeTarget.id);
      setRemoveTarget(null);
      await loadServices();
    } catch (error) {
      setPageError(errorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="butcher-dashboard services-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar services-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Services &amp; Pricing</h1><p>Manage the services you offer and set transparent pricing for your customers.</p></div><div className="butcher-user"><span className="butcher-avatar">{initials}</span><div className="butcher-user-copy"><strong>{name || 'Butcher account'}</strong><span>Butcher</span></div></div></header>
        <div className="services-toolbar"><div><p className="eyebrow">Service management</p><h2>Offerings and pricing</h2></div><div className="services-toolbar-actions"><Link to="/dashboard/butcher" className="services-dashboard-link">← Dashboard</Link><button type="button" className="services-add" onClick={() => { setFormError(''); setFormService({ ...emptyService }); }}>+ Add Service</button></div></div>
        <div className="pricing-note"><div className="pricing-note-mark">৳</div><div><strong>Keep pricing clear and current</strong><p>Customers see your service price before requesting a booking. Additional charges are shown as an estimate.</p></div></div>
        {pageError && <div className="services-error" role="alert">{pageError} <button type="button" onClick={loadServices}>Retry</button></div>}
        <ServiceList services={services} isLoading={isLoading} hasError={Boolean(pageError)} busyServiceIds={busyServiceIds} onEdit={(service) => { setFormError(''); setFormService({ ...service }); }} onRemove={setRemoveTarget} onToggle={toggleAvailability} />
      </main>
      {formService && <ServiceForm service={formService} onChange={setFormService} onSave={saveService} onCancel={() => setFormService(null)} isSaving={isSaving} error={formError} />}
      {removeTarget && <div className="remove-modal-backdrop" role="presentation"><div className="remove-modal" role="alertdialog" aria-modal="true"><p className="eyebrow">Remove service</p><h2>Remove this service?</h2><p><strong>{removeTarget.name}</strong> will no longer appear in your customer catalog.</p>{pageError && <p className="service-form-error" role="alert">{pageError}</p>}<div><button type="button" className="service-cancel" onClick={() => { setRemoveTarget(null); setPageError(''); }} disabled={isDeleting}>Cancel</button><button type="button" className="service-remove-confirm" onClick={removeService} disabled={isDeleting}>{isDeleting ? 'Removing…' : 'Remove'}</button></div></div></div>}
    </div>
  );
}

export default ServicesPricing;