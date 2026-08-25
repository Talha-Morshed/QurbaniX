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

  const handleNavClick = (event, href) => {
    event.preventDefault();

    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);

    if (!target) return;

    const header = document.querySelector('.header');
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const isSticky = headerStyle && (headerStyle.position === 'sticky' || headerStyle.position === 'fixed');
    const headerHeight = isSticky && header ? header.getBoundingClientRect().height : 0;
    const targetPosition =
      targetId === 'home'
        ? 0
        : window.scrollY + target.getBoundingClientRect().top - headerHeight;

    window.scrollTo({
      top: Math.max(targetPosition, 0),
      behavior: 'smooth',
    });
  };

  return (
    <header className="header">
      <a className="header__brand" href="#home" aria-label="Go to home section" onClick={(event) => handleNavClick(event, '#home')}>
        <img src={images.logo} alt="QurbaniX Logo" className="header__logo" />
      </a>

      <nav className="header__nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => handleNavClick(event, item.href)}
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
