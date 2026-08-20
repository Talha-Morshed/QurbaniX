import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Hero from '../../components/landing/Hero';
import AboutSection from '../../components/landing/AboutSection';
import RatingsButchers from '../../components/landing/RatingsButchers';
import './styles.css';

function LandingPage() {
  return (
    <div className="landing" id="home">
      <Header />
      <Hero />
      <AboutSection />
      <RatingsButchers />
      <Footer />
    </div>
  );
}

export default LandingPage;
