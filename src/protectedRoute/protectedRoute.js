// import React from "react";
// import { Navigate } from "react-router-dom";
// import PropTypes from "prop-types";

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/authentication/sign-in" replace />;
//   }

//   return children;
// };

// ProtectedRoute.propTypes = {
//   children: PropTypes.node.isRequired,
// };

import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAbility } from "../contexts/AbilityContext";
import NoWebAccess from "../NoWebAccessPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const ability = useAbility();

  if (!token) {
    return <Navigate to="/authentication/sign-in" replace />;
  }
  if (ability.can("view", "Media") || ability.can("view", "Media")) {
    return children; // Allow web access
  }
  return <NoWebAccess />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
