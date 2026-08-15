import './Header.css';
import images from '../assets/images';

function Header() {
  return (
    <header className="header">
      <a className="header__brand" href="#home">
        <img src={images.logo} alt="QurbaniX Logo" className="header__logo" />
      </a>
      <nav className="header__nav">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#how-it-works">How it works</a>
      </nav>
    </header>
  );
}

export default Header;
