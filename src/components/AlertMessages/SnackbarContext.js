/* eslint-disable react/prop-types */
import React, { createContext, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success"); // Default severity

  const fetchSuccess = (message) => {
    setMessage(message);
    setSeverity("success");
    setOpenSnackbar(true);
  };

  // const fetchError = (error) => {
  //   if (error.response && error.response.data && error.response.data.error) {
  //     setMessage(error.response.data.error)
  //   } else {
  //     setMessage('An error occurred')
  //   }
  //   setSeverity('error')
  //   setOpenSnackbar(true)
  // }

  const fetchError = (message) => {
    setMessage(message);
    setSeverity("error");
    setOpenSnackbar(true);
  };

  const closeSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <SnackbarContext.Provider value={{ fetchSuccess, fetchError }}>
      {children}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MuiAlert
          onClose={closeSnackbar}
          severity={severity}
          sx={{
            backgroundColor: severity === "success" ? "#388e3c" : "#d32f2f",
            color: "#fff",
          }}
        >
          {message}
        </MuiAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
