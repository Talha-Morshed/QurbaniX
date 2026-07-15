import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './styles.css';

function LandingPage() {
  return (
    <div className="landing" id="home">
      <Header />
      <main className="landing__hero">
        <div className="landing__content">
          <span className="landing__badge">Verified Butchers</span>
          <h1 className="landing__title">QurbaniX</h1>
          <p className="landing__text">
            One tap away from a trusted Qurbani service.
          </p>
          <button className="landing__button" type="button">
            Get Started
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
