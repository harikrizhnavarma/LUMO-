"use client";

import React, { useEffect, useState } from "react";
import { Toolbar } from "@/components/canvas/toolbar";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("toolbarVisible");
    if (stored !== null) {
      setIsToolbarVisible(stored === "true");
    }

    const handleToggle = () => {
      setIsToolbarVisible((prev) => {
        const next = !prev;
        window.localStorage.setItem("toolbarVisible", String(next));
        return next;
      });
    };

    const handleSet = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setIsToolbarVisible(detail);
        window.localStorage.setItem("toolbarVisible", String(detail));
      }
    };

    window.addEventListener("toolbar:toggle", handleToggle);
    window.addEventListener("toolbar:set", handleSet as EventListener);

    return () => {
      window.removeEventListener("toolbar:toggle", handleToggle);
      window.removeEventListener("toolbar:set", handleSet as EventListener);
    };
  }, []);

  return (
    <div className="w-full h-screen">
      {children}
      {isToolbarVisible && <Toolbar />}
    </div>
  );
};

export default Layout;
