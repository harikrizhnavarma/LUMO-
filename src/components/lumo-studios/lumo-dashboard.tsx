"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { combinedSlug } from "@/lib/utils";
import { useProjectCreation } from "@/hooks/use-project";
import { useAppDispatch } from "@/redux/store";
import { updateProject, removeProject } from "@/redux/slice/projects";
import { ProfileCard } from "./profile-card";
import { GridIcon, LibraryIcon, CodeBoxIcon, SparklesIcon } from "./icons";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export type LumoProject = {
  _id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  lastModified: number;
  createdAt: number;
  isArchived?: boolean;
};

export type LumoUserProfile = {
  name?: string;
  email?: string;
  image?: string;
};

type LumoDashboardProps = {
  projects: LumoProject[];
  profile: LumoUserProfile | null;
};

type TabType = "projects" | "archives" | "assets" | "studio";

type LocalProfile = {
  name: string;
  handle: string;
  title: string;
  avatarUrl: string;
  privacy: string;
  syncMode: string;
  color: string;
  customHex: string;
};

const LOCAL_PROFILE_KEY = "lumo_core_profile";

const defaultProfile = (profile: LumoUserProfile | null): LocalProfile => {
  const name = profile?.name || profile?.email || "Lumo Architect";
  const handle = name.toLowerCase().replace(/\s+/g, "_");
  return {
    name,
    handle,
    title: "Interface Specialist",
    avatarUrl:
      profile?.image ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
        name
      )}`,
    privacy: "Public",
    syncMode: "Real-time",
    color: "gradient-1",
    customHex: "#ff3e00",
  };
};

export const LumoDashboard = ({ projects, profile }: LumoDashboardProps) => {
  const router = useRouter();
  const { handleSignOut } = useAuth();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const dispatch = useAppDispatch();
  const { createProject, isCreating, projects: localProjects } =
    useProjectCreation();
  const studioProfile = useQuery(api.studioProfiles.getStudioProfile);
  const upsertStudioProfile = useMutation(
    api.studioProfiles.upsertStudioProfile
  );
  const archiveProject = useMutation(api.projects.archiveProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "archive" | "delete";
    project: LumoProject;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [projectOverrides, setProjectOverrides] = useState<
    Record<string, { isArchived?: boolean; isDeleted?: boolean }>
  >({});
  const [visibleCount, setVisibleCount] = useState(3);
  const [localProfile, setLocalProfile] = useState<LocalProfile>(
    defaultProfile(profile)
  );
  const normalizedProjects = useMemo(
    () => (Array.isArray(projects) ? projects : []),
    [projects]
  );
  const mergedProjects = useMemo(() => {
    const projectMap = new Map<string, LumoProject>();
    normalizedProjects.forEach((project) => {
      projectMap.set(project._id, project);
    });
    if (Array.isArray(localProjects)) {
      localProjects.forEach((project) => {
        projectMap.set(project._id, project as LumoProject);
      });
    }
    return Array.from(projectMap.values()).sort(
      (a, b) => b.lastModified - a.lastModified
    );
  }, [normalizedProjects, localProjects]);
  const effectiveProjects = useMemo(() => {
    return mergedProjects
      .map((project) => {
        const override = projectOverrides[project._id];
        return override ? { ...project, ...override } : project;
      })
      .filter((project) => !projectOverrides[project._id]?.isDeleted);
  }, [mergedProjects, projectOverrides]);
  const activeProjects = useMemo(
    () => effectiveProjects.filter((project) => !project.isArchived),
    [effectiveProjects]
  );
  const archivedProjects = useMemo(
    () => effectiveProjects.filter((project) => project.isArchived),
    [effectiveProjects]
  );
  const visibleProjects = useMemo(
    () => activeProjects.slice(0, visibleCount),
    [activeProjects, visibleCount]
  );
  const canShowMore = visibleProjects.length < activeProjects.length;

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && studioProfile === null) {
      router.replace("/onboarding");
    }
  }, [isAuthLoading, isAuthenticated, studioProfile, router]);

  if (
    isAuthLoading ||
    studioProfile === undefined ||
    (!isAuthLoading && isAuthenticated && studioProfile === null)
  ) {
    return null;
  }

  useEffect(() => {
    if (studioProfile) {
      setLocalProfile((prev) => ({
        ...prev,
        name: studioProfile.name ?? prev.name,
        handle: studioProfile.handle ?? prev.handle,
        title: studioProfile.title ?? prev.title,
        avatarUrl: studioProfile.avatarUrl ?? prev.avatarUrl,
        privacy: studioProfile.privacy ?? prev.privacy,
        syncMode: studioProfile.syncMode ?? prev.syncMode,
        color: studioProfile.color ?? prev.color,
        customHex: studioProfile.customHex ?? prev.customHex,
      }));
      return;
    }

    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LOCAL_PROFILE_KEY);
    if (stored) {
      try {
        setLocalProfile((prev) => ({ ...prev, ...JSON.parse(stored) }));
        return;
      } catch {
        setLocalProfile(defaultProfile(profile));
        return;
      }
    }

    setLocalProfile(defaultProfile(profile));
  }, [profile, studioProfile]);

  const profileSlug = useMemo(
    () => combinedSlug(localProfile.name),
    [localProfile.name]
  );

  useEffect(() => {
    if (activeTab === "projects") {
      setVisibleCount(3);
    }
  }, [activeTab]);

  const handleCreateProject = async () => {
    const trimmedName = projectName.trim();
    const trimmedDescription = projectDescription.trim();
    const newId = await createProject(
      trimmedName || undefined,
      trimmedDescription || undefined
    );
    if (newId) {
      setIsCreateOpen(false);
      setProjectName("");
      setProjectDescription("");
      router.push(`/dashboard/${profileSlug}/canvas?project=${newId}`);
    }
  };

  const handleOpenCreate = () => {
    if (isCreating) return;
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (isCreating) return;
    setIsCreateOpen(false);
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/dashboard/${profileSlug}/canvas?project=${projectId}`);
  };

  const requestArchive = (project: LumoProject) => {
    setConfirmAction({ type: "archive", project });
  };

  const requestDelete = (project: LumoProject) => {
    setConfirmAction({ type: "delete", project });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, project } = confirmAction;
    setActionLoading(true);
    try {
      if (type === "archive") {
        await archiveProject({ projectId: project._id as any });
        setProjectOverrides((prev) => ({
          ...prev,
          [project._id]: { ...prev[project._id], isArchived: true },
        }));
        dispatch(updateProject({ _id: project._id, isArchived: true }));
        toast.success("Project archived");
      } else {
        await deleteProject({ projectId: project._id as any });
        setProjectOverrides((prev) => ({
          ...prev,
          [project._id]: { ...prev[project._id], isDeleted: true },
        }));
        dispatch(removeProject(project._id));
        toast.success("Project deleted");
      }
    } catch (error) {
      console.error(error);
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await upsertStudioProfile({
        name: localProfile.name,
        handle: localProfile.handle,
        title: localProfile.title,
        avatarUrl: localProfile.avatarUrl,
        privacy: localProfile.privacy,
        syncMode: localProfile.syncMode,
        color: localProfile.color,
        customHex: localProfile.customHex,
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          LOCAL_PROFILE_KEY,
          JSON.stringify(localProfile)
        );
      }

      toast.success("Profile saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="pd-prism-shell fade-in">
      <div className="grid-master" />
      <div className="float-blob pd-blob" />

      <aside className="pd-prism-sidebar">
        <div className="pd-prism-logo" onClick={() => setActiveTab("projects")}>
          <div className="logo-box small" />
          LUMO
        </div>

        <nav className="pd-prism-nav">
          <button
            className={`pd-nav-item-prism ${
              activeTab === "projects" ? "active" : ""
            }`}
            onClick={() => setActiveTab("projects")}
          >
            <GridIcon /> <span>DASHBOARD</span>
          </button>
          <button
            className={`pd-nav-item-prism ${
              activeTab === "archives" ? "active" : ""
            }`}
            onClick={() => setActiveTab("archives")}
          >
            <LibraryIcon /> <span>VAULT</span>
          </button>
          <button
            className={`pd-nav-item-prism ${
              activeTab === "assets" ? "active" : ""
            }`}
            onClick={() => setActiveTab("assets")}
          >
            <CodeBoxIcon /> <span>ASSETS</span>
          </button>
          <button
            className={`pd-nav-item-prism ${
              activeTab === "studio" ? "active" : ""
            }`}
            onClick={() => setActiveTab("studio")}
          >
            <SparklesIcon /> <span>STUDIO</span>
          </button>
        </nav>

        <button
          className="pd-nav-item-prism pd-logout"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut className="h-4 w-4" /> <span>LOG OUT</span>
        </button>

        <div className="pd-registration-marks">
          <div className="reg-dot" style={{ background: "var(--primary)" }} />
          <div className="reg-dot" style={{ background: "var(--secondary)" }} />
          <div className="reg-dot" style={{ background: "var(--tertiary)" }} />
        </div>
      </aside>

      <main className="pd-prism-main">
        <header className="pd-prism-header">
          <div className="pd-header-context">
            <span className="pd-tagline">
              ARCHITECT_SPACE // {localProfile.handle.toUpperCase()}
            </span>
            <h1 className="pd-view-title">{activeTab.toUpperCase()}_STRATUM</h1>
          </div>
          <button
            className="cta-btn-prism pd-create-btn"
            onClick={handleOpenCreate}
            disabled={isCreating}
          >
            {isCreating ? "CREATING..." : "NEW_SEQUENCE +"}
          </button>
        </header>

        <section className="pd-prism-hero">
          <div className="pd-hero-profile-mount">
            <ProfileCard
              name={localProfile.name}
              handle={localProfile.handle}
              title={localProfile.title}
              avatarUrl={localProfile.avatarUrl}
              innerGradient="linear-gradient(135deg, #e76f51 0%, #e9c46a 100%)"
              behindGlowColor="#e76f51"
              enableTilt
              showUserInfo
              className="pd-hero-card"
            />
          </div>

          <div className="pd-hero-stats-prism">
            <div className="pd-stat-prism">
              <span className="stat-label">PROJECTS</span>
              <div className="stat-value">{activeProjects.length}</div>
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
          {activeTab === "projects" && (
            <div className="pd-prism-grid fade-in">
              {activeProjects.length === 0 ? (
                <div className="pd-prism-empty">
                  <div className="pd-feature-card-prism">
                    <span className="card-num">00 // VOID</span>
                    <h3 className="card-title">Grid idle.</h3>
                    <p>No active projects detected in this sector.</p>
                    <button
                      className="cta-btn-prism"
                      style={{ marginTop: "20px" }}
                      onClick={handleOpenCreate}
                    >
                      INITIALIZE_SEQUENCE
                    </button>
                  </div>
                </div>
              ) : (
                visibleProjects.map((project, idx) => (
                  <div
                    key={project._id}
                    className={`pd-prism-card feature-card-prism ${
                      idx % 3 === 1 ? "cyan" : idx % 3 === 2 ? "yellow" : ""
                    }`}
                    onClick={() => handleOpenProject(project._id)}
                  >
                    <div className="pd-card-glow" />
                    <div
                      className="pd-card-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="pd-card-action"
                        onClick={() => requestArchive(project)}
                      >
                        ARCHIVE
                      </button>
                      <button
                        type="button"
                        className="pd-card-action danger"
                        onClick={() => requestDelete(project)}
                      >
                        DELETE
                      </button>
                    </div>
                    <span className="card-num">
                      SEQ_{project._id.slice(0, 4).toUpperCase()}
                    </span>
                    <h3 className="card-title">{project.name}</h3>
                    {project.description ? (
                      <p className="pd-card-desc">{project.description}</p>
                    ) : (
                      <p className="pd-card-desc pd-card-desc-muted">
                        NO_DESCRIPTION
                      </p>
                    )}
                    <p>
                      UPDATED:{" "}
                      {new Date(project.lastModified).toLocaleDateString()}
                    </p>
                    <div className="pd-card-footer">
                      <span className="pd-node-count">OPEN PROJECT</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === "projects" && activeProjects.length > 0 && (
            <div className="pd-prism-more">
              <button
                className="secondary-cta-prism"
                onClick={() => setVisibleCount((count) => count + 3)}
                disabled={!canShowMore}
              >
                {canShowMore ? "MORE+" : "NO_MORE"}
              </button>
            </div>
          )}

          {activeTab === "assets" && (
            <div className="pd-prism-stack fade-in">
              <div className="pd-prism-row">
                <div className="pd-row-details">
                  <span className="pd-row-tag">ASSET REGISTRY</span>
                  <h4>No assets collected yet.</h4>
                </div>
              </div>
            </div>
          )}

          {activeTab === "archives" && (
            <div className="pd-prism-stack fade-in">
              {archivedProjects.length === 0 ? (
                <div className="pd-prism-row">
                  <div className="pd-row-details">
                    <span className="pd-row-tag">VAULT</span>
                    <h4>No archived projects yet.</h4>
                  </div>
                </div>
              ) : (
                archivedProjects.map((project) => (
                  <div
                    key={project._id}
                    className="pd-prism-row pd-vault-card"
                    onClick={() => handleOpenProject(project._id)}
                  >
                    <div className="pd-row-details">
                      <span className="pd-row-tag">
                        SEQ_{project._id.slice(0, 4).toUpperCase()}
                      </span>
                      <h4>{project.name}</h4>
                      <p className="pd-card-desc">
                        {project.description || "NO_DESCRIPTION"}
                      </p>
                    </div>
                    <div className="pd-row-actions">
                      <button
                        type="button"
                        className="pd-card-action danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          requestDelete(project);
                        }}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "studio" && (
            <div className="pd-prism-studio fade-in">
              <form className="pd-studio-form-prism" onSubmit={handleSaveProfile}>
                <div className="pd-input-grid-prism">
                  <div className="pd-field-prism">
                    <label>ARCHITECT_IDENTITY</label>
                    <input
                      type="text"
                      value={localProfile.name}
                      onChange={(e) =>
                        setLocalProfile({ ...localProfile, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="pd-field-prism">
                    <label>NODE_HANDLE</label>
                    <input
                      type="text"
                      value={localProfile.handle}
                      onChange={(e) =>
                        setLocalProfile({
                          ...localProfile,
                          handle: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="pd-field-prism">
                    <label>SPECIALIZATION_CORE</label>
                    <input
                      type="text"
                      value={localProfile.title}
                      onChange={(e) =>
                        setLocalProfile({ ...localProfile, title: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="pd-studio-actions">
                  <button type="submit" className="cta-btn-prism">
                    SAVE_STRATUM_SPEC
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <footer className="pd-prism-footer">
          <div className="registration-marks">
            <div className="reg-dot" style={{ background: "var(--primary)" }} />
            <div className="reg-dot" style={{ background: "var(--secondary)" }} />
            <div className="reg-dot" style={{ background: "var(--tertiary)" }} />
          </div>
          <span className="pd-status-text">
            SYSTEM_NOMINAL // GRID_SYNC_STABLE
          </span>
        </footer>
      </main>

      {isCreateOpen && (
        <div className="pd-modal-overlay" onClick={handleCloseCreate}>
          <div
            className="pd-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-modal-header">
              <div>
                <span className="pd-modal-kicker">PROJECT_INIT</span>
                <h2 className="pd-modal-title">Define the sequence core.</h2>
                <p className="pd-modal-sub">
                  Set a project name and an optional description before entering
                  the canvas.
                </p>
              </div>
              <button
                className="pd-modal-close"
                onClick={handleCloseCreate}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="pd-modal-body">
              <label className="pd-modal-field">
                <span>PROJECT_NAME</span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Lumo Sequence Alpha"
                  autoFocus
                  required
                />
              </label>
              <label className="pd-modal-field">
                <span>DESCRIPTION (OPTIONAL)</span>
                <textarea
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  placeholder="Outline the mission, deliverables, or style direction."
                  rows={4}
                />
              </label>
            </div>

            <div className="pd-modal-actions">
              <button
                className="secondary-cta-prism"
                onClick={handleCloseCreate}
                type="button"
                disabled={isCreating}
              >
                CANCEL
              </button>
              <button
                className="cta-btn-prism"
                onClick={handleCreateProject}
                disabled={isCreating || projectName.trim().length === 0}
                type="button"
              >
                {isCreating ? "INITIALIZING..." : "ENTER_CANVAS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          className="pd-modal-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="pd-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-modal-header">
              <div>
                <span className="pd-modal-kicker">SESSION_END</span>
                <h2 className="pd-modal-title">Log out of Lumo?</h2>
                <p className="pd-modal-sub">
                  You will return to the Lumo Studios home page.
                </p>
              </div>
              <button
                className="pd-modal-close"
                onClick={() => setShowLogoutConfirm(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="pd-modal-actions">
              <button
                className="secondary-cta-prism"
                onClick={() => setShowLogoutConfirm(false)}
                type="button"
              >
                STAY
              </button>
              <button
                className="cta-btn-prism"
                onClick={() => handleSignOut("/")}
                type="button"
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          className="pd-modal-overlay"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="pd-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-modal-header">
              <div>
                <span className="pd-modal-kicker">
                  {confirmAction.type === "archive"
                    ? "ARCHIVE_PROJECT"
                    : "DELETE_PROJECT"}
                </span>
                <h2 className="pd-modal-title">
                  {confirmAction.type === "archive"
                    ? "Archive this project?"
                    : "Delete this project?"}
                </h2>
                <p className="pd-modal-sub">
                  {confirmAction.type === "archive"
                    ? "It will move to the vault and disappear from the dashboard."
                    : "This action is permanent and cannot be undone."}
                </p>
              </div>
              <button
                className="pd-modal-close"
                onClick={() => setConfirmAction(null)}
                type="button"
              >
                バ
              </button>
            </div>

            <div className="pd-modal-actions">
              <button
                className="secondary-cta-prism"
                onClick={() => setConfirmAction(null)}
                type="button"
                disabled={actionLoading}
              >
                CANCEL
              </button>
              <button
                className="cta-btn-prism"
                onClick={handleConfirmAction}
                type="button"
                disabled={actionLoading}
              >
                {actionLoading
                  ? "PROCESSING..."
                  : confirmAction.type === "archive"
                    ? "ARCHIVE"
                    : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
