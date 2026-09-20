function ServiceList({ services, onEdit, onRemove, onToggle }) {
  return (
    <section className="butcher-panel service-list-panel">
      <div className="panel-heading"><div><p className="eyebrow">Your catalog</p><h2>My services <span className="service-count">{services.length}</span></h2></div><span className="service-list-note">Prices shown in BDT</span></div>
      <div className="service-list">{services.map((service) => <article className="service-row" key={service.id}>
        <div className="service-animal-mark">{service.animal === 'Shared Cow' ? 'SC' : service.animal.slice(0, 2).toUpperCase()}</div>
        <div className="service-copy"><h3>{service.name}</h3><p>{service.description}</p><span>Animal: {service.animal} <i /> Estimated duration: {service.duration}</span></div>
        <div className="service-price"><strong>৳{Number(service.price).toLocaleString()}</strong><span>+ {service.additional}</span></div>
        <div className="service-availability"><span className={`service-status ${service.available ? 'is-available' : 'is-unavailable'}`}><i />{service.available ? 'Available' : 'Unavailable'}</span><button type="button" onClick={() => onToggle(service.id)}>{service.available ? 'Pause' : 'Enable'}</button></div>
        <div className="service-actions"><button type="button" onClick={() => onEdit(service)}>Edit</button><button type="button" className="service-remove" onClick={() => onRemove(service)}>Remove</button></div>
      </article>)}</div>
    </section>
  );
}

export default ServiceList;