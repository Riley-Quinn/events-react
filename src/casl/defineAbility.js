import { AbilityBuilder } from "@casl/ability";

export function defineAbilityFor(permissions) {
  const { can, rules } = new AbilityBuilder();

  permissions.forEach(({ action, subject }) => {
    can(action, subject);

    // Optional: simulate inheritance
    if (action === "manage") {
      can("add", subject);
      can("view", subject);
      can("delete", subject);
      can("edit", subject);
    }
  });

  return rules;
}
