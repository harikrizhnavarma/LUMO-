"use client";

import React, { useEffect, useState } from "react";
import { CircleQuestionMark, Hash, LayoutTemplate, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SignOutButton } from "../buttons/sign-out";
import { Autosave } from "../canvas/autosave";
import { BrandInfluenceControl } from "../brand/brand-influence-control";
import { useAppSelector } from "@/redux/store";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import ThemeToggle from "@/components/theme-toggle";

type TabProps = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  placeholder?: boolean;
};

export const Navbar = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const projectId = params.get("project");

  // Profile can be either { user: Profile } or Profile directly
  const profileState = useAppSelector((state) => (state as any).profile);
  const me = (profileState?.user ?? profileState) as any;

  const hasCanvas = pathname.includes("canvas");
  const hasStyleGuide = pathname.includes("style-guide");
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  const showTabs = !!projectId && (hasCanvas || hasStyleGuide);
  const showProjectContext = showTabs;

  const project = useQuery(
    api.projects.getProject,
    projectId && showProjectContext
      ? { projectId: projectId as Id<"projects"> }
      : "skip"
  );
  const studioProfile = useQuery(api.studioProfiles.getStudioProfile);

  if (!me) {
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("toolbarVisible");
    if (stored !== null) {
      setToolbarVisible(stored === "true");
    }

    const previewStored = window.localStorage.getItem("previewPanelOpen");
    if (previewStored !== null) {
      setPreviewOpen(previewStored === "true");
    }

    const storedProfile = window.localStorage.getItem("lumo_core_profile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed?.avatarUrl) {
          setLocalAvatarUrl(parsed.avatarUrl);
        }
      } catch {
        setLocalAvatarUrl(null);
      }
    }

    const handleStorage = () => {
      const next = window.localStorage.getItem("toolbarVisible");
      if (next !== null) {
        setToolbarVisible(next === "true");
      }
      const nextPreview = window.localStorage.getItem("previewPanelOpen");
      if (nextPreview !== null) {
        setPreviewOpen(nextPreview === "true");
      }
      const nextProfile = window.localStorage.getItem("lumo_core_profile");
      if (nextProfile) {
        try {
          const parsed = JSON.parse(nextProfile);
          setLocalAvatarUrl(parsed?.avatarUrl ?? null);
        } catch {
          setLocalAvatarUrl(null);
        }
      }
    };

    const handlePreviewState = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setPreviewOpen(detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("preview:state", handlePreviewState as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "preview:state",
        handlePreviewState as EventListener
      );
    };
  }, []);

  const tabs: TabProps[] = [
    {
      label: "Canvas",
      href: `/dashboard/${me.name}/canvas?project=${projectId}`,
      icon: <Hash className="h-4 w-4" />,
    },
    {
      label: "Vibecode",
      href: "#",
      icon: <LayoutTemplate className="h-4 w-4" />,
      placeholder: true,
    },
  ];

  const isActiveTab = (href: string) => {
    if (!href) return false;
    const url = new URL(href, "http://localhost");
    const path = url.pathname;
    if (hasCanvas && path.includes("/canvas")) return true;
    if (hasStyleGuide && path.includes("/style-guide")) return true;
    return false;
  };

  // 🔑 Robust image source:
  // 1) Try me.image (Convex user image)
  // 2) Fallback to deterministic identicon based on email/name
  const rawImage = (me?.image as string | undefined) ?? "";
  const fallbackSeed =
    (me?.email as string | undefined) ??
    (me?.name as string | undefined) ??
    "user";

  const avatarSrc =
    (studioProfile?.avatarUrl &&
    typeof studioProfile.avatarUrl === "string" &&
    studioProfile.avatarUrl.trim().length > 0
      ? studioProfile.avatarUrl
      : localAvatarUrl && localAvatarUrl.trim().length > 0
        ? localAvatarUrl
        : rawImage && rawImage.trim().length > 0
          ? rawImage
          : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
              fallbackSeed
            )}`) ?? undefined;

  const wrapperClass =
    "grid p-6 fixed top-0 left-0 right-0 z-50 " +
    "bg-transparent border-b border-transparent shadow-none pointer-events-none " +
    (showTabs ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-2");

  return (
    <div className={wrapperClass}>
      {/* Left: logo + project name */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <Link
          href={`/dashboard/${me.name}`}
          className="logo"
          aria-label="Lumo dashboard"
        >
          <div className="logo-box" />
          LUMO
        </Link>

        {showProjectContext && project && (
          <div
            className="inline-flex max-w-[40vw] truncate rounded-full backdrop-blur-xl bg-[var(--canvas-panel-strong)] px-4 py-2 text-sm text-[var(--canvas-panel-text)] saturate-150 border border-[var(--canvas-panel-border)]"
          >
            Project / {project.name}
          </div>
        )}
      </div>

      {/* Center: tabs */}
      {showTabs && (
        <div className="lg:flex hidden items-center justify-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 backdrop-blur-xl bg-[var(--canvas-panel-strong)] border border-[var(--canvas-panel-border)] rounded-md p-2 saturate-150">
            {tabs.map((t) => {
              const active = t.placeholder ? false : isActiveTab(t.href);
              const content = (
                <>
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-md w-6 h-6",
                      active
                        ? "bg-white/90 dark:bg-black/80 text-[var(--canvas-panel-text)]"
                        : "bg-[var(--canvas-panel-hover)] text-[var(--canvas-panel-text)]",
                    ].join(" ")}
                  >
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                </>
              );

              if (t.placeholder) {
                return (
                  <button
                    key={t.label}
                    type="button"
                    className="group inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition text-[var(--canvas-panel-muted)] hover:text-[var(--canvas-panel-text)] hover:bg-[var(--canvas-panel-hover)] border border-transparent"
                    onClick={(event) => event.preventDefault()}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={[
                    "group inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition",
                    active
                      ? "bg-[var(--canvas-accent)] text-white dark:text-black border border-[var(--canvas-accent)]"
                      : "text-[var(--canvas-panel-muted)] hover:text-[var(--canvas-panel-text)] hover:bg-[var(--canvas-panel-hover)] border border-transparent",
                  ].join(" ")}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-4 justify-end pointer-events-auto">
        {hasCanvas && <BrandInfluenceControl />}
        {hasCanvas && (
          <Button
            variant="secondary"
            className="rounded-md h-12 px-4 flex items-center justify-center 
            border border-[var(--canvas-panel-border)] 
            bg-[var(--canvas-panel)]
            text-[var(--canvas-panel-text)]
            hover:bg-[var(--canvas-panel-hover-strong)] transition"
            onClick={() => {
              const next = !previewOpen;
              setPreviewOpen(next);
              if (typeof window !== "undefined") {
                window.localStorage.setItem("previewPanelOpen", String(next));
                window.dispatchEvent(
                  new CustomEvent("preview:set", { detail: next })
                );
              }
            }}
            title={previewOpen ? "Hide preview" : "Show preview"}
          >
            <LayoutTemplate className="size-5" />
          </Button>
        )}

        {hasCanvas && (
          <Button
            variant="secondary"
            className="rounded-md h-12 px-4 flex items-center justify-center 
            border border-[var(--canvas-panel-border)] 
            bg-[var(--canvas-panel)]
            text-[var(--canvas-panel-text)]
            hover:bg-[var(--canvas-panel-hover-strong)] transition"
            onClick={() => {
              const next = !toolbarVisible;
              setToolbarVisible(next);
              if (typeof window !== "undefined") {
                window.localStorage.setItem("toolbarVisible", String(next));
                window.dispatchEvent(
                  new CustomEvent("toolbar:set", { detail: next })
                );
              }
            }}
            title={toolbarVisible ? "Hide tools" : "Show tools"}
          >
            <Wrench className="size-5" />
          </Button>
        )}
        {hasCanvas && <Autosave />}
        <SignOutButton />

        <Button
          variant="secondary"
          className="rounded-md h-12 w-12 flex items-center justify-center 
          border border-[var(--canvas-panel-border)] 
          bg-[var(--canvas-panel)]
          text-[var(--canvas-panel-text)]
          hover:bg-[var(--canvas-panel-hover-strong)] transition"
        >
          <CircleQuestionMark className="size-5 text-[var(--canvas-panel-text)]" />
        </Button>

        <ThemeToggle />

        {/* 🔥 Avatar: always visible with fallback */}
        <Avatar className="size-12 ml-2 border border-[var(--canvas-panel-border)] overflow-hidden">
          <AvatarImage
            src={avatarSrc || undefined}
            alt={me?.name ?? "Profile picture"}
            className="object-cover"
          />
          <AvatarFallback className="bg-[var(--canvas-panel-hover)] flex items-center justify-center">
            <User className="size-5 text-[var(--canvas-panel-text)]" />
          </AvatarFallback>
        </Avatar>

        {/* Upgrade button – only on dashboard */}
        {!hasCanvas && !hasStyleGuide && (
          <Link href={`/billing/${me.name}`}>
            <Button
              className="
                rounded-full h-12 px-6 font-medium cursor-pointer
                bg-neutral-900 dark:bg-white
                text-white dark:text-black
                hover:bg-neutral-800 dark:hover:bg-white/90
                border border-neutral-300 dark:border-white/20
                transition
              "
            >
              Upgrade
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
