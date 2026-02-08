
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import CardNav, { CardNavItem } from './CardNav';
import Lanyard from './Lanyard';

interface LandingPageProps {
  isVisible: boolean;
  onEnterCore: () => void;
  onSurpriseMe: () => void;
  isLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

type SubView = 'home' | 'pricing';

const LandingPage: React.FC<LandingPageProps> = ({ 
  isVisible, 
  onEnterCore, 
  onSurpriseMe, 
  isLoading,
  theme,
  toggleTheme
}) => {
  const [activeSubView, setActiveSubView] = useState<SubView>('home');

  const navItems: CardNavItem[] = [
    {
      label: 'PLATFORM',
      bgColor: 'var(--primary)',
      textColor: '#fff',
      links: [
        { label: 'HOME', href: '#', ariaLabel: 'Go to Home', onClick: (e) => { e.preventDefault(); setActiveSubView('home'); } },
        { label: 'PRICING', href: '#', ariaLabel: 'Go to Pricing', onClick: (e) => { e.preventDefault(); setActiveSubView('pricing'); } },
      ]
    },
    {
      label: 'STUDIO',
      bgColor: 'var(--text-main)',
      textColor: 'var(--bg)',
      links: [
        { label: 'INITIALIZE', href: '#', ariaLabel: 'Sign up for Lumo', onClick: (e) => { e.preventDefault(); onEnterCore(); } },
        { label: 'SURPRISE ME', href: '#', ariaLabel: 'Try Lumo randomly', onClick: (e) => { e.preventDefault(); onSurpriseMe(); } },
      ]
    },
    {
      label: 'COMMUNITY',
      bgColor: 'var(--glass)',
      textColor: 'var(--text-main)',
      links: [
        { label: 'DISCORD', href: '#', ariaLabel: 'Join Discord' },
        { label: 'X / TWITTER', href: '#', ariaLabel: 'Follow on X' },
      ]
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="landing-page">
      <div className="grid-master"></div>
      <div className="float-blob"></div>

      <CardNav 
        logo={
          <div className="logo" onClick={() => setActiveSubView('home')}>
            <div className="logo-box"></div>
            LUMO
          </div>
        }
        items={navItems}
        onEnterCore={onEnterCore}
        toggleTheme={toggleTheme}
        themeLabel={theme.toUpperCase()}
      />

      {activeSubView === 'home' && (
        <>
          <section className="hero">
            <div className="hero-background-viz">
              <Lanyard />
            </div>
            <span className="hero-tag">// EMPOWERING CREATIVITY</span>
            <h1><span>LUMO</span><span className="filled">STUDIOS</span></h1>
            <div className="hero-flex">
              <p className="hero-desc">
                LUMO STUDIOS IS A DESIGN SOFTWARE TO EMPOWER CREATIVES THROUGH AI. 
                TRANSFORM LOGIC INTO MATERIAL REALITY WITH THE POWER OF NEURAL ASSISTANCE.
              </p>
              <div className="hero-actions-prism">
                <button className="cta-btn-prism" onClick={onEnterCore}>INITIALIZE_SEQUENCE</button>
                <button className="secondary-cta-prism" onClick={onSurpriseMe}>
                  <SparklesIcon /> SURPRISE_ME
                </button>
              </div>
            </div>
          </section>

          <section className="grid-section">
            <div className="feature-card-prism">
                <span className="card-num">01 // SPATIAL</span>
                <h3 className="card-title">CANVAS_SYNC</h3>
                <p>Infinite architecture zone for component mapping and visual layout.</p>
            </div>
            <div className="feature-card-prism cyan">
                <span className="card-num">02 // NEURAL</span>
                <h3 className="card-title">BRAINBOARD</h3>
                <p>Synthesize full brand identities from single-line conceptual inputs.</p>
            </div>
            <div className="feature-card-prism yellow">
                <span className="card-num">03 // MATERIAL</span>
                <h3 className="card-title">GLASS_V3</h3>
                <p>Proprietary blurs and light-reactive layers for modern UI.</p>
            </div>
            <div className="active-cta-card feature-card-prism" onClick={onEnterCore}>
                <span className="card-num">04 // ACTIVE</span>
                <h3 className="card-title">START_DESIGNING</h3>
                <p>Enter the workshop and initialize your first sequence.</p>
                <div className="cta-line"></div>
            </div>
          </section>
        </>
      )}

      {activeSubView === 'pricing' && (
        <section className="grid-section">
          <div className="feature-card-prism">
            <span className="card-num">01 // BASIC</span>
            <h3 className="card-title">FREEMIUM</h3>
            <p>$0 // MONTHLY</p>
            <ul className="pd-list-prism">
              <li>5 Creative Sequences / Day</li>
              <li>Basic Interface Strata</li>
              <li>Standard Community Hub</li>
            </ul>
            <button className="secondary-cta-prism" style={{marginTop:'20px'}} onClick={onEnterCore}>START_FREE</button>
          </div>
          <div className="feature-card-prism active-cta-card">
            <span className="card-num">02 // ADVANCED</span>
            <h3 className="card-title">PRO_TIER</h3>
            <p>$19 // MONTHLY</p>
            <ul className="pd-list-prism">
              <li>Unlimited Creative Syncing</li>
              <li>Full Visual Lab Access</li>
              <li>Priority AI Compute</li>
              <li>Advanced Export Strata</li>
            </ul>
            <button className="cta-btn-prism" style={{marginTop:'20px', background:'white', color:'var(--primary)'}} onClick={onEnterCore}>GO_PRO</button>
          </div>
          <div className="feature-card-prism yellow">
            <span className="card-num">03 // ENTERPRISE</span>
            <h3 className="card-title">BUSINESS</h3>
            <p>$49 // MONTHLY</p>
            <ul className="pd-list-prism">
              <li>Team Collaboration Grid</li>
              <li>Custom Archetype Logic</li>
              <li>Full AI API Handshake</li>
              <li>Dedicated Neural Cluster</li>
            </ul>
            <button className="secondary-cta-prism" style={{marginTop:'20px'}} onClick={onEnterCore}>CONTACT_OPS</button>
          </div>
        </section>
      )}

      <footer className="landing-footer-prism">
        <div className="footer-brand">
          <h2>LUMO</h2>
          <p>LUMO STUDIOS: Design software to empower creatives through AI. All rights reserved // 2024</p>
          <div className="registration-marks">
            <div className="reg-dot" style={{ background: 'var(--primary)' }}></div>
            <div className="reg-dot" style={{ background: 'var(--secondary)' }}></div>
            <div className="reg-dot" style={{ background: 'var(--tertiary)' }}></div>
          </div>
        </div>
        <div className="footer-col">
          <span className="footer-label">PLATFORM</span>
          <ul><li>V1_Architecture</li><li>Creative_Logic</li><li>Kinetic_Flow</li></ul>
        </div>
        <div className="footer-col">
          <span className="footer-label">GRID</span>
          <ul><li>Community_Sync</li><li>Dashboard_V3</li><li>Neural_API</li></ul>
        </div>
        <div className="footer-col">
          <span className="footer-label">COMPANY</span>
          <ul><li>Architect_News</li><li>Ops_Manual</li><li>Grid_Status</li></ul>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
