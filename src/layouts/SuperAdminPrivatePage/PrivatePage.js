// PrivatePage.js

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Grid,
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import MUIDataTable from "mui-datatables";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import authAxios from "authAxios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
});

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
  const { fetchError, fetchSuccess } = useSnackbar();
  const [drafts, setDrafts] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    try {
      const { data } = await authAxios.get("/drafts");
      setDrafts(data);
    } catch (error) {
      fetchError(error.response?.data?.message || "Error fetching drafts");
    }
  }, [fetchError]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Save draft (new or edited)
  const handleSave = async (values, { resetForm, setSubmitting }) => {
    try {
      if (editingDraft) {
        await authAxios.put(`/drafts/${editingDraft.id}`, {
          Title: values.title,
          Description: values.description,
        });
        fetchSuccess("Draft updated successfully!");
      } else {
        await authAxios.post("/drafts", {
          Title: values.title,
          Description: values.description,
        });
        fetchSuccess("Draft saved successfully!");
      }
      resetForm();
      setEditingDraft(null);
      fetchDrafts();
    } catch (error) {
      fetchError(error.response?.data?.message || "Error saving draft");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete draft
  const handleDelete = async () => {
    try {
      await authAxios.delete(`/drafts/${deleteConfirm.id}`);
      fetchSuccess("Draft deleted successfully!");
      fetchDrafts();
    } catch (error) {
      fetchError(error.response?.data?.message || "Error deleting draft");
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
              <IconButton color="primary" onClick={() => setEditingDraft(draft)}>
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
        {/* Create Draft Form */}
        <Card sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <SoftTypography variant="h5" sx={{ mb: 3, color: "#e6762d" }}>
            Create New Draft
          </SoftTypography>

          <Formik
            initialValues={{ title: "", description: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      <strong>Title</strong>
                    </SoftTypography>
                    <TextField
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.title && touched.title}
                      helperText={touched.title && errors.title}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      <strong>Description</strong>
                    </SoftTypography>
                    <TextField
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={6}
                      error={!!errors.description && touched.description}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <SoftButton
                      variant="gradient"
                      type="submit"
                      className="add-usr-button"
                      disabled={isSubmitting}
                      sx={{ mr: 2 }}
                    >
                      {isSubmitting ? "Saving..." : "Save Draft"}
                    </SoftButton>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
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

        {/* Edit Draft Dialog */}
        <Dialog open={!!editingDraft} onClose={() => setEditingDraft(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Draft</DialogTitle>
          <DialogContent>
            {editingDraft && (
              <Formik
                initialValues={{
                  title: editingDraft?.Title || "",
                  description: editingDraft?.Description || "",
                }}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSave}
              >
                {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
                  <Form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <SoftTypography component="label" variant="caption" fontWeight="bold">
                          Title
                        </SoftTypography>
                        <TextField
                          name="title"
                          value={values.title}
                          onChange={handleChange}
                          variant="outlined"
                          fullWidth
                          error={!!errors.title && touched.title}
                          helperText={touched.title && errors.title}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <SoftTypography component="label" variant="caption" fontWeight="bold">
                          Description
                        </SoftTypography>
                        <TextField
                          name="description"
                          value={values.description}
                          onChange={handleChange}
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={6}
                          error={!!errors.description && touched.description}
                          helperText={touched.description && errors.description}
                        />
                      </Grid>
                    </Grid>
                    <DialogActions sx={{ mt: 2 }}>
                      <SoftButton
                        variant="gradient"
                        onClick={() => setEditingDraft(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </SoftButton>
                      <SoftButton
                        variant="gradient"
                        type="submit"
                        disabled={isSubmitting}
                        className="add-usr-button"
                      >
                        {isSubmitting ? "Updating..." : "Update"}
                      </SoftButton>
                    </DialogActions>
                  </Form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, id: null })}
        >
          <DialogTitle>Are you sure you want to delete this draft?</DialogTitle>
          <DialogActions>
            <SoftButton
              variant="gradient"
              className="cancel-button"
              onClick={() => setDeleteConfirm({ open: false, id: null })}
            >
              Cancel
            </SoftButton>
            <SoftButton
              variant="gradient"
              className="delete-button"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </SoftButton>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default PrivatePage;
