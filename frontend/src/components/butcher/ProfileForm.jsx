import { useState } from 'react';

const specializations = ['Cow Qurbani', 'Goat Qurbani', 'Sheep Qurbani', 'Shared Qurbani'];

function ProfileForm({ profile, onChange, onSave, onReset }) {
  const [newArea, setNewArea] = useState('');
  const [isAddingArea, setIsAddingArea] = useState(false);
  const update = (field, value) => onChange({ ...profile, [field]: value });
  const removeArea = (area) => update('serviceAreas', profile.serviceAreas.filter((item) => item !== area));
  const addArea = () => {
    const area = newArea.trim();
    if (!area || profile.serviceAreas.includes(area)) return;
    update('serviceAreas', [...profile.serviceAreas, area]);
    setNewArea('');
    setIsAddingArea(false);
  };

  return (
    <form className="profile-form" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <section className="butcher-panel profile-section">
        <div className="panel-heading"><div><p className="eyebrow">Contact details</p><h2>Personal information</h2></div></div>
        <div className="profile-fields">
          <label>Full name<input required value={profile.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label>Phone number<input required value={profile.phone} onChange={(event) => update('phone', event.target.value)} /></label>
          <label>Address<input value={profile.address} onChange={(event) => update('address', event.target.value)} /></label>
          <label>City<input value={profile.city} onChange={(event) => update('city', event.target.value)} /></label>
          <label>Area<input value={profile.area} onChange={(event) => update('area', event.target.value)} /></label>
        </div>
      </section>
      <section className="butcher-panel profile-section">
        <div className="panel-heading"><div><p className="eyebrow">Professional details</p><h2>Professional information</h2></div></div>
        <div className="profile-fields">
          <label>Years of experience<input required min="0" type="number" value={profile.experience} onChange={(event) => update('experience', event.target.value)} /></label>
          <label>Specialization<select value={profile.specialization} onChange={(event) => update('specialization', event.target.value)}>{specializations.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="profile-wide">Short professional bio<textarea rows="4" value={profile.bio} onChange={(event) => update('bio', event.target.value)} /></label>
          <div className="profile-wide service-area-field">
            <span>Service areas</span>
            <div className="service-area-list">
              {profile.serviceAreas.map((area) => <span key={area}>{area}<button type="button" onClick={() => removeArea(area)} aria-label={`Remove ${area}`}>×</button></span>)}
              {isAddingArea ? <span className="add-area-form"><input autoFocus value={newArea} onChange={(event) => setNewArea(event.target.value)} placeholder="Area name" /><button type="button" onClick={addArea}>Add</button><button type="button" onClick={() => { setNewArea(''); setIsAddingArea(false); }}>Cancel</button></span> : <button type="button" className="add-area" onClick={() => setIsAddingArea(true)}>+ Add area</button>}
            </div>
          </div>
        </div>
      </section>
      <div className="profile-form-actions"><button type="button" className="profile-reset" onClick={onReset}>Reset changes</button><button type="submit" className="profile-save">Save Changes</button></div>
    </form>
  );
}

export default ProfileForm;
