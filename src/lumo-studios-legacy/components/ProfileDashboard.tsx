
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ProfileCard from './ProfileCard';
import './ProfileDashboard.css';
import { 
    SparklesIcon, 
    GridIcon, 
    LibraryIcon, 
    CodeIcon, 
    TrashIcon,
    FolderIcon,
    BookmarkIcon
} from './Icons';

interface ProfileDashboardProps {
  profile: any;
  onCreateProject: () => void;
  sessions: any[];
  onSelectProject: (index: number) => void;
  onUpdateProfile: (profile: any) => void;
  onToggleArchive: (sessionId: string) => void;
  onDeleteSession?: (index: number) => void;
}

type TabType = 'projects' | 'archives' | 'assets' | 'studio';
type AssetFolder = 'all' | 'saved';

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ 
  profile, 
  onCreateProject, 
  sessions, 
  onSelectProject,
  onUpdateProfile,
  onToggleArchive,
  onDeleteSession
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [activeAssetFolder, setActiveAssetFolder] = useState<AssetFolder>('saved');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  
  const [studioProfile, setStudioProfile] = useState({
    name: profile.name,
    handle: profile.handle,
    title: profile.title,
    privacy: profile.privacy || 'Public',
    syncMode: profile.syncMode || 'Real-time',
    color: profile.color || 'gradient-1',
    customHex: profile.customHex || '#ff3e00',
    avatarUrl: profile.avatarUrl
  });

  useEffect(() => {
    setStudioProfile({
      name: profile.name,
      handle: profile.handle,
      title: profile.title,
      privacy: profile.privacy || 'Public',
      syncMode: profile.syncMode || 'Real-time',
      color: profile.color || 'gradient-1',
      customHex: profile.customHex || '#ff3e00',
      avatarUrl: profile.avatarUrl
    });
  }, [profile]);

  const activeSessions = useMemo(() => sessions.filter(s => !s.isArchived), [sessions]);
  const archivedSessions = useMemo(() => sessions.filter(s => s.isArchived), [sessions]);

  const expandedSession = useMemo(() => 
    sessions.find(s => s.id === expandedSessionId), 
    [sessions, expandedSessionId]
  );

  const allAssets = useMemo(() => {
    return sessions.flatMap((sess, sIdx) => 
      sess.artifacts.map((art: any, aIdx: number) => ({
        ...art,
        sessionPrompt: sess.prompt,
        sessionIndex: sIdx
      }))
    ).reverse();
  }, [sessions]);

  const savedAssets = useMemo(() => allAssets.filter(a => a.isSaved), [allAssets]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudioProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStudio = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ ...profile, ...studioProfile });
  };

  const getGradient = (colorId: string, customHex: string) => {
    switch (colorId) {
      case 'gradient-1': return 'linear-gradient(135deg, #e76f51 0%, #e9c46a 100%)';
      case 'gradient-2': return 'linear-gradient(135deg, #2a9d8f 0%, #264653 100%)';
      case 'gradient-3': return 'linear-gradient(135deg, #264653 0%, #e76f51 100%)';
      case 'custom': return `linear-gradient(135deg, ${customHex} 0%, #000000 100%)`;
      default: return 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)';
    }
  };

  const getBehindGlow = (colorId: string, customHex: string) => {
    switch (colorId) {
      case 'gradient-1': return '#e76f51';
      case 'gradient-2': return '#2a9d8f';
      case 'gradient-3': return '#264653';
      case 'custom': return customHex;
      default: return '#ffffff';
    }
  };

  const renderProjects = () => (
    <div className="pd-prism-grid fade-in">
        {activeSessions.length === 0 ? (
            <div className="pd-prism-empty" onClick={onCreateProject}>
                <div className="pd-feature-card-prism">
                    <span className="card-num">00 // VOID</span>
                    <h3 className="card-title">Grid idle.</h3>
                    <p>No active architectural strata detected in the current sector.</p>
                    <button className="cta-btn-prism" style={{ marginTop: '20px' }}>INITIALIZE_SEQUENCE</button>
                </div>
            </div>
        ) : (
            activeSessions.slice().reverse().map((sess, idx) => (
                <div 
                    key={sess.id} 
                    className={`pd-prism-card feature-card-prism ${idx % 3 === 1 ? 'cyan' : idx % 3 === 2 ? 'yellow' : ''}`}
                    onClick={() => setExpandedSessionId(sess.id)}
                >
                    <div className="pd-card-glow"></div>
                    <span className="card-num">SEQ_{sess.id.substring(0, 4).toUpperCase()}</span>
                    <h3 className="card-title">{sess.prompt}</h3>
                    <p>MAPPED: {new Date(sess.timestamp).toLocaleDateString()}</p>
                    <div className="pd-card-footer">
                        <span className="pd-node-count">{sess.artifacts.length} NODES</span>
                        <div className="pd-card-actions">
                             <button 
                                className="pd-archive-link"
                                onClick={(e) => { e.stopPropagation(); onToggleArchive(sess.id); }}
                            >
                                ARCHIVE
                            </button>
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
  );

  const renderAssets = () => {
    const assetsToDisplay = activeAssetFolder === 'saved' ? savedAssets : allAssets;

    return (
      <div className="pd-assets-tab-container fade-in">
          <div className="pd-assets-folders">
              <div 
                className={`pd-folder-item ${activeAssetFolder === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveAssetFolder('saved')}
              >
                  <FolderIcon />
                  <div className="pd-folder-info">
                      <span className="pd-folder-label">Saved Artifacts</span>
                      <span className="pd-folder-meta">{savedAssets.length} Items</span>
                  </div>
                  <BookmarkIcon className="pd-folder-indicator" />
              </div>
              <div 
                className={`pd-folder-item ${activeAssetFolder === 'all' ? 'active' : ''}`}
                onClick={() => setActiveAssetFolder('all')}
              >
                  <FolderIcon />
                  <div className="pd-folder-info">
                      <span className="pd-folder-label">All Fragments</span>
                      <span className="pd-folder-meta">{allAssets.length} Items</span>
                  </div>
              </div>
          </div>

          <div className="pd-prism-grid assets-mode">
              {assetsToDisplay.length === 0 ? (
                  <div className="pd-prism-empty">
                      <div className="pd-feature-card-prism"><p>{activeAssetFolder === 'saved' ? 'COLLECTION_EMPTY' : 'REGISTRY_VACANT'}</p></div>
                  </div>
              ) : (
                  assetsToDisplay.map((asset) => (
                      <div key={asset.id} className="pd-prism-asset-card" onClick={() => onSelectProject(asset.sessionIndex)}>
                          <div className="pd-asset-frame">
                              <iframe srcDoc={asset.html} title={asset.id} sandbox="allow-scripts allow-same-origin" />
                              {asset.isSaved && <div className="pd-asset-saved-badge"><BookmarkIcon /></div>}
                          </div>
                          <div className="pd-asset-info">
                              <span className="pd-asset-tag">{asset.styleName.toUpperCase()}</span>
                              <h4 className="pd-asset-name">{asset.sessionPrompt}</h4>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    );
  };

  const renderArchives = () => (
    <div className="pd-prism-stack fade-in">
        {archivedSessions.length === 0 ? (
            <div className="pd-prism-empty">
                <div className="pd-feature-card-prism"><p>COLD STORAGE_EMPTY</p></div>
            </div>
        ) : (
            archivedSessions.slice().reverse().map((sess) => (
                <div key={sess.id} className="pd-prism-row" onClick={() => setExpandedSessionId(sess.id)}>
                    <div className="pd-row-details">
                        <span className="pd-row-tag">VAULTED // {new Date(sess.timestamp).toLocaleDateString()}</span>
                        <h4>{sess.prompt}</h4>
                    </div>
                    <div className="pd-row-actions">
                        <button className="secondary-cta-prism" style={{ padding: '8px 16px', fontSize: '0.6rem' }} onClick={(e) => { e.stopPropagation(); onToggleArchive(sess.id); }}>RESTORE</button>
                    </div>
                </div>
            ))
        )}
    </div>
  );

  const renderStudio = () => (
    <div className="pd-prism-studio fade-in">
        <form className="pd-studio-form-prism" onSubmit={handleSaveStudio}>
            <div className="pd-input-grid-prism">
                <div className="pd-field-prism">
                    <label>ARCHITECT_IDENTITY</label>
                    <input 
                        type="text" 
                        value={studioProfile.name} 
                        onChange={(e) => setStudioProfile({...studioProfile, name: e.target.value})}
                        required
                    />
                </div>
                <div className="pd-field-prism">
                    <label>NODE_HANDLE</label>
                    <input 
                        type="text" 
                        value={studioProfile.handle} 
                        onChange={(e) => setStudioProfile({...studioProfile, handle: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                        required
                    />
                </div>
                <div className="pd-field-prism">
                    <label>SPECIALIZATION_CORE</label>
                    <input 
                        type="text" 
                        value={studioProfile.title} 
                        onChange={(e) => setStudioProfile({...studioProfile, title: e.target.value})}
                    />
                </div>
                <div className="pd-field-prism">
                    <label>PRIVACY_PROTOCOL</label>
                    <select 
                        value={studioProfile.privacy}
                        onChange={(e) => setStudioProfile({...studioProfile, privacy: e.target.value})}
                    >
                        <option value="Public">PUBLIC_NODE</option>
                        <option value="Private">ENCRYPTED_VAULT</option>
                    </select>
                </div>
                <div className="pd-field-prism full-width">
                    <label>AVATAR_OVERRIDE</label>
                    <div className="pd-upload-container">
                        <div className="pd-avatar-preview-mini">
                            <img src={studioProfile.avatarUrl} alt="Preview" />
                        </div>
                        <div className="pd-upload-controls">
                            <button 
                              type="button" 
                              className="secondary-cta-prism pd-upload-btn" 
                              onClick={() => fileInputRef.current?.click()}
                            >
                                CHOOSE_FILE
                            </button>
                            <span className="pd-upload-meta">SVG / PNG / JPG supported</span>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              style={{ display: 'none' }} 
                              accept="image/*"
                              onChange={handleAvatarUpload}
                            />
                        </div>
                    </div>
                </div>
                <div className="pd-field-prism full-width">
                    <label>SYSTEM_HUE_CALIBRATION</label>
                    <div className="ob-color-row">
                      {['gradient-1', 'gradient-2', 'gradient-3', 'custom'].map(id => {
                        const gradient = id === 'custom' 
                          ? `linear-gradient(135deg, ${studioProfile.customHex} 0%, #000000 100%)`
                          : id === 'gradient-1' ? 'linear-gradient(135deg, #e76f51 0%, #e9c46a 100%)'
                          : id === 'gradient-2' ? 'linear-gradient(135deg, #2a9d8f 0%, #264653 100%)'
                          : 'linear-gradient(135deg, #264653 0%, #e76f51 100%)';
                        
                        return (
                          <div 
                            key={id}
                            className={`ob-color-ring ${studioProfile.color === id ? 'selected' : ''}`}
                            style={{ background: gradient }}
                            onClick={() => {
                              if (id === 'custom') colorPickerRef.current?.click();
                              setStudioProfile({...studioProfile, color: id});
                            }}
                          >
                            {id === 'custom' && (
                              <input 
                                type="color"
                                ref={colorPickerRef}
                                value={studioProfile.customHex}
                                onChange={(e) => setStudioProfile({...studioProfile, customHex: e.target.value, color: 'custom'})}
                                style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                </div>
            </div>
            <div className="pd-studio-actions">
                <button type="submit" className="cta-btn-prism">SAVE_STRATUM_SPEC</button>
                <button 
                    type="button" 
                    className="secondary-cta-prism"
                    onClick={() => setStudioProfile({...profile})}
                >
                    REVERT
                </button>
            </div>
        </form>
    </div>
  );

  return (
    <div className="pd-prism-shell fade-in">
        {/* LANDING PAGE UI ELEMENTS */}
        <div className="grid-master"></div>
        <div className="float-blob pd-blob"></div>
        
        {/* Project Detail Modal / Expansion */}
        {expandedSession && (
            <div className="pd-modal-overlay fade-in" onClick={() => setExpandedSessionId(null)}>
                <div className="pd-modal-content" onClick={e => e.stopPropagation()}>
                    <header className="pd-modal-header">
                        <div className="pd-modal-header-info">
                            <span className="pd-tagline">PROJECT_STRATA // {expandedSession.id.substring(0,8).toUpperCase()}</span>
                            <h2 className="pd-modal-title">{expandedSession.prompt}</h2>
                        </div>
                        <button className="pd-modal-close" onClick={() => setExpandedSessionId(null)}>&times;</button>
                    </header>
                    <div className="pd-modal-body">
                        <div className="pd-modal-artifact-grid">
                            {expandedSession.artifacts.map((art: any) => (
                                <div key={art.id} className="pd-modal-artifact-item">
                                    <div className="pd-modal-artifact-frame">
                                        <iframe srcDoc={art.html} title={art.id} sandbox="allow-scripts allow-same-origin" />
                                    </div>
                                    <div className="pd-modal-artifact-label">
                                        {art.styleName.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <footer className="pd-modal-footer">
                        <button className="cta-btn-prism" onClick={() => onSelectProject(sessions.indexOf(expandedSession))}>
                            WORKSHOP_SYNC
                        </button>
                        <div className="pd-modal-secondary-actions">
                            <button className="secondary-cta-prism" onClick={() => { onToggleArchive(expandedSession.id); setExpandedSessionId(null); }}>
                                {expandedSession.isArchived ? 'UNARCHIVE' : 'ARCHIVE'}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        )}

        <aside className="pd-prism-sidebar">
            <div className="pd-prism-logo" onClick={() => onSelectProject(-1)}>
                <div className="logo-box small"></div>
                LUMO
            </div>
            
            <nav className="pd-prism-nav">
                <button className={`pd-nav-item-prism ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
                    <GridIcon /> <span>DASHBOARD</span>
                </button>
                <button className={`pd-nav-item-prism ${activeTab === 'archives' ? 'active' : ''}`} onClick={() => setActiveTab('archives')}>
                    <LibraryIcon /> <span>VAULT</span>
                </button>
                <button className={`pd-nav-item-prism ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
                    <CodeIcon /> <span>ASSETS</span>
                </button>
                <button className={`pd-nav-item-prism ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}>
                    <SparklesIcon /> <span>STUDIO</span>
                </button>
            </nav>
            
            <div className="pd-registration-marks">
                <div className="reg-dot" style={{ background: 'var(--primary)' }}></div>
                <div className="reg-dot" style={{ background: 'var(--secondary)' }}></div>
                <div className="reg-dot" style={{ background: 'var(--tertiary)' }}></div>
            </div>
        </aside>

        <main className="pd-prism-main">
            <header className="pd-prism-header">
                <div className="pd-header-context">
                    <span className="pd-tagline">ARCHITECT_SPACE // {profile.handle.toUpperCase()}</span>
                    <h1 className="pd-view-title">{activeTab.toUpperCase()}_STRATUM</h1>
                </div>
                <button className="cta-btn-prism pd-create-btn" onClick={onCreateProject}>
                    NEW_SEQUENCE +
                </button>
            </header>

            {/* HERO PROFILE SECTION */}
            <section className="pd-prism-hero">
                <div className="pd-hero-profile-mount">
                    <ProfileCard 
                        name={profile.name}
                        handle={profile.handle}
                        title={profile.title}
                        avatarUrl={studioProfile.avatarUrl}
                        innerGradient={getGradient(studioProfile.color, studioProfile.customHex)}
                        behindGlowColor={getBehindGlow(studioProfile.color, studioProfile.customHex)}
                        enableTilt={true}
                        showUserInfo={true}
                        className="pd-hero-card"
                    />
                </div>
                
                <div className="pd-hero-stats-prism">
                    <div className="pd-stat-prism">
                        <span className="stat-label">SEQUENCES</span>
                        <div className="stat-value">{sessions.length}</div>
                    </div>
                    <div className="pd-stat-prism">
                        <span className="stat-label">EFFICIENCY</span>
                        <div className="stat-value">98.4%</div>
                    </div>
                    <div className="pd-stat-prism">
                        <span className="stat-label">LEVEL</span>
                        <div className="stat-value">ALPHA_04</div>
                    </div>
                </div>
            </section>

            <div className="pd-prism-content">
                {activeTab === 'projects' && renderProjects()}
                {activeTab === 'assets' && renderAssets()}
                {activeTab === 'archives' && renderArchives()}
                {activeTab === 'studio' && renderStudio()}
            </div>

            <footer className="pd-prism-footer">
                <div className="registration-marks">
                    <div className="reg-dot" style={{ background: 'var(--primary)' }}></div>
                    <div className="reg-dot" style={{ background: 'var(--secondary)' }}></div>
                    <div className="reg-dot" style={{ background: 'var(--tertiary)' }}></div>
                </div>
                <span className="pd-status-text">SYSTEM_NOMINAL // GRID_SYNC_STABLE // 2024</span>
            </footer>
        </main>
    </div>
  );
};

export default ProfileDashboard;
