import './Header.css';

function Header() {
  return (
    <header className="header">
      <a className="header__brand" href="#home">
        QurbaniX
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
