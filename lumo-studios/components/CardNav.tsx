
import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { GoArrowUpRight } from 'react-icons/go';
import './CardNav.css';

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent) => void;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: React.ReactNode;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  onEnterCore: () => void;
  toggleTheme: () => void;
  themeLabel: string;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  items,
  className = '',
  ease = 'power3.out',
  baseColor = 'var(--bg)',
  menuColor,
  buttonBgColor,
  buttonTextColor,
  onEnterCore,
  toggleTheme,
  themeLabel
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 60;

    const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
    
    if (contentEl) {
      const topBar = 60;
      const padding = 24;
      // Temporarily ensure content is measurable
      const prevVisibility = contentEl.style.visibility;
      const prevPosition = contentEl.style.position;
      
      contentEl.style.visibility = 'hidden';
      contentEl.style.position = 'absolute';
      contentEl.style.display = 'grid'; // matches CSS
      
      const contentHeight = contentEl.scrollHeight;
      
      contentEl.style.visibility = prevVisibility;
      contentEl.style.position = prevPosition;
      
      return topBar + contentHeight + padding;
    }
    
    return 60;
  };

  const createTimeline = (startingExpanded: boolean) => {
    const navEl = navRef.current;
    if (!navEl) return null;

    const targetHeight = calculateHeight();
    
    // Crucial: Set initial state based on current expansion
    if (startingExpanded) {
      gsap.set(navEl, { height: targetHeight });
      gsap.set(cardsRef.current, { y: 0, opacity: 1 });
    } else {
      gsap.set(navEl, { height: 60 });
      gsap.set(cardsRef.current, { y: 30, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: targetHeight,
      duration: 0.5,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.2');

    // If we were already expanded, seek to end
    if (startingExpanded) {
      tl.progress(1);
    }

    return tl;
  };

  // Re-run whenever items change, but preserve current expansion state
  useLayoutEffect(() => {
    const tl = createTimeline(isExpanded);
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [items, ease]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline(true);
        if (newTl) {
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline(false);
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => {
        setIsExpanded(false);
      });
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || 'var(--text-main)' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            {logo}
          </div>

          <div className="card-nav-top-right">
            <button className="theme-toggle" onClick={toggleTheme} style={{ padding: '6px 12px' }}>
                {themeLabel}
            </button>
            <button
                type="button"
                className="card-nav-cta-button"
                style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                onClick={onEnterCore}
            >
                Sign Up
            </button>
          </div>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <a 
                    key={`${lnk.label}-${i}`} 
                    className="nav-card-link" 
                    href={lnk.href} 
                    aria-label={lnk.ariaLabel}
                    onClick={lnk.onClick}
                  >
                    <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
