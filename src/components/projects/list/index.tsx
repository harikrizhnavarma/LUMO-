/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useProjectCreation } from "@/hooks/use-project";
import { CreateProject } from "@/components/buttons/project";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBrandsContext } from "./provider";

type Project = {
  _id: string;
  name: string;
  thumbnail?: string;
  lastModified: number;
  createdAt: number;
  isPublic?: boolean;
  brandId?: string | null;
};

type ProjectsListProps = {
  initialProjects?: Project[];
};

export const ProjectsList: React.FC<ProjectsListProps> = ({
  initialProjects = [],
}) => {
  const router = useRouter();
  const { projects } = useProjectCreation();
  const { brands } = useBrandsContext();

  const [localProjects, setLocalProjects] =
    useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const deleteProjectMutation = useMutation(api.projects.deleteProject);
  const renameProjectMutation = useMutation(api.projects.renameProject);
  const assignProjectToBrand = useMutation(api.brands.assignProjectToBrand);

  useEffect(() => {
    if (projects && projects.length) {
      setLocalProjects(projects as any);
    }
  }, [projects]);

  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/account/canvas?project=${projectId}`);
  };

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const selectedProject = useMemo(
    () => localProjects.find((p) => p._id === selectedProjectId),
    [selectedProjectId, localProjects],
  );

  const openRenameDialog = (projectId: string, currentName: string) => {
    setEditingProjectId(projectId);
    setEditName(currentName);
    setEditOpen(true);
  };

  const handleRenameConfirm = async () => {
    const trimmed = editName.trim();

    if (!editingProjectId) {
      toast.error("No project selected");
      return;
    }

    if (!trimmed) {
      toast.error("Project name cannot be empty");
      return;
    }

    const nameRegex = /^[\w\s\-]+$/; // Letters, numbers, spaces, underscores, hyphens
    if (!nameRegex.test(trimmed)) {
      toast.error(
        "Project name can only contain letters, numbers, spaces, underscores, and hyphens",
      );
      return;
    }

    setEditLoading(true);

    try {
      await renameProjectMutation({
        projectId: editingProjectId as any,
        name: trimmed,
      });

      setLocalProjects((prev) =>
        prev.map((p) =>
          p._id === editingProjectId ? { ...p, name: trimmed } : p,
        ),
      );

      toast.success("Project renamed");
      setEditOpen(false);
      setEditingProjectId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename project");
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteDialog = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProjectId) {
      toast.error("No project selected");
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteProjectMutation({ projectId: selectedProjectId as any });

      setLocalProjects((prev) =>
        prev.filter((p) => p._id !== selectedProjectId),
      );

      toast.success("Project deleted");
      setDeleteDialogOpen(false);
      setSelectedProjectId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBrandChange = async (project: Project, brandId: string) => {
    try {
      await assignProjectToBrand({
        projectId: project._id as any,
        // if empty string, clear the brand
        brandId: brandId ? (brandId as any) : undefined,
      });

      setLocalProjects((prev) =>
        prev.map((p) =>
          p._id === project._id ? { ...p, brandId: brandId || null } : p,
        ),
      );
      toast.success("Brand updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update brand");
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Your Projects</h2>
          <p className="text-sm text-muted-foreground">
            Start a new project or continue where you left off.
          </p>
        </div>

        {/* ⬅️ Brought back: top-right "+ New Project" button */}
        <CreateProject />
      </div>

      {localProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any projects yet.
          </p>
          {/* Empty state uses the CreateProject popup */}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localProjects.map((project) => {
            const projectBrand =
              brands?.find((b: any) => b._id === project.brandId) ?? null;

            return (
              <div
                key={project._id}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card"
              >
                <button
                  type="button"
                  onClick={() => handleProjectClick(project._id)}
                  className="flex-1"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {project.thumbnail ? (
                      <Image
                        src={project.thumbnail}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background">
                        <span className="text-xs font-medium text-muted-foreground">
                          No preview available
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/60 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </div>

                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {project.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Updated {formatDate(project.lastModified)}
                        </p>
                      </div>
                    </div>

                    {brands && brands.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border bg-background px-2 py-1 text-[11px] text-muted-foreground">
                          <Plus className="mr-1 h-3 w-3" />
                          Assign brand
                        </span>
                        <select
                          className="h-8 min-w-[120px] rounded-md border bg-background px-2 text-xs text-foreground"
                          value={projectBrand?._id ?? ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleBrandChange(project, e.target.value)
                          }
                        >
                          <option value="">None</option>
                          {brands.map((brand: any) => (
                            <option key={brand._id} value={brand._id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </button>

                <div className="absolute right-2 top-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 rounded-xl border bg-popover/95 backdrop-blur-md"
                    >
                      <DropdownMenuLabel>Project actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameDialog(project._id, project.name);
                        }}
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(project._id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/account/canvas?project=${project._id}`}
                        >
                          Open in canvas
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Give your project a new name. This won&apos;t affect your data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Project name"
              autoFocus
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  setEditingProjectId(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRenameConfirm} disabled={editLoading}>
                {editLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedProjectId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
