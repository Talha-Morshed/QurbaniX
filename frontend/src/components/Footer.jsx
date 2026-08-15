import { Link } from 'react-router-dom';
import './Footer.css';
import images from '../assets/images';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <img src={images.logo} alt="QurbaniX Logo" className="footer__logo" />
          <div className="footer__brand-text">
            <span className="footer__name">QurbaniX</span>
            <span className="footer__tagline">Trusted Qurbani services, delivered with care.</span>
          </div>
        </div>

        <div className="footer__links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>

      <div className="footer__copyright">© {new Date().getFullYear()} QurbaniX. All rights reserved.</div>
    </footer>
  );
}

export default Footer;
