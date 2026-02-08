
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ProfileCard from './ProfileCard';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon, ThinkingIcon, CodeIcon } from './Icons';
import './Onboarding.css';

interface OnboardingProps {
  onComplete: (profile: any) => void;
}

type OnboardingStep = 'customize' | 'review' | 'welcome';

const LUMO_ARCHETYPES = [
  { id: 1, name: 'The Explorer', description: 'Cosmic curiosity and tech shades.' },
  { id: 2, name: 'The Nomad', description: 'Ready for grid-hopping with the neural pack.' },
  { id: 3, name: 'The Astronomer', description: 'Mapping the stars within the interface.' },
  { id: 4, name: 'The Skeptic', description: 'Analytical gaze and structural doubt.' },
  { id: 5, name: 'The Bolt', description: 'High-energy logic and kinetic focus.' },
  { id: 6, name: 'The Scout', description: 'Always ahead of the next release cycle.' },
  { id: 7, name: 'The Architect', description: 'Seasoned depth and formal precision.' },
  { id: 8, name: 'The Specialist', description: 'Minimalist approach to complex systems.' },
  { id: 9, name: 'The Glitch', description: 'Defying standard UI conventions.' },
  { id: 10, name: 'The Muse', description: 'Aesthetic harmony in every node.' },
  { id: 11, name: 'The Developer', description: 'Caffeine-fueled code and tired eyes.' },
  { id: 12, name: 'The Intern', description: 'Fresh perspective on legacy grids.' },
  { id: 13, name: 'The Cosmic', description: 'Universal alignment of design elements.' },
  { id: 14, name: 'The Spark', description: 'Instantaneous conceptual brilliance.' },
  { id: 15, name: 'The Weaver', description: 'Connecting disparate data threads.' },
  { id: 16, name: 'The Shocker', description: 'Breaking the fourth wall of design.' },
  { id: 17, name: 'The Pattern', description: 'Finding order in digital chaos.' },
  { id: 18, name: 'The Voyager', description: 'Navigating uncharted UX territories.' },
  { id: 19, name: 'The Ghost', description: 'Operating in the backend shadows.' },
  { id: 20, name: 'The Lead', description: 'Commanding the neural architecture.' }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('customize');
  const [activeCategory, setActiveCategory] = useState('IDENTITY');
  const [isMorphing, setIsMorphing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    name: 'Lumo Architect',
    handle: 'lumo_design',
    title: 'Interface Specialist',
    avatarUrl: '',
    color: 'gradient-1',
    customHex: '#ff3e00',
    privacy: 'Public',
    syncMode: 'Real-time',
    archetypeId: 1
  });

  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const COLORS = useMemo(() => [
    { id: 'gradient-1', label: 'PRISM', css: '#e76f51', gradient: 'linear-gradient(135deg, #e76f51 0%, #e9c46a 100%)' },
    { id: 'gradient-2', label: 'FLOW', css: '#2a9d8f', gradient: 'linear-gradient(135deg, #2a9d8f 0%, #264653 100%)' },
    { id: 'gradient-3', label: 'CYBER', css: '#264653', gradient: 'linear-gradient(135deg, #264653 0%, #e76f51 100%)' },
    { id: 'custom', label: 'CUSTOM', css: profile.customHex, gradient: `linear-gradient(135deg, ${profile.customHex} 0%, #000000 100%)` }
  ], [profile.customHex]);

  const generatedAvatarUrl = useMemo(() => {
    if (customAvatar) return customAvatar;
    const seeds = ["Felix", "Avery", "Jordan", "Charlie", "Riley", "Parker", "Casey", "Alex", "Skyler", "Quinn", "Jesse", "Taylor", "Morgan", "Sam", "Reese", "Robin", "Dakota", "Pat", "Kerry", "Jamie"];
    const seed = seeds[profile.archetypeId - 1] || 'Lumo';
    // Removed backgroundColor and backgroundType to make it transparent
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;
  }, [profile.archetypeId, customAvatar]);

  useEffect(() => {
    setProfile(p => ({ ...p, avatarUrl: generatedAvatarUrl }));
  }, [generatedAvatarUrl]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNeuralMorph = async () => {
    setIsMorphing(true);
    setCustomAvatar(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the handle "${profile.handle}" and title "${profile.title}". 
        Select the best matching LUMO Archetype ID (1-20) and a single brand hex color that represents their "System Hue".
        Archetypes:
        ${LUMO_ARCHETYPES.map(a => `${a.id}: ${a.name} (${a.description})`).join(', ')}
        Return ONLY a JSON object with "archetypeId" and "customHex".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              archetypeId: { type: Type.INTEGER },
              customHex: { type: Type.STRING }
            }
          }
        }
      });
      
      const res = JSON.parse(response.text || '{}');
      if (res.archetypeId) {
        setProfile(p => ({ ...p, archetypeId: res.archetypeId, customHex: res.customHex || p.customHex, color: res.customHex ? 'custom' : p.color }));
      }
    } catch (e) {
      console.error("Neural Morphing failed", e);
    } finally {
      setIsMorphing(false);
    }
  };

  const selectArchetype = (id: number) => {
    setCustomAvatar(null);
    setProfile(p => ({ ...p, archetypeId: id }));
  };

  const renderTopBar = () => (
    <div className="onboarding-top-bar">
      <div className="ob-left">
        <div className="ob-brand">LUMO</div>
        <div className="ob-meta">IDENTITY_PROTOCOL // ARCHITECT_V3</div>
      </div>
      <div className="ob-right">
        <div className="ob-nav">
          <span className="active">→ {activeCategory}_SYNC</span>
        </div>
      </div>
    </div>
  );

  const renderBottomBar = () => (
    <div className="onboarding-bottom-bar">
        <div className="ob-footer-left"><div className="ob-arrow-icon">↗</div></div>
        <div className="ob-footer-center"><div className="ob-members">SYNCING NODE GRID...</div></div>
        <div className="ob-footer-right">
            <div className="ob-id">// {activeCategory}</div>
            <div className="ob-dots">
                <span className={step === 'customize' ? 'active' : ''}></span>
                <span className={step === 'review' ? 'active' : ''}></span>
                <span className={step === 'welcome' ? 'active' : ''}></span>
            </div>
        </div>
    </div>
  );

  const activeColorData = COLORS.find(c => c.id === profile.color);

  const renderCustomize = () => (
    <div className="ob-screen customize-view fade-in-up">
      <div className="ob-column-left">
        <div className="ob-section-label">CORE IDENTITY</div>
        <div className="ob-side-menu">
            {['IDENTITY', 'VISUALS', 'NETWORK'].map((label) => (
                <div 
                    key={label}
                    className={`ob-menu-item ${activeCategory === label ? 'active' : ''}`}
                    onClick={() => setActiveCategory(label)}
                >
                    {label}
                </div>
            ))}
        </div>
      </div>

      <div className="ob-dynamic-content">
        <div className="ob-sync-view fade-in">
          <div className="ob-column-center">
            <div className={`avatar-stage ${isMorphing ? 'is-morphing' : ''}`}>
                <ProfileCard 
                    name={profile.name}
                    handle={profile.handle}
                    title={profile.title}
                    avatarUrl={profile.avatarUrl}
                    innerGradient={activeColorData?.gradient}
                    behindGlowColor={activeColorData?.css}
                    enableTilt={true}
                />
                {isMorphing && <div className="neural-scan-line"></div>}
            </div>
          </div>
          <div className="ob-column-right scrollable-options">
            
            {activeCategory === 'IDENTITY' && (
                <div className="ob-option-section fade-in">
                    <div className="ob-option-header"><span className="ob-plus">+++</span><h2 className="ob-option-title">Core Specs</h2></div>
                    <div className="ob-input-group">
                        <label className="ob-label">FULL NAME</label>
                        <input type="text" value={profile.name} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} className="ob-text-input" />
                    </div>
                    <div className="ob-input-group">
                        <label className="ob-label">HANDLE</label>
                        <input type="text" value={profile.handle} onChange={(e) => setProfile(p => ({...p, handle: e.target.value.toLowerCase().replace(/\s+/g, '_')}))} className="ob-text-input" />
                    </div>
                    <div className="ob-input-group">
                        <label className="ob-label">SPECIALIZATION</label>
                        <input type="text" value={profile.title} onChange={(e) => setProfile(p => ({...p, title: e.target.value}))} className="ob-text-input" />
                    </div>
                </div>
            )}

            {activeCategory === 'VISUALS' && (
                <div className="ob-option-section fade-in">
                    <div className="ob-option-header"><span className="ob-plus">+++</span><h2 className="ob-option-title">Visual Engine</h2></div>
                    
                    <div className="ob-visual-actions-grid">
                        <div className="ob-neural-morph-cta" onClick={handleNeuralMorph}>
                            {isMorphing ? <ThinkingIcon /> : <SparklesIcon />}
                            <span>{isMorphing ? 'NEURAL_MORPHING...' : 'MAGIC_MORPH_PROFILE'}</span>
                        </div>
                        <div className="ob-manual-upload-cta" onClick={() => fileInputRef.current?.click()}>
                            <CodeIcon />
                            <span>{customAvatar ? 'CHANGE_PHOTO' : 'UPLOAD_CUSTOM'}</span>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              style={{ display: 'none' }} 
                              accept="image/*"
                              onChange={handleAvatarUpload}
                            />
                        </div>
                    </div>

                    <label className="ob-label">LUMO ARCHETYPE</label>
                    <div className="archetype-gallery">
                      {LUMO_ARCHETYPES.map((arch) => (
                        <div 
                          key={arch.id} 
                          className={`archetype-item ${profile.archetypeId === arch.id ? 'active' : ''}`}
                          onClick={() => selectArchetype(arch.id)}
                          title={`${arch.name}: ${arch.description}`}
                        >
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${["Felix", "Avery", "Jordan", "Charlie", "Riley", "Parker", "Casey", "Alex", "Skyler", "Quinn", "Jesse", "Taylor", "Morgan", "Sam", "Reese", "Robin", "Dakota", "Pat", "Kerry", "Jamie"][arch.id - 1]}`} alt={arch.name} />
                        </div>
                      ))}
                    </div>

                    <label className="ob-label" style={{marginTop: '32px'}}>SYSTEM HUE</label>
                    <div className="ob-color-row">
                        {COLORS.map(c => (
                            <div 
                              key={c.id} 
                              className={`ob-color-ring ${profile.color === c.id ? 'selected' : ''}`} 
                              style={{ background: c.gradient }} 
                              onClick={() => {
                                if (c.id === 'custom') {
                                  colorPickerRef.current?.click();
                                }
                                setProfile(prev => ({...prev, color: c.id}));
                              }} 
                            >
                              {c.id === 'custom' && (
                                <input 
                                  type="color" 
                                  ref={colorPickerRef}
                                  value={profile.customHex}
                                  onChange={(e) => setProfile(p => ({...p, customHex: e.target.value, color: 'custom'}))}
                                  style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }}
                                />
                              )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeCategory === 'NETWORK' && (
              <div className="ob-option-section fade-in">
                  <div className="ob-option-header"><span className="ob-plus">+++</span><h2 className="ob-option-title">Grid Settings</h2></div>
                  <div className="ob-option-group">
                      <label className="ob-label">PRIVACY_PROTOCOL</label>
                      <div className="ob-gender-toggle">
                        <button className={`ob-toggle-btn ${profile.privacy === 'Public' ? 'active' : ''}`} onClick={() => setProfile(p => ({...p, privacy: 'Public'}))}>PUBLIC</button>
                        <button className={`ob-toggle-btn ${profile.privacy === 'Private' ? 'active' : ''}`} onClick={() => setProfile(p => ({...p, privacy: 'Private'}))}>PRIVATE</button>
                      </div>
                  </div>
              </div>
            )}

            <div className="ob-inventory-footer">
                <button className="cta-btn-prism ob-wide-cta" onClick={() => setStep('review')}>FINALIZE SYNC</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="ob-screen review-view fade-in-up">
      <div className="review-interface">
        <div className="review-nav-btn" onClick={() => setStep('customize')}><div className="nav-circle-wrap"><span className="nav-text">ADJUST</span></div></div>
        <div className="avatar-stage">
            <ProfileCard 
                name={profile.name} handle={profile.handle} title={profile.title} avatarUrl={profile.avatarUrl}
                innerGradient={activeColorData?.gradient} behindGlowColor={activeColorData?.css}
                enableTilt={true}
            />
        </div>
        <div className="review-nav-btn" onClick={() => setStep('welcome')}><div className="nav-circle-wrap accent"><span className="nav-text">CONFIRM</span></div></div>
      </div>
    </div>
  );

  const renderWelcome = () => (
    <div className="ob-screen welcome-view fade-in-up">
      <div className="welcome-container">
        <div className="welcome-queue-info"><span className="queue-label">ACCESS ID</span><div className="queue-value">011</div></div>
        <div className="welcome-hero-text">
            <h1>IDENTITY<br/>SYNCED</h1>
            <p className="welcome-sub">Your digital footprint is now anchored within the LUMO grid. Proceed to initialization.</p>
            <button className="cta-btn-prism ob-wide-cta" onClick={() => onComplete(profile)}>INITIALIZE CORE</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="onboarding-root">
      <div className="ob-noise"></div>
      <div className="ob-scanlines"></div>
      {renderTopBar()}
      <main className="onboarding-content">
        {step === 'customize' && renderCustomize()}
        {step === 'review' && renderReview()}
        {step === 'welcome' && renderWelcome()}
      </main>
      {renderBottomBar()}
    </div>
  );
};

export default Onboarding;
