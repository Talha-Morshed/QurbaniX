import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Hero from '../../components/landing/Hero';
import './styles.css';

function LandingPage() {
  return (
    <div className="landing" id="home">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}

export default LandingPage;
