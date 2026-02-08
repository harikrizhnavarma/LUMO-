"use client";

import React from "react";

export const LumoGlobalStyles = () => {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@900&family=Roboto+Mono&display=swap");

      :root {
        --primary: #ff3e00;
        --secondary: #00f3ff;
        --tertiary: #ffff00;
        --bg: #f5f5f7;
        --surface: #ffffff;
        --text-main: #1a1a1a;
        --text-dim: #666666;
        --grid-line: rgba(0, 0, 0, 0.05);
        --glass: rgba(0, 0, 0, 0.02);
        --app-bg: #f5f5f7;
        --text-primary: #1a1a1a;
        --text-secondary: #52525b;
        --accent-color: #000000;
        --accent-bg: #e4e4e7;
        --border-color: #e4e4e7;
        --glass-border: rgba(0, 0, 0, 0.1);
        --input-bg: rgba(255, 255, 255, 0.9);
        --transition-duration: 0.4s;
        --transition: all var(--transition-duration) cubic-bezier(0.16, 1, 0.3, 1);
        --font-sans: "Inter", sans-serif;
      }

      [data-theme="dark"] {
        --bg: #030303;
        --surface: #0a0a0a;
        --text-main: #ffffff;
        --text-dim: #888888;
        --grid-line: rgba(255, 255, 255, 0.05);
        --glass: rgba(255, 255, 255, 0.03);
        --app-bg: #030303;
        --text-primary: #ffffff;
        --text-secondary: #a1a1aa;
        --accent-color: #ffffff;
        --accent-bg: #27272a;
        --border-color: #27272a;
        --glass-border: rgba(255, 255, 255, 0.1);
        --input-bg: rgba(24, 24, 27, 0.8);
      }

      html,
      body {
        height: 100%;
        margin: 0;
        padding: 0;
        font-family: var(--font-sans);
        background-color: var(--bg);
        color: var(--text-main);
        overflow: hidden;
        cursor: crosshair;
        transition: background-color var(--transition-duration) ease,
          color var(--transition-duration) ease;
      }

      * {
        transition: background-color var(--transition-duration) ease,
          color var(--transition-duration) ease,
          border-color var(--transition-duration) ease,
          box-shadow var(--transition-duration) ease;
      }

      .cta-btn-prism {
        background: var(--text-main);
        color: var(--bg);
        padding: 20px 40px;
        border: none;
        font-weight: 900;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        transition: var(--transition);
        cursor: pointer;
      }

      .cta-btn-prism:hover {
        background: var(--primary);
        color: #fff;
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(255, 62, 0, 0.3);
      }

      .secondary-cta-prism {
        background: transparent;
        color: var(--text-main);
        padding: 20px 40px;
        border: 1px solid var(--grid-line);
        font-weight: 900;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        transition: var(--transition);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .secondary-cta-prism:hover {
        background: var(--glass);
        border-color: var(--text-main);
      }

      .grid-master {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
        background-size: 40px 40px;
        z-index: -1;
        mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
      }

      .float-blob {
        position: fixed;
        width: 600px;
        height: 600px;
        background: var(--primary);
        filter: blur(150px);
        opacity: 0.05;
        border-radius: 50%;
        z-index: -1;
        top: 20%;
        left: 40%;
        pointer-events: none;
      }

      .landing-page {
        position: absolute;
        inset: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        background-color: var(--bg);
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        scrollbar-width: none;
      }

      .landing-page::-webkit-scrollbar {
        display: none;
      }

      .logo {
        font-family: "Orbitron", sans-serif;
        font-size: 0.9rem;
        letter-spacing: 2px;
        color: var(--text-main);
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: var(--transition);
      }

      .logo:hover {
        color: var(--primary);
      }

      .logo-box {
        width: 12px;
        height: 12px;
        background: var(--primary);
        box-shadow: 0 0 10px var(--primary);
      }

      .landing-footer-prism {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 40px;
        padding: 80px 10%;
        border-top: 1px solid var(--grid-line);
      }

      .footer-brand h2 {
        font-size: 2rem;
        margin: 0 0 12px 0;
      }

      .footer-brand p {
        color: var(--text-dim);
        font-size: 0.9rem;
        line-height: 1.6;
      }

      .footer-col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        font-size: 0.85rem;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .footer-col ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .footer-label {
        font-family: "Orbitron", sans-serif;
        font-size: 0.6rem;
        color: var(--text-main);
      }

      .hero {
        min-height: 85vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 10%;
        position: relative;
        overflow: hidden;
      }

      .hero-background-viz {
        position: absolute;
        inset: 0;
        z-index: -1;
        opacity: 0.8;
        mask-image: radial-gradient(circle at 50% 50%, black, transparent 90%);
      }

      .hero-tag {
        color: var(--primary);
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 5px;
        margin-bottom: 20px;
        display: block;
        position: relative;
      }

      .hero h1 {
        font-size: clamp(3rem, 8vw, 8rem);
        font-weight: 900;
        line-height: 0.9;
        text-transform: uppercase;
        margin-bottom: 30px;
        position: relative;
      }

      .hero h1 span {
        display: block;
        color: transparent;
        -webkit-text-stroke: 1px var(--text-main);
      }

      .hero h1 .filled {
        color: var(--text-main);
        -webkit-text-stroke: 0px;
      }

      .hero-flex {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 40px;
        position: relative;
      }

      .hero-desc {
        max-width: 500px;
        color: var(--text-dim);
        font-size: 1.1rem;
        line-height: 1.6;
      }

      .hero-actions-prism {
        display: flex;
        gap: 20px;
      }

      .grid-section {
        padding: 100px 10%;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 20px;
      }

      .active-cta-card {
        background: linear-gradient(
          135deg,
          rgba(255, 62, 0, 0.95) 0%,
          rgba(255, 120, 40, 0.95) 100%
        );
        color: var(--text-main);
        cursor: pointer;
        grid-column: span 4;
        border: 1px solid rgba(255, 62, 0, 0.5);
        box-shadow: none;
      }

      [data-theme="dark"] .active-cta-card {
        background: linear-gradient(
          135deg,
          rgba(255, 90, 30, 0.9) 0%,
          rgba(255, 180, 80, 0.85) 100%
        );
        color: #fff;
        border: 1px solid rgba(255, 140, 60, 0.6);
        box-shadow: none;
      }

      .active-cta-card .card-title,
      .active-cta-card p,
      .active-cta-card .card-num {
        color: inherit;
      }

      [data-theme="dark"] .active-cta-card .card-title,
      [data-theme="dark"] .active-cta-card p,
      [data-theme="dark"] .active-cta-card .card-num {
        color: #fff;
      }

      .cta-line {
        height: 2px;
        background: #fff;
        width: 50px;
        margin-top: 20px;
      }

      .pd-list-prism {
        list-style: none;
        padding: 0;
        margin: 20px 0 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        color: var(--text-dim);
        font-size: 0.85rem;
      }

      .card-nav-container {
        width: 100%;
        padding: 20px 40px;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-sizing: border-box;
      }

      .card-nav {
        width: 100%;
        border-radius: 24px;
        border: 1px solid var(--grid-line);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition: background-color 0.3s ease;
      }

      .card-nav-top {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
      }

      .hamburger-menu {
        width: 32px;
        height: 32px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        z-index: 10;
        background: transparent;
        border: none;
      }

      .hamburger-line {
        width: 20px;
        height: 2px;
        background: currentColor;
        transition: all 0.3s ease;
      }

      .hamburger-menu.open .hamburger-line:first-child {
        transform: translateY(4px) rotate(45deg);
      }

      .hamburger-menu.open .hamburger-line:last-child {
        transform: translateY(-4px) rotate(-45deg);
      }

      .logo-container {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
      }

      .card-nav-top-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .card-nav-cta-button {
        background: var(--text-main);
        color: var(--bg);
        border: none;
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;
      }

      .card-nav-cta-button:hover {
        transform: scale(1.05);
        background: var(--primary);
      }

      .card-nav-cta-button.secondary {
        background: transparent;
        color: var(--text-main);
        border: 1px solid var(--grid-line);
      }

      .card-nav-cta-button.secondary:hover {
        background: var(--glass);
        border-color: var(--text-main);
      }

      .card-nav-content {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        padding: 0 24px 24px 24px;
        overflow: hidden;
        transition: max-height 0.4s ease, opacity 0.3s ease;
      }

      .nav-card {
        border-radius: 16px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-height: 180px;
        transition: transform 0.3s ease;
      }

      .nav-card:hover {
        transform: translateY(-5px);
      }

      .nav-card-label {
        font-family: "Orbitron", sans-serif;
        font-size: 0.65rem;
        letter-spacing: 2px;
        font-weight: 900;
        opacity: 0.8;
      }

      .nav-card-links {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .nav-card-link {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: inherit;
        font-weight: 600;
        font-size: 0.9rem;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }

      .nav-card-link:hover {
        opacity: 0.7;
        transform: translateX(4px);
      }

      .nav-card-link-icon {
        width: 1rem;
        height: 1rem;
      }

      .lanyard-wrapper {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
      }

      .lanyard-wrapper canvas {
        pointer-events: auto;
      }

      @media (max-width: 768px) {
        .card-nav-content {
          grid-template-columns: 1fr;
        }

        .card-nav-container {
          padding: 10px;
        }

        .landing-footer-prism {
          grid-template-columns: 1fr;
        }
      }

      .registration-marks {
        display: flex;
        gap: 6px;
      }

      .reg-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .signup-root {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg);
        color: var(--text-main);
        font-family: var(--font-sans);
        overflow: hidden;
        transition: background-color var(--transition-duration) ease;
      }

      .signup-container {
        width: 100%;
        max-width: 520px;
        background: var(--glass);
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        border: 1px solid var(--grid-line);
        padding: 60px;
        position: relative;
        z-index: 20;
        animation: signupEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes signupEntrance {
        from {
          opacity: 0;
          transform: scale(0.98) translateY(30px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .signup-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--primary);
      }

      .signup-header {
        margin-bottom: 48px;
        text-align: left;
      }

      .signup-badge {
        font-family: "Orbitron", sans-serif;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 3px;
        color: var(--primary);
        margin-bottom: 24px;
      }

      .signup-header h1 {
        font-size: 3rem;
        font-weight: 900;
        line-height: 0.95;
        margin: 0 0 24px 0;
        letter-spacing: -1px;
      }

      .signup-header h1 .filled {
        color: transparent;
        -webkit-text-stroke: 1px var(--text-main);
      }

      .signup-desc {
        font-size: 0.75rem;
        line-height: 1.6;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 1px;
        max-width: 360px;
      }

      .signup-form {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }

      .signup-input-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .signup-label {
        font-family: "Roboto Mono", monospace;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--text-dim);
      }

      .signup-input {
        background: var(--glass);
        border: 1px solid var(--grid-line);
        padding: 16px 20px;
        font-family: var(--font-sans);
        font-size: 0.9rem;
        color: var(--text-main);
        outline: none;
        transition: var(--transition);
      }

      .signup-input:focus {
        border-color: var(--text-main);
        background: rgba(0, 0, 0, 0.06);
      }

      .signup-submit {
        margin-top: 12px;
        width: 100%;
      }

      .signup-footer-meta {
        margin-top: 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: "Roboto Mono", monospace;
        font-size: 0.6rem;
        color: var(--text-dim);
        letter-spacing: 1px;
      }

      .signup-root .ob-noise {
        z-index: 10;
      }

      .onboarding-root {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background-color: var(--bg);
        color: var(--text-main);
        display: flex;
        flex-direction: column;
        font-family: var(--font-sans);
        overflow: hidden;
        user-select: none;
        transition: background-color var(--transition-duration) ease;
      }

      .onboarding-root .ob-noise {
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        opacity: 0.05;
        pointer-events: none;
        z-index: 10;
      }

      .onboarding-root .ob-scanlines {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.02) 50%);
        background-size: 100% 4px;
        z-index: 11;
        pointer-events: none;
      }

      .onboarding-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 30px 60px;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        z-index: 20;
        border-bottom: 1px solid var(--grid-line);
      }

      .ob-brand {
        font-family: "Orbitron", sans-serif;
        font-weight: 900;
        letter-spacing: 0.2em;
        color: var(--primary);
      }

      .ob-meta {
        opacity: 0.5;
        font-size: 0.6rem;
        letter-spacing: 2px;
      }

      .ob-nav {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }

      .ob-nav span {
        opacity: 0.4;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ob-nav span.active {
        opacity: 1;
        color: var(--text-main);
      }

      .onboarding-content {
        flex: 1;
        position: relative;
        z-index: 20;
        overflow: hidden;
      }

      .ob-screen {
        width: 100%;
        height: 100%;
        max-width: 1600px;
        margin: 0 auto;
        display: flex;
        padding: 0 60px;
        box-sizing: border-box;
      }

      .customize-view {
        display: grid;
        grid-template-columns: 320px 1fr;
        align-items: center;
      }

      .ob-dynamic-content {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .ob-sync-view {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 380px;
        align-items: center;
        height: 100%;
        gap: 40px;
      }

      .ob-column-left {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .ob-column-center {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ob-section-label {
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 0.2em;
        opacity: 0.6;
        margin-bottom: 24px;
        color: var(--primary);
      }

      .ob-side-menu {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .ob-menu-item {
        font-size: 1.8rem;
        font-weight: 400;
        opacity: 0.25;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: flex-start;
      }

      .ob-menu-item.active {
        opacity: 1;
        font-weight: 700;
        transform: translateX(10px);
        color: var(--text-main);
      }

      .ob-column-right {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 80vh;
        padding: 40px 0;
      }

      .scrollable-options {
        overflow-y: auto;
        scrollbar-width: none;
        padding-right: 10px;
      }

      .scrollable-options::-webkit-scrollbar {
        display: none;
      }

      .ob-option-header {
        margin-bottom: 32px;
      }

      .ob-plus {
        font-size: 1.2rem;
        opacity: 0.4;
        display: block;
        margin-bottom: 8px;
        color: var(--primary);
      }

      .ob-option-title {
        font-size: 2rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.02em;
        text-transform: uppercase;
      }

      .ob-input-group {
        margin-bottom: 24px;
      }

      .ob-text-input {
        width: 100%;
        background: var(--glass);
        border: 1px solid var(--grid-line);
        padding: 16px 20px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.9rem;
        color: var(--text-main);
        outline: none;
        transition: var(--transition);
      }

      .ob-text-input:focus {
        border-color: var(--text-main);
        background: rgba(0, 0, 0, 0.04);
      }

      .ob-label {
        font-family: "Roboto Mono", monospace;
        font-size: 0.6rem;
        font-weight: 800;
        opacity: 0.5;
        letter-spacing: 0.1em;
        margin-bottom: 10px;
        display: block;
      }

      .ob-visual-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 32px;
      }

      .ob-manual-upload-cta,
      .ob-neural-morph-cta {
        background: var(--glass);
        border: 1px solid var(--grid-line);
        padding: 16px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        cursor: pointer;
        transition: var(--transition);
      }

      .ob-manual-upload-cta:hover,
      .ob-neural-morph-cta:hover {
        border-color: var(--secondary);
        background: rgba(0, 243, 255, 0.05);
      }

      .ob-manual-upload-cta span,
      .ob-neural-morph-cta span {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 1px;
      }

      .archetype-gallery {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        max-height: 220px;
        overflow-y: auto;
        padding-right: 8px;
        scrollbar-width: thin;
      }

      .archetype-gallery::-webkit-scrollbar {
        width: 4px;
      }

      .archetype-gallery::-webkit-scrollbar-thumb {
        background: var(--grid-line);
        border-radius: 2px;
      }

      .archetype-item {
        aspect-ratio: 1;
        background: var(--glass);
        border: 1px solid var(--grid-line);
        border-radius: 8px;
        cursor: pointer;
        overflow: hidden;
        transition: var(--transition);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .archetype-item:hover {
        border-color: var(--primary);
        background: rgba(255, 62, 0, 0.05);
        transform: translateY(-2px);
      }

      .archetype-item.active {
        border-color: var(--primary);
        background: rgba(255, 62, 0, 0.1);
        box-shadow: 0 0 15px rgba(255, 62, 0, 0.2);
      }

      .archetype-item img {
        width: 90%;
        height: 90%;
        object-fit: contain;
      }

      .ob-color-row {
        display: flex;
        gap: 12px;
      }

      .ob-color-ring {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .ob-color-ring:hover {
        transform: scale(1.1);
      }

      .ob-color-ring.selected {
        box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text-main);
      }

      .avatar-stage {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      }

      .review-view .review-interface {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 140px;
      }

      .review-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-text {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 2px;
        color: var(--text-main);
      }

      .review-nav-btn .nav-circle-wrap {
        width: 180px;
        height: 180px;
        border: 1px solid var(--grid-line);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition);
        background: var(--glass);
      }

      .review-nav-btn .nav-circle-wrap:hover {
        border-color: var(--text-main);
        background: var(--surface);
        transform: scale(1.05);
      }

      .welcome-view {
        align-items: center;
      }

      .welcome-container {
        display: flex;
        align-items: center;
        gap: 120px;
        padding-left: 100px;
      }

      .welcome-queue-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .queue-label {
        font-size: 0.6rem;
        letter-spacing: 2px;
        color: var(--text-dim);
        text-transform: uppercase;
      }

      .queue-value {
        font-size: 3rem;
        font-weight: 800;
        color: var(--text-main);
      }

      .welcome-sub {
        font-size: 1rem;
        color: var(--text-dim);
        max-width: 420px;
        margin-bottom: 24px;
      }

      .welcome-hero-text h1 {
        font-size: 6rem;
        line-height: 0.9;
        font-weight: 900;
        margin: 0 0 32px 0;
        letter-spacing: -2px;
      }

      .onboarding-bottom-bar {
        padding: 30px 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.65rem;
        font-weight: 800;
        z-index: 20;
        border-top: 1px solid var(--grid-line);
      }

      .ob-footer-left,
      .ob-footer-center,
      .ob-footer-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ob-members,
      .ob-id {
        font-size: 0.6rem;
        letter-spacing: 2px;
        color: var(--text-dim);
      }

      .ob-arrow-icon {
        font-size: 0.8rem;
        color: var(--text-dim);
      }

      .ob-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        border: 1px solid var(--text-dim);
        display: inline-block;
        margin: 0 4px;
      }

      .ob-dots span.active {
        background: var(--text-main);
        border-color: var(--text-main);
      }

      .ob-option-section {
        margin-bottom: 40px;
      }

      .ob-inventory-footer {
        margin-top: 32px;
      }

      .ob-wide-cta {
        width: 100%;
      }

      .ob-gender-toggle {
        display: flex;
        gap: 8px;
        background: var(--glass);
        padding: 4px;
        border-radius: 4px;
        border: 1px solid var(--grid-line);
      }

      .ob-toggle-btn {
        flex: 1;
        border: none;
        background: transparent;
        padding: 12px;
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--text-dim);
        cursor: pointer;
        border-radius: 2px;
        transition: all 0.2s;
        letter-spacing: 1px;
      }

      .ob-toggle-btn.active {
        background: var(--text-main);
        color: var(--bg);
      }

      .neural-scan-line {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--primary);
        box-shadow: 0 0 20px var(--primary);
        animation: neuralScan 2s linear infinite;
        z-index: 100;
        pointer-events: none;
      }

      @keyframes neuralScan {
        0% {
          transform: translateY(0);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(500px);
          opacity: 0;
        }
      }

      .is-morphing {
        filter: grayscale(1) contrast(1.2) brightness(1.2);
      }

      .pd-prism-shell {
        width: 100vw;
        height: 100vh;
        background-color: var(--bg);
        display: grid;
        grid-template-columns: 280px 1fr;
        position: fixed;
        inset: 0;
        z-index: 1000;
        overflow: hidden;
        font-family: var(--font-sans);
      }

      .pd-blob {
        opacity: 0.08 !important;
        top: -10% !important;
        left: 20% !important;
      }

      .canvas-prism .grid-master {
        position: absolute;
        inset: 0;
        z-index: 0;
        opacity: 0.35;
        pointer-events: none;
        mask-image: none;
      }

      .canvas-prism .float-blob {
        position: absolute;
        inset: auto;
        z-index: 0;
        opacity: 0.12;
        pointer-events: none;
      }

      .canvas-prism {
        font-family: var(--font-sans);
      }

      .canvas-prism .logo {
        font-family: var(--font-sans);
      }

      .canvas-prism .canvas-orbitron {
        font-family: var(--font-sans);
      }

      .style-guide-ambient {
        position: relative;
        isolation: isolate;
      }

      .style-guide-ambient > * {
        position: relative;
        z-index: 1;
      }

      .style-guide-ambient::before,
      .style-guide-ambient::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0.16;
        mix-blend-mode: normal;
        background-repeat: repeat;
        background-size: 520px 520px;
        animation: motif-drift 26s linear infinite;
        mask-image: none;
      }

      [data-theme="dark"] .style-guide-ambient::before,
      [data-theme="dark"] .style-guide-ambient::after {
        opacity: 0.32;
        mix-blend-mode: normal;
      }

      .style-guide-ambient::before {
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520' viewBox='0 0 520 520' fill='none' stroke='%23ff3e00' stroke-width='1.1' stroke-linecap='round'><path d='M260 40C320 40 360 80 360 140C360 200 320 240 260 240C200 240 160 200 160 140C160 80 200 40 260 40' /><path d='M100 320C140 280 200 280 240 320C280 360 340 360 380 320C420 280 480 280 520 320' /><path d='M0 420C60 380 120 380 180 420C240 460 300 460 360 420C420 380 480 380 540 420' /><path d='M80 80L120 120L80 160L40 120Z' /><path d='M420 120L460 160L420 200L380 160Z' /><path d='M260 300L300 340L260 380L220 340Z' /></svg>");
        animation-duration: 34s;
      }

      .style-guide-ambient::after {
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520' viewBox='0 0 520 520' fill='none' stroke='%2300b3ff' stroke-width='0.9' stroke-linecap='round'><path d='M60 60C140 120 200 120 280 60C360 0 420 0 500 60' /><path d='M20 220C100 280 160 280 240 220C320 160 380 160 460 220' /><path d='M60 380C140 440 200 440 280 380C360 320 420 320 500 380' /><path d='M180 80L220 120L180 160L140 120Z' /><path d='M340 200L380 240L340 280L300 240Z' /><path d='M220 320L260 360L220 400L180 360Z' /></svg>");
        animation-duration: 42s;
        opacity: 0.18;
      }

      @keyframes motif-drift {
        0% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(-40px, -30px, 0);
        }
        100% {
          transform: translate3d(0, 0, 0);
        }
      }

      .pd-prism-sidebar {
        background: var(--bg);
        border-right: 1px solid var(--grid-line);
        display: flex;
        flex-direction: column;
        padding: 40px;
        z-index: 10;
        backdrop-filter: blur(10px);
      }

      .pd-prism-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: "Orbitron", sans-serif;
        font-size: 1.1rem;
        letter-spacing: 3px;
        cursor: pointer;
        margin-bottom: 60px;
        color: var(--text-main);
      }

      .pd-prism-nav {
        display: flex;
        flex-direction: column;
        gap: 15px;
        flex: 1;
      }

      .pd-nav-item-prism {
        background: transparent;
        border: 1px solid transparent;
        color: var(--text-dim);
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 700;
        font-size: 0.75rem;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        transition: var(--transition);
        text-align: left;
      }

      .pd-nav-item-prism:hover {
        background: var(--glass);
        color: var(--text-main);
        border-color: var(--grid-line);
      }

      .pd-nav-item-prism.active {
        background: var(--text-main);
        color: var(--bg);
        border-color: var(--text-main);
      }

      .pd-nav-item-prism.pd-logout {
        border-color: transparent;
        color: var(--text-dim);
        margin-top: auto;
      }

      .pd-nav-item-prism.pd-logout:hover {
        border-color: rgba(255, 62, 0, 0.4);
        color: var(--primary);
        box-shadow: 0 0 18px rgba(255, 62, 0, 0.25);
      }

      .pd-prism-main {
        flex: 1;
        overflow-y: auto;
        padding: 60px 80px;
        display: flex;
        flex-direction: column;
        gap: 50px;
        scrollbar-width: none;
        position: relative;
        z-index: 5;
      }

      .pd-prism-main::-webkit-scrollbar {
        display: none;
      }

      .pd-header-context {
        display: flex;
        flex-direction: column;
      }

      .logo-box.small {
        width: 12px;
        height: 12px;
        background: var(--primary);
        box-shadow: 0 0 10px var(--primary);
      }

      .feature-card-prism,
      .pd-feature-card-prism {
        background: var(--glass);
        border: 1px solid var(--grid-line);
        padding: 40px;
        position: relative;
        transition: var(--transition);
        overflow: hidden;
        grid-column: span 4;
      }

      .feature-card-prism::before,
      .pd-feature-card-prism::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--primary);
        transform: scaleX(0);
        transform-origin: left;
        transition: var(--transition);
      }

      .feature-card-prism:hover::before,
      .pd-feature-card-prism:hover::before {
        transform: scaleX(1);
      }

      .feature-card-prism.cyan::before {
        background: var(--secondary);
      }

      .feature-card-prism.yellow::before {
        background: var(--tertiary);
      }

      .feature-card-prism.cyan {
        grid-column: span 4;
      }

      .feature-card-prism.yellow {
        grid-column: span 4;
      }

      .card-num {
        font-family: "Orbitron", sans-serif;
        font-size: 0.8rem;
        color: var(--text-dim);
        margin-bottom: 30px;
        display: block;
      }

      .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .pd-prism-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 220px;
      }

      .pd-prism-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .pd-prism-studio {
        max-width: 900px;
      }

      .pd-studio-form-prism {
        max-width: 800px;
      }

      .pd-input-grid-prism {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 40px;
      }

      .pd-field-prism {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .pd-field-prism label {
        font-family: "Orbitron", sans-serif;
        font-size: 0.6rem;
        letter-spacing: 2px;
        color: var(--text-dim);
      }

      .pd-field-prism input {
        background: var(--glass);
        border: 1px solid var(--grid-line);
        padding: 16px 20px;
        color: var(--text-main);
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
        transition: var(--transition);
      }

      .pd-studio-actions {
        display: flex;
        gap: 20px;
      }

      .fade-in {
        animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .fade-in-up {
        animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .pd-prism-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      .pd-create-btn {
        padding: 14px 24px;
        font-size: 0.8rem;
      }

      .pd-tagline {
        font-family: "Orbitron", sans-serif;
        font-size: 0.65rem;
        letter-spacing: 4px;
        color: var(--primary);
        display: block;
        margin-bottom: 10px;
      }

      .pd-view-title {
        font-size: 3rem;
        font-weight: 900;
        letter-spacing: -2px;
        margin: 0;
      }

      .pd-prism-hero {
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 60px;
        align-items: center;
      }

      .pd-hero-profile-mount {
        height: 520px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pd-hero-card {
        transform: scale(0.85);
      }

      .pd-hero-stats-prism {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }

      .pd-stat-prism {
        background: var(--glass);
        border: 1px solid var(--grid-line);
        padding: 30px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: var(--transition);
      }

      .pd-stat-prism:hover {
        transform: translateY(-4px);
        border-color: var(--text-main);
      }

      .pd-stat-prism .stat-label {
        font-family: "Orbitron", sans-serif;
        font-size: 0.6rem;
        letter-spacing: 2px;
        color: var(--text-dim);
      }

      .pd-stat-prism .stat-value {
        font-size: 2.2rem;
        font-weight: 900;
        color: var(--text-main);
      }

      .pd-prism-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
      }

      .pd-prism-more {
        display: flex;
        justify-content: center;
        padding: 10px 0 30px;
      }

      .pd-prism-card {
        cursor: pointer;
        min-height: 220px;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: var(--transition);
      }

      .pd-prism-card:hover {
        transform: scale(1.02);
        border-color: var(--text-main);
        z-index: 2;
      }

      .pd-card-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 100% 0%, rgba(255, 62, 0, 0.1), transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }

      .pd-prism-card:hover .pd-card-glow {
        opacity: 1;
      }

      .pd-card-footer {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20px;
        border-top: 1px solid rgba(128, 128, 128, 0.1);
      }

      .pd-node-count {
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 1px;
        opacity: 0.6;
      }

      .pd-card-desc {
        font-size: 0.75rem;
        color: var(--text-dim);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin-bottom: 12px;
      }

      .pd-card-desc-muted {
        opacity: 0.5;
      }

      .pd-card-actions {
        position: absolute;
        top: 18px;
        right: 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 3;
      }

      .pd-card-action {
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.6rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: var(--transition);
      }

      .pd-card-action:hover {
        border-color: rgba(255, 255, 255, 0.35);
        transform: translateY(-1px);
      }

      .pd-card-action.danger {
        color: #ffb4a1;
        border-color: rgba(255, 180, 161, 0.35);
      }

      .pd-row-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pd-vault-card {
        position: relative;
      }

      .pd-archive-link {
        background: transparent;
        border: none;
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 1px;
        color: var(--text-dim);
        cursor: pointer;
        transition: color 0.2s;
      }

      .pd-archive-link:hover {
        color: var(--primary);
      }

      .pd-prism-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .pd-prism-row {
        background: var(--glass);
        border: 1px solid var(--grid-line);
        padding: 20px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: var(--transition);
      }

      .pd-prism-row:hover {
        background: var(--surface);
        border-color: var(--text-main);
        transform: translateX(8px);
      }

      .pd-row-tag {
        font-size: 0.6rem;
        color: var(--text-dim);
        letter-spacing: 1px;
        margin-bottom: 4px;
        display: block;
      }

      .pd-prism-row h4 {
        margin: 0;
        font-size: 1rem;
      }

      .pd-prism-footer {
        margin-top: auto;
        padding-top: 60px;
        border-top: 1px solid var(--grid-line);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pd-status-text {
        font-family: "Roboto Mono", monospace;
        font-size: 0.6rem;
        color: var(--text-dim);
        letter-spacing: 1px;
      }

      .pd-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
        animation: fadeIn 0.4s ease;
      }

      .pd-modal-panel {
        width: min(640px, 92vw);
        background: var(--surface);
        border: 1px solid var(--grid-line);
        padding: 36px;
        display: flex;
        flex-direction: column;
        gap: 28px;
        position: relative;
        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.3);
      }

      [data-theme="dark"] .pd-modal-panel {
        background: rgba(6, 6, 6, 0.95);
      }

      .pd-modal-header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
      }

      .pd-modal-kicker {
        font-family: "Orbitron", sans-serif;
        font-size: 0.6rem;
        letter-spacing: 3px;
        color: var(--primary);
        display: block;
        margin-bottom: 12px;
      }

      .pd-modal-title {
        font-size: 1.8rem;
        margin: 0 0 10px 0;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .pd-modal-sub {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-dim);
      }

      .pd-modal-close {
        background: transparent;
        border: 1px solid var(--grid-line);
        color: var(--text-main);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.8rem;
      }

      .pd-modal-body {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .pd-modal-field {
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-family: "Orbitron", sans-serif;
        font-size: 0.6rem;
        letter-spacing: 2px;
        color: var(--text-dim);
      }

      .pd-modal-field input,
      .pd-modal-field textarea {
        background: var(--input-bg);
        border: 1px solid var(--grid-line);
        color: var(--text-main);
        padding: 14px 16px;
        font-family: var(--font-sans);
        font-size: 0.9rem;
        outline: none;
        resize: none;
      }

      .pd-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
      }

      @media (max-width: 640px) {
        .pd-modal-actions {
          flex-direction: column;
        }
        .pd-modal-panel {
          padding: 28px;
        }
      }

      .pc-card-wrapper {
        --pointer-x: 50%;
        --pointer-y: 50%;
        --background-x: 50%;
        --background-y: 50%;
        --rotate-x: 0deg;
        --rotate-y: 0deg;
        --pointer-from-center: 0;
        --pointer-from-top: 0.5;
        --pointer-from-left: 0.5;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        perspective: 1200px;
        width: 100%;
        height: 100%;
      }

      .pc-behind {
        position: absolute;
        inset: 0;
        background: var(--behind-glow-color);
        filter: blur(80px);
        width: var(--behind-glow-size);
        height: var(--behind-glow-size);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%)
          translate3d(calc(var(--rotate-y) * -1.5), calc(var(--rotate-x) * 1.5), 0);
        opacity: calc(0.15 + (1 - var(--pointer-from-center)) * 0.35);
        pointer-events: none;
        z-index: 0;
      }

      .pc-card-shell {
        position: relative;
        width: 420px;
        height: 630px;
        transform-style: preserve-3d;
        transform: rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
        transition: transform 0.15s ease-out;
        z-index: 10;
      }

      .pc-card-shell.active {
        transition: none;
      }

      .pc-card {
        width: 100%;
        height: 100%;
        background: var(--inner-gradient);
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 40px;
        overflow: hidden;
        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        position: relative;
      }

      .pc-inside {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 40px 30px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }

      .pc-shine {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at var(--pointer-x) var(--pointer-y),
          rgba(255, 255, 255, 0.2) 0%,
          transparent 60%
        );
        pointer-events: none;
        z-index: 5;
      }

      .pc-glare {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.08) 0%,
          transparent 25%,
          transparent 75%,
          rgba(255, 255, 255, 0.04) 100%
        );
        pointer-events: none;
        z-index: 4;
      }

      .pc-content {
        position: relative;
        z-index: 10;
        width: 100%;
      }

      .pc-header-content {
        margin-bottom: 20px;
        flex-shrink: 0;
      }

      .pc-details h3 {
        margin: 0;
        font-size: 2.2rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.04em;
        line-height: 1.1;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .pc-details p {
        margin: 8px 0 0;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .pc-avatar-content.large {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        margin-top: 10px;
        overflow: hidden;
      }

      .avatar.large {
        width: 100%;
        height: 100%;
        max-height: 440px;
        border-radius: 24px;
        object-fit: contain;
        border: none;
        background: transparent;
        transition: transform 0.3s ease;
        z-index: 2;
      }

      .pc-user-info-overlay {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        padding: 10px 16px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-sizing: border-box;
        z-index: 5;
      }

      .pc-user-text {
        display: flex;
        flex-direction: column;
      }

      .pc-handle {
        font-size: 0.85rem;
        font-weight: 800;
        color: #fff;
        letter-spacing: 0.02em;
      }

      .pc-status {
        font-size: 0.55rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .pc-contact-btn {
        background: #fff;
        color: #000;
        border: none;
        padding: 6px 14px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .pc-contact-btn:hover {
        background: var(--secondary, #00f3ff);
        transform: translateY(-2px);
      }

      @media (max-width: 1024px) {
        .customize-view {
          grid-template-columns: 1fr;
        }
        .welcome-container {
          flex-direction: column;
          text-align: center;
          padding: 0;
        }
        .welcome-hero-text h1 {
          font-size: 3.5rem;
        }
        .ob-sync-view {
          grid-template-columns: 1fr;
        }
        .archetype-gallery {
          grid-template-columns: repeat(4, 1fr);
        }
        .pd-prism-hero {
          grid-template-columns: 1fr;
          gap: 40px;
        }
        .pd-hero-profile-mount {
          height: auto;
        }
      }

      @media (max-width: 1024px) {
        .pd-prism-shell {
          grid-template-columns: 1fr;
        }
        .pd-prism-sidebar {
          display: none;
        }
        .pd-prism-main {
          padding: 40px 20px;
        }
      }
    `}</style>
  );
};
