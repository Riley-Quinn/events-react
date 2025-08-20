import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  FormLabel,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import axios from "axios";
import PropTypes from "prop-types";

const ChangePasswordModal = ({ open, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match", severity: "error" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:4000/api/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbar({ open: true, message: "Password updated successfully!", severity: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update password",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle
          className="add-usr-button"
          sx={{
            textAlign: "center",
          }}
        >
          Password
        </DialogTitle>

        <DialogContent dividers sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <LockIcon sx={{ fontSize: 48, color: "#0078d7" }} />
          </Box>

          <Box mb={2}>
            <FormLabel>Current Password</FormLabel>
            <TextField
              type="password"
              fullWidth
              variant="standard"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Box>

          <Box mb={2}>
            <FormLabel>New Password</FormLabel>
            <TextField
              type="password"
              fullWidth
              variant="standard"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Box>

          <Box mb={2}>
            <FormLabel>Confirm Password</FormLabel>
            <TextField
              type="password"
              fullWidth
              variant="standard"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleSubmit} variant="gradient" className="add-usr-button">
            Update
          </Button>
          <Button onClick={onClose} variant="gradient" className="cancel-button">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

ChangePasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ChangePasswordModal;
