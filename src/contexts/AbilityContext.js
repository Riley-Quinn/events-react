// /* eslint-disable react/prop-types */
import React, { createContext, useContext, useEffect, useState } from "react";
import { createMongoAbility } from "@casl/ability";
import PropTypes from "prop-types";
import { defineAbilitiesFor } from "./ability";

export const AbilityContext = createContext();
export const ability = createMongoAbility();
// const rolePermissions = [
//   {
//     role: "Super Admin",
//     permissions: [
//       {
//         resource: "all",
//         actions: ["read"],
//       },
//     ],
//   },
//   {
//     role: "Org Admin",
//     permissions: [
//       {
//         resource: "all",
//         actions: ["manage"],
//       },
//     ],
//   },
//   {
//     role: "Event Manager",
//     permissions: [
//       { resource: "Dashboard", actions: ["read"] },
//       { resource: "Tasks", actions: ["read"] },
//     ],
//   },
//   {
//     role: "Media Contributor",
//     permissions: [
//       { resource: "Dashboard", actions: ["read"] },
//       { resource: "Press Release", actions: ["read"] },
//     ],
//   },
//   {
//     role: "Field Volunteer",
//     permissions: [
//       { resource: "Dashboard", actions: ["read"] },
//       { resource: "Tasks", actions: ["read"] },
//     ],
//   },
//   {
//     role: "Public Viewer",
//     permissions: [
//       { resource: "Dashboard", actions: ["read"] },
//       { resource: "Tasks", actions: ["read"] },
//     ],
//   },
// ];

export function AbilityProvider({ permissions, children }) {
  const userRole = localStorage.getItem("role_name");
  const rolePermissions = localStorage.getItem("userPermission");
  const ability = defineAbilitiesFor(userRole, JSON.parse(rolePermissions));

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
AbilityProvider.propTypes = {
  permissions: PropTypes.object,
  children: PropTypes.node,
};
export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility must be used within AbilityProvider");
  }
  return ability;
}
