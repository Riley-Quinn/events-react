// import { useAbility } from "contexts/AbilityContext";
// Map route keys to CASL subjects and actions

// const routePermissionMap = {
//   dashboard: { action: "manage", subject: "User" },
//   users: { action: "manage", subject: "User" },
//   "manage-roles": { action: "modify", subject: "User" },
//   "manage-permissions": { action: "modify", subject: "Permission" },
//   categories: { action: "modify", subject: "Permission" },
//   tasks: { action: "modify", subject: "Permission" },
//   "press-release": { action: "modify", subject: "Permission" },
//   birthdays: { action: "modify", subject: "Permission" },
//   "special-days": { action: "modify", subject: "Permission" },
//   events: { action: "modify", subject: "Permission" },
// };

export function filterRoutesByPermission(routes, ability, permissions) {
  return routes.filter((route) => {
    if (route.type !== "collapse") return true; // Allow non-menu routes

    const permission = permissions?.find((item) => item.resource === route.name);
    if (!permission) return true; // Allow routes not mapped to permissions
    console.log("permission", permission);
    return ability.can(permission?.actions[0], route.name);
  });
}
