import './styles.css';

function LandingPage() {
  return (
    <div className="landing">
      <main className="landing__hero">
        <div className="landing__content">
          <span className="landing__badge">Verified butcher</span>
          <h1 className="landing__title">Book fast.</h1>
          <p className="landing__text">
            One tap to a trusted Qurbani service.
          </p>
          <button className="landing__button" type="button">
            Start
          </button>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
