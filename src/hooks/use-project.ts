// src/hooks/use-project.ts
"use client";

import { useAppSelector, useAppDispatch } from "@/redux/store";
import {
  addProject,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
} from "@/redux/slice/projects";
import { toast } from "sonner";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Generate a simple gradient thumbnail SVG and return it as a data URL.
 * This is used as a placeholder preview for new projects.
 */
const generateGradientThumbnail = () => {
  const svgContent = `
    <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="150" cy="100" r="30" fill="white" opacity="0.8" />
      <path d="M140 90 L160 90 L160 110 L140 110 Z" fill="white" opacity="0.6" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};

export const useProjectCreation = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.profile);
  const projectsState = useAppSelector((state) => state.projects);

  /**
   * Create a new project for the current user.
   * Returns the newly created projectId on success, or null on failure.
   */
  const createProject = async (
    name?: string
  ): Promise<Id<"projects"> | null> => {
    if (!user?.id) {
      toast.error("Please sign in to create projects");
      return null;
    }

    dispatch(createProjectStart());

    try {
      // Generate thumbnail
      const thumbnail = generateGradientThumbnail();

      // Create project directly in Convex
      const result = await fetchMutation(api.projects.createProject, {
        userId: user.id as Id<"users">,
        name: name || undefined,
        // Start every new project with a clean, empty canvas.
        // We don't want to carry over shapes from the previously opened project.
        sketchesData: {
          shapes: {
            ids: [],
            entities: {},
          },
          tool: "select",
          selected: {},
          frameCounter: 0,
        },
        thumbnail,
      });

      // Add to Redux store immediately
      dispatch(
        addProject({
          _id: result.projectId,
          name: result.name,
          projectNumber: result.projectNumber,
          thumbnail,
          lastModified: Date.now(),
          createdAt: Date.now(),
          isPublic: false,
        })
      );

      dispatch(createProjectSuccess());
      toast.success("Project created successfully!");

      // ✅ Return the new project id so callers can navigate to it
      return result.projectId as Id<"projects">;
    } catch (err) {
      console.error("Failed to create project", err);
      dispatch(createProjectFailure("Failed to create project"));
      toast.error("Failed to create project");
      return null;
    }
  };

  return {
    createProject,
    isCreating: projectsState.isCreating,
    projects: projectsState.projects,
    projectsTotal: projectsState.total,
    canCreate: !!user?.id,
  };
};
