function ServiceList({ services, onEdit, onRemove, onToggle, isLoading, hasError, busyServiceIds }) {
  return (
    <section className="butcher-panel service-list-panel">
      <div className="panel-heading"><div><p className="eyebrow">Your catalog</p><h2>My services <span className="service-count">{services.length}</span></h2></div><span className="service-list-note">Prices shown in BDT</span></div>
      <div className="service-list">{isLoading ? <p className="services-empty" role="status">Loading your services…</p> : services.length === 0 ? hasError ? null : <p className="services-empty">You have not added any services yet.</p> : services.map((service) => <article className="service-row" key={service.id}>
        <div className="service-animal-mark">{service.animal === 'Shared Cow' ? 'SC' : service.animal.slice(0, 2).toUpperCase()}</div>
        <div className="service-copy"><h3>{service.name}</h3><p>{service.description}</p><span>Animal: {service.animal} <i /> Estimated duration: {service.duration || 'Not specified'}</span></div>
        <div className="service-price"><strong>৳{Number(service.price).toLocaleString()}</strong><span>{service.additional ? `+ ${service.additional}` : 'Additional charge not specified'}</span></div>
        <div className="service-availability"><span className={`service-status ${service.available ? 'is-available' : 'is-unavailable'}`}><i />{service.available ? 'Available' : 'Unavailable'}</span><button type="button" disabled={busyServiceIds.has(service.id)} onClick={() => onToggle(service.id)}>{service.available ? 'Pause' : 'Enable'}</button></div>
        <div className="service-actions"><button type="button" disabled={busyServiceIds.has(service.id)} onClick={() => onEdit(service)}>Edit</button><button type="button" className="service-remove" disabled={busyServiceIds.has(service.id)} onClick={() => onRemove(service)}>Remove</button></div>
      </article>)}</div>
    </section>
  );
}

export default ServiceList;