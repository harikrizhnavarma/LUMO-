"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

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
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  onEnterCore: () => void;
  onSignIn?: () => void;
  toggleTheme: () => void;
  themeLabel: string;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  items,
  className = "",
  baseColor = "var(--bg)",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  onEnterCore,
  onSignIn,
  toggleTheme,
  themeLabel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    setContentHeight(contentRef.current.scrollHeight);
  }, [items, isExpanded]);

  return (
    <div className={`card-nav-container ${className}`}>
      <nav
        className={`card-nav ${isExpanded ? "open" : ""}`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top">
          <button
            className={`hamburger-menu ${isExpanded ? "open" : ""}`}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            type="button"
            style={{ color: menuColor || "var(--text-main)" }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </button>

          <div className="logo-container">{logo}</div>

          <div className="card-nav-top-right">
            <button className="theme-toggle" onClick={toggleTheme} type="button">
              {themeLabel}
            </button>
            {onSignIn && (
              <button
                type="button"
                className="card-nav-cta-button secondary"
                onClick={onSignIn}
              >
                Sign In
              </button>
            )}
            <button
              type="button"
              className="card-nav-cta-button"
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
              onClick={onEnterCore}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div
          className="card-nav-content"
          ref={contentRef}
          style={{
            maxHeight: isExpanded ? contentHeight : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          aria-hidden={!isExpanded}
        >
          {(items || []).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
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
                    <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
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
