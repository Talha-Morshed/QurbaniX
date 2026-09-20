function WeeklySchedule({ schedule, onChange }) {
  const updateDay = (index, field, value) => onChange(schedule.map((item, itemIndex) => {
    if (itemIndex !== index) return item;
    if (field === 'end' && value <= item.start) return item;
    if (field === 'start' && value >= item.end) return { ...item, start: value, end: value };
    return { ...item, [field]: value };
  }));

  return (
    <section className="butcher-panel weekly-schedule">
      <div className="panel-heading"><div><p className="eyebrow">Recurring schedule</p><h2>Weekly availability</h2></div><span className="schedule-note">Times are in local time</span></div>
      <div className="schedule-list">{schedule.map((item, index) => <div className={`schedule-row ${item.enabled ? '' : 'is-disabled'}`} key={item.day}>
        <div className="schedule-day"><strong>{item.day}</strong><span>{item.enabled ? 'Available' : 'Unavailable'}</span></div>
        <label className="schedule-switch"><input type="checkbox" checked={item.enabled} onChange={(event) => updateDay(index, 'enabled', event.target.checked)} /><span /></label>
        {item.enabled ? <div className="schedule-times"><label><span>From</span><input type="time" value={item.start} onChange={(event) => updateDay(index, 'start', event.target.value)} /></label><span className="schedule-dash">—</span><label><span>Until</span><input type="time" value={item.end} min={item.start} onChange={(event) => updateDay(index, 'end', event.target.value)} /></label></div> : <p className="schedule-closed">Not accepting bookings</p>}
      </div>)}</div>
    </section>
  );
}

export default WeeklySchedule;