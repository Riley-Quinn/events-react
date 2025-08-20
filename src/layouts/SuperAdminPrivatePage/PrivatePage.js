// PrivatePage.js

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const PrivatePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [drafts, setDrafts] = useState([]);

  // Fetch drafts from backend
  const fetchDrafts = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/drafts");
      const data = await response.json();
      if (response.ok) {
        setDrafts(data);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error fetching drafts",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Server error:", error);
      setSnackbar({ open: true, message: "Server error", severity: "error" });
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleSave = async () => {
    if (!title || !description) {
      setSnackbar({
        open: true,
        message: "Title and Description are required",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Title: title, Description: description }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Draft saved successfully!",
          severity: "success",
        });
        setTitle("");
        setDescription("");
        fetchDrafts(); // refresh table after saving
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error saving draft",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Server error:", error);
      setSnackbar({ open: true, message: "Server error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box p={3}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Create Draft
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Draft"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {/* Drafts Table */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Saved Drafts
            </Typography>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 300 }} // set max height for scroll
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", minWidth: 50 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: "bold", minWidth: 300 }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drafts.length > 0 ? (
                    drafts.map((draft) => (
                      <TableRow key={draft.id}>
                        <TableCell>{draft.id}</TableCell>
                        <TableCell>{draft.Title}</TableCell>
                        <TableCell>{draft.Description}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No drafts available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default PrivatePage;
