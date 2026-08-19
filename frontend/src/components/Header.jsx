import './Header.css';
import images from '../assets/images';

function Header() {
  return (
    <header className="header">
      <a className="header__brand" href="#home">
        <img src={images.logo} alt="QurbaniX Logo" className="header__logo" />
      </a>
    </header>
  );
}

export default Header;
