import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),

    plan:v.union(v.literal("free"), v.literal("pro")),

    // Usage tracking for plan limits
    projectsUsed: v.number(), //Current project count
    exportsThisMonth: v.number(), //Monthly export limit tracking

    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" }) // User search
    .searchIndex("search_email", { searchField: "email" })
});
