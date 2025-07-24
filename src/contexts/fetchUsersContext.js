import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import authAxios from "../authAxios/index";

const fetchUsersContext = createContext();

export const FetchUsersProvider = ({ children }) => {
  const [usersList, setUsersList] = useState(null);
  useMemo(async () => {
    try {
      const res = await authAxios.get("/auth/users");
      setUsersList(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);
  return (
    <fetchUsersContext.Provider value={{ setUsersList, usersList }}>
      {children}
    </fetchUsersContext.Provider>
  );
};

// Hook for consuming the context
export const useFetchUsers = () => useContext(fetchUsersContext);
FetchUsersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
