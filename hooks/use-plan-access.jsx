import { useAuth } from "@clerk/nextjs";

export function usePlanAccess() {
  const { has } = useAuth();

  const isPro = has?.({ plan: "pro" }) || false;

  const isFree = !isPro;

  const planAccess = {
    // Free plan tools
    resize: true,
    crop: true,
    adjusta: true,
    text: true,

    // Pro-only tools
    background: isPro,
    ai_extender: isPro,
    ai_edit: isPro,
  };

  // Helper function to check if user has access to a specific tool
  const hasAccess = (toolId) => {
    return planAccess[toolId] === true;
  };

  const getRestrictedTools = () => {
    return object
      .entries(planAccess)
      .filter(([_, hasAccess]) => !hasAccess)
      .map(([toolId]) => toolId);
  };

  const canCreateProject = (currentProjectCount) => {
    if (isPro) return true;
    return currentProjectCount < 3; // Free limit
  };

  const canExport = (currentExportsThisMonth) => {
    if (isPro) return true;
    return currentExportsThisMonth < 20;
  };

  return {
    userPlan: isPro ? "pro" : "free_user",
    isPro,
    isFree,
    hasAccess,
    planAccess,
    getRestrictedTools,
    canCreateProject,
    canExport,
  };
}
