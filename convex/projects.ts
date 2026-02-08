/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    userId: v.id("users"),
    brandId: v.optional(v.id("brands")), // Optional brand association
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sketchesData: v.any(), // JSON structure from Redux shapes state
    thumbnail: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { userId, brandId, name, description, sketchesData, thumbnail }
  ) => {
    console.log("🚀 [Convex] Creating project for user:", userId);

    // Get next project number for auto-naming
    const projectNumber = await getNextProjectNumber(ctx, userId);
    const projectName = name || `Project ${projectNumber}`;

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      userId,
      brandId,
      name: projectName,
      description: description || undefined,
      sketchesData,
      thumbnail,
      projectNumber,
      lastModified: Date.now(),
      createdAt: Date.now(),
      isPublic: false,
      isArchived: false,
    });

    console.log("✅ [Convex] Project created:", {
      projectId,
      name: projectName,
      projectNumber,
    });

    return {
      projectId,
      name: projectName,
      projectNumber,
    };
  },
});

export const getUserProjects = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 20 }) => {
    const allProjects = await ctx.db
      .query("projects")
      .withIndex("by_userId_lastModified", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const projects = allProjects.slice(0, limit);

    return projects.map((project) => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      projectNumber: project.projectNumber,
      thumbnail: project.thumbnail,
      lastModified: project.lastModified,
      createdAt: project.createdAt,
      isPublic: project.isPublic,
      isArchived: project.isArchived ?? false,
      brandId: project.brandId,
    }));
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // If not logged in and the project isn't public, just return null instead of throwing.
    // This avoids "Not authenticated" errors in logs during sign-out or expired sessions.
    if (!userId && !project.isPublic) {
      return null;
    }

    // If logged in, enforce ownership/public visibility.
    if (userId && project.userId !== userId && !project.isPublic) {
      throw new Error("Access denied");
    }

    return project;
  },
});


export const getProjectStyleGuide = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // Check ownership or public access
    if (project.userId !== userId && !project.isPublic) {
      throw new Error("Access denied");
    }

    // Return parsed style guide data or null
    return project.styleGuide ? JSON.parse(project.styleGuide) : null;
  },
});


export const updateProjectSketches = mutation({
  args: {
    projectId: v.id("projects"),
    sketchesData: v.any(),
    viewportData: v.optional(v.any()),
  },
  handler: async (ctx, { projectId, sketchesData, viewportData }) => {
    console.log("💾 [Convex] Auto-saving project:", projectId);

    // Verify project exists
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // Prepare update data
    const updateData: any = {
      sketchesData,
      lastModified: Date.now(),
    };

    // Include viewport data if provided
    if (viewportData) {
      updateData.viewportData = viewportData;
    }

    // ✅ Optional guard: approximate size check WITHOUT Buffer
    // We just use the JSON string length as a rough proxy.
    const approxSize = JSON.stringify(updateData.sketchesData ?? {}).length;
    if (approxSize > 900_000) {
      console.warn(
        "[Convex] sketchesData too large to save (~",
        approxSize,
        "chars)"
      );
      throw new Error(
        "Canvas too large to autosave; try removing some generated UIs or start a new project."
      );
    }

    // Update sketches and viewport data
    await ctx.db.patch(projectId, updateData);

    console.log("✅ [Convex] Project auto-saved successfully");
    return { success: true };
  },
});


export const updateProjectStyleGuide = mutation({
  args: {
    projectId: v.id("projects"),
    styleGuideData: v.any(), // JSON structure for AI-generated style guide
  },
  handler: async (ctx, { projectId, styleGuideData }) => {
    console.log("🎨 [Convex] Updating project style guide:", projectId);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(projectId, {
      styleGuide: JSON.stringify(styleGuideData), // Store as JSON string
      lastModified: Date.now(),
    });

    console.log("✅ [Convex] Project style guide updated successfully");
    return { success: true, styleGuide: styleGuideData };
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    if (project.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(projectId);
    console.log("🗑️ [Convex] Project deleted:", projectId);

    return { success: true };
  },
});

export const archiveProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(projectId, {
      isArchived: true,
      lastModified: Date.now(),
    });

    console.log("dY-` [Convex] Project archived:", projectId);
    return { success: true };
  },
});

export const renameProject = mutation({
  args: { projectId: v.id("projects"), name: v.string() },
  handler: async (ctx, { projectId, name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== userId) throw new Error("Access denied");

    await ctx.db.patch(projectId, { name });
  },
});

async function getNextProjectNumber(ctx: any, userId: string): Promise<number> {
  // Get or create project counter for this user
  const counter = await ctx.db
    .query("project_counters")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!counter) {
    // Create new counter starting at 1
    await ctx.db.insert("project_counters", {
      userId,
      nextProjectNumber: 2, // Next will be 2
    });
    return 1;
  }

  const projectNumber = counter.nextProjectNumber;

  // Increment counter for next time
  await ctx.db.patch(counter._id, {
    nextProjectNumber: projectNumber + 1,
  });

  return projectNumber;
}
