import { useEffect, useState } from 'react';
import './Header.css';
import images from '../assets/images';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Reviews', href: '#ratings' },
];

function Header() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const id = visibleEntry.target.getAttribute('id');
          setActiveSection(id || 'home');
        }
      },
      {
        root: null,
        threshold: [0.2, 0.4, 0.6, 0.8],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <header className="header">
      <a className="header__brand" href="#home" aria-label="Go to home section">
        <img src={images.logo} alt="QurbaniX Logo" className="header__logo" />
      </a>

      <nav className="header__nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`header__nav-link ${activeSection === item.href.replace('#', '') ? 'is-active' : ''}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Header;
