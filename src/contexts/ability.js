import { AbilityBuilder, createMongoAbility } from "@casl/ability";
export function defineAbilitiesFor(role, rolePermission) {
  console.log("role", role);
  const { can, build } = new AbilityBuilder(createMongoAbility);

  // Find the permissions for the given role
  // const rolePermissionsData = rolePermissions?.find((perm) => perm?.role === role);
  console.log("rolePermissionsData", rolePermission);
  if (rolePermission) {
    rolePermission?.forEach((perm) => {
      perm?.actions?.forEach((action) => {
        can(action, perm?.resource);
      });
    });
  }

  return build();
}
