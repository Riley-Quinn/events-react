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
import authAxios from "authAxios";
import PropTypes from "prop-types";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const ChangePasswordModal = ({ open, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { fetchSuccess, fetchError } = useSnackbar();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      fetchError("Passwords do not match");
      return;
    }

    try {
      await authAxios.put("/auth/change-password", { oldPassword, newPassword });

      fetchSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password";
      fetchError(msg);
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
              InputProps={{ disableUnderline: true }}
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
              InputProps={{ disableUnderline: true }}
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
              InputProps={{ disableUnderline: true }}
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
    </>
  );
};

ChangePasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ChangePasswordModal;
