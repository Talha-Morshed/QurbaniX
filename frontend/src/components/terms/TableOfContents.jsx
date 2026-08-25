import { useEffect, useRef } from 'react';

function TableOfContents({ sections, activeSection, onSelect }) {
  const navigationRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const navigation = navigationRef.current;
    const activeItem = itemRefs.current[activeSection];
    if (!navigation || !activeItem) return;

    const navigationBounds = navigation.getBoundingClientRect();
    const itemBounds = activeItem.getBoundingClientRect();
    if (itemBounds.top < navigationBounds.top) {
      navigation.scrollBy({ top: itemBounds.top - navigationBounds.top, behavior: 'smooth' });
    } else if (itemBounds.bottom > navigationBounds.bottom) {
      navigation.scrollBy({ top: itemBounds.bottom - navigationBounds.bottom, behavior: 'smooth' });
    }
  }, [activeSection]);

  return (
    <nav className="lg:flex lg:h-full lg:min-h-0 lg:flex-col" aria-label="Terms sections">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">Contents</p>
      <ul ref={navigationRef} className="mt-4 grid gap-x-4 gap-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:overflow-y-auto">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                onSelect(section.id);
              }}
              ref={(element) => {
                if (element) itemRefs.current[section.id] = element;
                else delete itemRefs.current[section.id];
              }}
              className={`flex items-baseline gap-3 border-l-2 px-3 py-2 transition ${activeSection === section.id ? 'border-[#d4a72c] bg-white/10 font-semibold text-white' : 'border-white/15 text-white/60 hover:border-white/60 hover:bg-white/5 hover:text-white'}`}
              aria-current={activeSection === section.id ? 'location' : undefined}
            >
              <span className="text-[10px] font-bold tracking-widest text-[#d4a72c]">{section.number}</span>
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
