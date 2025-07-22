import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import authAxios from "../authAxios/index";

const userContext = createContext();

export const AuthUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  useMemo(async () => {
    setUserLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await authAxios.get(`auth/users/${userData?.id}`);
      setUser(response.data);
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
