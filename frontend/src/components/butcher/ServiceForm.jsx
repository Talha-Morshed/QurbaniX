import { emptyService } from './servicesData';

function ServiceForm({ service, onChange, onSave, onCancel }) {
  const isEditing = Boolean(service.id);
  const update = (field, value) => onChange({ ...service, [field]: value });

  return (
    <div className="service-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <form className="service-form" onSubmit={(event) => { event.preventDefault(); onSave(service); }}>
        <div className="service-form-header"><div><p className="eyebrow">Service catalog</p><h2>{isEditing ? 'Edit service' : 'Add service'}</h2></div><button type="button" className="service-close" onClick={onCancel} aria-label="Close service form">×</button></div>
        <div className="service-form-grid">
          <label>Service name<input required value={service.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Cow Qurbani" /></label>
          <label>Animal type<select value={service.animal} onChange={(event) => update('animal', event.target.value)}>{['Cow', 'Goat', 'Sheep', 'Camel', 'Shared Cow'].map((animal) => <option key={animal}>{animal}</option>)}</select></label>
          <label className="service-form-wide">Description<textarea required rows="3" value={service.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe what the customer receives" /></label>
          <label>Service price<input required min="0" type="number" value={service.price} onChange={(event) => update('price', event.target.value)} placeholder="8500" /></label>
          <label>Estimated duration<select value={service.duration} onChange={(event) => update('duration', event.target.value)}><option>1–2 hours</option><option>2–3 hours</option><option>3–4 hours</option><option>4+ hours</option></select></label>
          <label className="service-form-wide">Additional charge<input value={service.additional} onChange={(event) => update('additional', event.target.value)} placeholder="৳500 delivery estimate" /></label>
        </div>
        <label className="service-availability"><input type="checkbox" checked={service.available} onChange={(event) => update('available', event.target.checked)} /><span>Available for new customer bookings</span></label>
        <div className="service-form-actions"><button type="button" className="service-cancel" onClick={onCancel}>Cancel</button><button type="submit" className="service-primary">{isEditing ? 'Save Changes' : 'Save Service'}</button></div>
      </form>
    </div>
  );
}

export { emptyService };
export default ServiceForm;