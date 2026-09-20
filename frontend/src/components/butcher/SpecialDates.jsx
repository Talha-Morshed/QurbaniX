function SpecialDates({ dates }) {
  return (
    <section className="butcher-panel special-dates">
      <div className="panel-heading"><div><p className="eyebrow">Exceptions to your schedule</p><h2>Special dates</h2></div><button type="button" className="text-action">+ Add date</button></div>
      <div className="special-date-list">{dates.map((entry) => <div className="special-date-row" key={entry.id}><div className="special-date-mark">{entry.date.split(' ')[0].slice(0, 3)}</div><div><strong>{entry.date}</strong><p>{entry.name}</p></div><div className="special-date-hours"><strong>{entry.hours}</strong><span>{entry.type}</span></div><button type="button" className="row-action" aria-label={`Edit ${entry.name}`}>•••</button></div>)}</div>
    </section>
  );
}

export default SpecialDates;