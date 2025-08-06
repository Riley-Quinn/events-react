import { useAbility } from "contexts/AbilityContext";
// Map route keys to CASL subjects and actions

const routePermissionMap = {
  dashboard: { action: "manage", subject: "User" },
  users: { action: "manage", subject: "User" },
  "manage-roles": { action: "modify", subject: "User" },
  "manage-permissions": { action: "modify", subject: "Permission" },
  categories: { action: "modify", subject: "Permission" },
  "sub-categories": { action: "modify", subject: "Permission" },
  tasks: { action: "view", subject: "Media" },
  "press-release": { action: "view", subject: "Media" },
  birthdays: { action: "modify", subject: "Permission" },
  "special-days": { action: "modify", subject: "Permission" },
  events: { action: "modify", subject: "Permission" },
};

export function filterRoutesByPermission(routes, ability) {
  return routes.filter((route) => {
    if (route.type !== "collapse") return true; // Allow non-menu routes

    const permission = routePermissionMap[route.key];
    if (!permission) return true; // Allow routes not mapped to permissions

    return ability.can(permission.action, permission.subject);
  });
}
