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
import { useAppSelector } from "@/redux/store";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import ThemeToggle from "@/components/theme-toggle";

type TabProps = {
  label: string;
  href: string;
  icon?: React.ReactNode;
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

  const showTabs = !!projectId && (hasCanvas || hasStyleGuide);
  const showProjectContext = showTabs;

  const project = useQuery(
    api.projects.getProject,
    projectId && showProjectContext
      ? { projectId: projectId as Id<"projects"> }
      : "skip"
  );

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

    const handleStorage = () => {
      const next = window.localStorage.getItem("toolbarVisible");
      if (next !== null) {
        setToolbarVisible(next === "true");
      }
      const nextPreview = window.localStorage.getItem("previewPanelOpen");
      if (nextPreview !== null) {
        setPreviewOpen(nextPreview === "true");
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
      label: "Style Guide",
      href: `/dashboard/${me.name}/style-guide?project=${projectId}`,
      icon: <LayoutTemplate className="h-4 w-4" />,
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
    rawImage && rawImage.trim().length > 0
      ? rawImage
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
          fallbackSeed
        )}`;

  const wrapperClass =
    "grid p-6 fixed top-0 left-0 right-0 z-50 " +
    (showTabs ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-2");

  return (
    <div className={wrapperClass}>
      {/* Left: logo + project name */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/${me.name}`}
          className="w-8 h-8 rounded-full border-3 border-white bg-black flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-white" />
        </Link>

        {showProjectContext && project && (
          <div className="lg:inline-block hidden rounded-full backdrop-blur-xl bg-white/80 dark:bg-white/[0.08] px-4 py-2 text-sm text-neutral-900 dark:text-white saturate-150 border border-neutral-200 dark:border-white/15">
            Project / {project.name}
          </div>
        )}
      </div>

      {/* Center: tabs */}
      {showTabs && (
        <div className="lg:flex hidden items-center justify-center gap-2">
          <div className="flex items-center gap-2 backdrop-blur-xl bg-white/80 dark:bg-white/[0.08] border border-neutral-200 dark:border-white/[0.12] rounded-full p-2 saturate-150">
            {tabs.map((t) => {
              const active = isActiveTab(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={[
                    "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                    active
                      ? "bg-neutral-900 text-white border border-neutral-900 dark:bg-white dark:text-black dark:border-white"
                      : "text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200 hover:bg-neutral-100 dark:hover:bg-white/[0.06] border border-transparent",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-full w-6 h-6",
                      active
                        ? "bg-white text-black"
                        : "bg-neutral-200 text-neutral-800 dark:bg-white/10 dark:text-white",
                    ].join(" ")}
                  >
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-4 justify-end">
        {hasCanvas && (
          <Button
            variant="secondary"
            className="rounded-full h-12 px-4 flex items-center justify-center 
            border border-neutral-300 dark:border-white/20 
            bg-neutral-100 dark:bg-transparent
            text-neutral-700 dark:text-white
            hover:bg-neutral-200 dark:hover:bg-white/10 transition"
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
            className="rounded-full h-12 px-4 flex items-center justify-center 
            border border-neutral-300 dark:border-white/20 
            bg-neutral-100 dark:bg-transparent
            text-neutral-700 dark:text-white
            hover:bg-neutral-200 dark:hover:bg-white/10 transition"
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
          className="rounded-full h-12 w-12 flex items-center justify-center 
          border border-neutral-300 dark:border-white/20 
          bg-neutral-100 dark:bg-transparent
          text-neutral-700 dark:text-white
          hover:bg-neutral-200 dark:hover:bg-white/10 transition"
        >
          <CircleQuestionMark className="size-5 text-neutral-700 dark:text-white" />
        </Button>

        <ThemeToggle />

        {/* 🔥 Avatar: always visible with fallback */}
        <Avatar className="size-12 ml-2 border border-neutral-300 dark:border-white/20 overflow-hidden">
          <AvatarImage
            src={avatarSrc || undefined}
            alt={me?.name ?? "Profile picture"}
            className="object-cover"
          />
          <AvatarFallback className="bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <User className="size-5 text-neutral-700 dark:text-white" />
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
