import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Box,
  FormLabel,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import authAxios from "authAxios";
import PropTypes from "prop-types";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import { Visibility } from "@mui/icons-material";
import { VisibilityOff } from "@mui/icons-material";

// helper function for rules
const passwordSteps = [
  { label: "Need at least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Need at least one lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "Need at least one number", test: (pw) => /\d/.test(pw) },
  { label: "Need at least one special character (@$!%*?&)", test: (pw) => /[@$!%*?&]/.test(pw) },
  { label: "Must be at least 8 characters long", test: (pw) => pw.length >= 8 },
];

const getNextRequirement = (pw) => {
  for (let step of passwordSteps) {
    if (!step.test(pw)) return step.label;
  }
  return null;
};

const ChangePasswordModal = ({ open, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
              type={showOld ? "text" : "password"}
              fullWidth
              variant="standard"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowOld((prev) => !prev)} edge="end">
                      {showOld ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box mb={2}>
            <FormLabel>New Password</FormLabel>
            <TextField
              type={showNew ? "text" : "password"}
              fullWidth
              variant="standard"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((prev) => !prev)} edge="end">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={
                newPassword
                  ? getNextRequirement(newPassword) || "✅ Strong password"
                  : "Password must contain at least one letter, one number, and one special character"
              }
              FormHelperTextProps={{
                sx: {
                  color: getNextRequirement(newPassword) ? "error.main" : "success.main",
                },
              }}
            />
          </Box>

          <Box mb={2}>
            <FormLabel>Confirm Password</FormLabel>
            <TextField
              type={showConfirm ? "text" : "password"}
              fullWidth
              variant="standard"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                disableUnderline: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((prev) => !prev)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
