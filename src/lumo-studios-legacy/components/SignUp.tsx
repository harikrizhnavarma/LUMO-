
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import './SignUp.css';

interface SignUpProps {
  onComplete: (data: any) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword && formData.email) {
      onComplete(formData);
    }
  };

  return (
    <div className="signup-root">
      <div className="grid-master"></div>
      <div className="float-blob"></div>
      <div className="ob-noise"></div>
      
      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-badge">PROTOCOL // 01_AUTH</div>
          <h1>INITIALIZE<br/><span className="filled">CREDENTIALS</span></h1>
          <p className="signup-desc">
            ESTABLISH A SECURE HANDSHAKE WITH LUMO STUDIOS. 
            DESIGN SOFTWARE BUILT TO EMPOWER CREATIVES THROUGH AI.
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-input-group">
            <label className="signup-label">ARCHITECT_EMAIL</label>
            <input 
              className="signup-input"
              type="email" 
              required 
              placeholder="NAME@NEXUS"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="signup-input-group">
            <label className="signup-label">CORE_SECRET</label>
            <input 
              className="signup-input"
              type="password" 
              required 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="signup-input-group">
            <label className="signup-label">CONFIRM_SYNC_KEY</label>
            <input 
              className="signup-input"
              type="password" 
              required 
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button type="submit" className="cta-btn-prism signup-submit">
            ACTIVATE CREATIVE IDENTITY
          </button>
        </form>

        <div className="signup-footer-meta">
          <div className="registration-marks">
            <div className="reg-dot" style={{ background: 'var(--primary)' }}></div>
            <div className="reg-dot" style={{ background: 'var(--secondary)' }}></div>
            <div className="reg-dot" style={{ background: 'var(--tertiary)' }}></div>
          </div>
          <span>SYST_REF: 4829-NC // ACCESS_AUTH_V3</span>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
