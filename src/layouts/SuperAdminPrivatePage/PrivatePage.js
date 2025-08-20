// PrivatePage.js

import React, { useState, useEffect, useCallback } from "react";
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
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { Tooltip } from "@mui/material";
import {
  Title as TitleIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Article as ArticleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import MUIDataTable from "mui-datatables";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const getMuiTheme = (theme) =>
  createTheme({
    components: {
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.default,
            fontWeight: "bold",
          },
        },
      },
    },
  });

const options = {
  selectableRows: "none",
  elevation: 0,
};

const PrivatePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [drafts, setDrafts] = useState([]);

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
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
      setSnackbar({ open: true, message: "Server error", severity: "error" });
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Save / Update draft
  const handleSave = async () => {
    if (!title || !description) {
      setSnackbar({ open: true, message: "Title and Description required", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const url = editingId
        ? `http://localhost:4000/api/drafts/${editingId}`
        : "http://localhost:4000/api/drafts";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Title: title, Description: description }),
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: editingId ? "Draft updated successfully!" : "Draft saved successfully!",
          severity: "success",
        });
        setTitle("");
        setDescription("");
        setEditingId(null);
        fetchDrafts();
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error saving draft",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Server error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Edit draft
  const handleEdit = (draft) => {
    setTitle(draft.Title);
    setDescription(draft.Description);
    setEditingId(draft.id);
  };

  // Delete draft
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/drafts/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSnackbar({ open: true, message: "Draft deleted successfully!", severity: "success" });
        fetchDrafts();
      } else {
        setSnackbar({ open: true, message: "Error deleting draft", severity: "error" });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Server error", severity: "error" });
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  // Table columns
  const columns = [
    {
      name: "SNo",
      label: "S.No.",
      options: {
        customBodyRenderLite: (dataIndex) => dataIndex + 1,
      },
    },
    {
      name: "Title",
      label: "Title",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const draft = drafts[dataIndex];
          return (
            <Tooltip title={draft.Title} arrow>
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "150px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {draft.Title}
              </span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "Description",
      label: "Description",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const draft = drafts[dataIndex];
          return (
            <Tooltip title={draft.Description} arrow>
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "250px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {draft.Description}
              </span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "Actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const draft = drafts[dataIndex];
          return (
            <>
              <IconButton color="primary" onClick={() => handleEdit(draft)}>
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => setDeleteConfirm({ open: true, id: draft.id })}
              >
                <DeleteIcon />
              </IconButton>
            </>
          );
        },
      },
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box p={3}>
        {/* Create / Edit Draft Form */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: "#e6762d", mb: 3 }}>
              <ArticleIcon /> {editingId ? "Edit Draft" : "Create New Draft"}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Draft Title"
                  variant="standard"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Draft Content"
                  variant="standard"
                  fullWidth
                  multiline
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mt: 1.5 }}>
                        <DescriptionIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  className="add-usr-button"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  sx={{ mr: 2 }}
                >
                  {loading ? "Saving..." : editingId ? "Update Draft" : "Save Draft"}
                </Button>
                {editingId && (
                  <Button
                    variant="outlined"
                    className="cancel-button"
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setDescription("");
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Drafts Table */}
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <ThemeProvider theme={getMuiTheme}>
            <MUIDataTable
              title={"Saved Drafts"}
              data={drafts}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </Card>

        {/* Delete Dialog */}
        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, id: null })}
        >
          <DialogTitle>Are you sure you want to delete this draft?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm({ open: false, id: null })} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default PrivatePage;
