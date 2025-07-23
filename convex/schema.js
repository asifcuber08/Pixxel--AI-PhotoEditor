import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),

    plan: v.union(v.literal("free"), v.literal("pro")),

    // Usage tracking for plan limits
    projectsUsed: v.number(), //Current project count
    exportsThisMonth: v.number(), //Monthly export limit tracking

    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" }) // User search
    .searchIndex("search_email", { searchField: "email" }),

  projects: defineTable({
    //Basic project info
    title: v.string(),
    userId: v.id("users"),

    // Canvas dimensions and state
    canvasState: v.any(), // Fabric.js canvas JSON (objects, layers, etc.)
    width: v.number(), // Canvas width in pixels
    height: v.number(), // Canvas height in pixels

    // Image pipeline - tracks image transformations
    originalImageUrl: v.optional(v.string()), // Initial uploaded image
    currentImageUrl: v.optional(v.string()), // Current processed image
    thumbnailUrl: v.optional(v.string()), // HW - SMALL PREVIES FOR DASHBOARD

    // ImatgeKit transformation state
    activeTransformations: v.optional(v.string()), // Current ImageKit URL params

    // AI features state - tracks what AI processing has been applied
    backgroundRemoved: v.optional(v.boolean()), // Has background been removed

    // Organization
    folderId: v.optional(v.id("folders")), // HW - Optional folder organization

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(), // Last edit time
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_folder", ["folderId"]), // Projects in folder

    folders: defineTable({
      name: v.string(), // Folder name
      userId: v.id("users"), // Owner
      createdAt: v.number(),
    }).index("by_user", ["userId"]), // User's folders
});
