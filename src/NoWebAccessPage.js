// src/layouts/NoWebAccess.jsx

import React from "react";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton"; // Use your project button component
import axios from "axios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const NoWebAccess = () => {
  const { fetchSuccess, fetchError } = useSnackbar();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("permissions");
      localStorage.removeItem("user");

      fetchSuccess(res?.data?.message || "Logged out successfully");

      window.location.href = "/authentication/sign-in";
    } catch (err) {
      fetchError(err?.response?.data?.message || "Logout failed");

      localStorage.clear();

      window.location.href = "/authentication/sign-in";
    }
  };

  return (
    <SoftBox
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      textAlign="center"
      px={2}
    >
      <SoftTypography variant="h4" color="error" mb={2}>
        Access Denied
      </SoftTypography>
      <SoftTypography variant="body1" mb={4}>
        You do not have access to the web dashboard. Please use the mobile app.
      </SoftTypography>

      <SoftButton color="warning" variant="contained" onClick={handleLogout}>
        Logout
      </SoftButton>
    </SoftBox>
  );
};

export default NoWebAccess;
