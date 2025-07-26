import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import authAxios from "../authAxios/index";

const userContext = createContext();
const staticPermissions = {
  "Super Admin": [
    {
      resource: "all",
      actions: ["read"],
    },
  ],
  "Org Admin": [
    {
      resource: "all",
      actions: ["manage"],
    },
  ],
  "Event Manager": [
    { resource: "Dashboard", actions: ["read"] },
    { resource: "Tasks", actions: ["read"] },
  ],
  "Media Contributor": [
    { resource: "Dashboard", actions: ["read"] },
    { resource: "Press Release", actions: ["read"] },
  ],
  "Field Volunteer": [
    { resource: "Dashboard", actions: ["read"] },
    { resource: "Tasks", actions: ["read"] },
  ],
  "Public Viewer": [
    { resource: "Dashboard", actions: ["read"] },
    { resource: "Tasks", actions: ["read"] },
  ],
};
export const AuthUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  useMemo(async () => {
    setUserLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await authAxios.get(`auth/users/${userData?.id}`);
      localStorage.setItem("role_name", response?.data?.role_name);
      localStorage.setItem(
        "userPermission",
        JSON.stringify(staticPermissions[response?.data?.role_name])
      );
      setUser({ ...response.data, permissions: staticPermissions[response?.data?.role_name] });
      setUserLoading(false);
    } catch (error) {
      setUserLoading(false);
      console.error("Unable to get users", error);
    }
  }, []);
  return (
    <userContext.Provider value={{ user, setUser, userLoading }}>{children}</userContext.Provider>
  );
};

// Hook for consuming the context
export const useAuthUser = () => useContext(userContext);
AuthUserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
