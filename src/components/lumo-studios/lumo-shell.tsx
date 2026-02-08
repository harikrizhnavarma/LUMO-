"use client";

import React, { useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { LumoGlobalStyles } from "./lumo-global-styles";

type LumoShellProps = {
  children: React.ReactNode;
};

export const LumoShell = ({ children }: LumoShellProps) => {
  const { resolvedTheme, theme } = useTheme();
  const dataTheme = useMemo(() => {
    const active = resolvedTheme ?? theme;
    return active === "dark" ? "dark" : "light";
  }, [resolvedTheme, theme]);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", dataTheme);
    return () => {
      if (previous) {
        root.setAttribute("data-theme", previous);
      } else {
        root.removeAttribute("data-theme");
      }
    };
  }, [dataTheme]);

  return (
    <div>
      <LumoGlobalStyles />
      {children}
    </div>
  );
};
