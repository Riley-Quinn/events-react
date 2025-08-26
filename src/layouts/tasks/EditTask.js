import React, { useState, useEffect } from "react";
import { Card, TextField, FormControl, Grid, Autocomplete } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import authAxios from "authAxios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import { useFetchUsers } from "contexts/fetchUsersContext";
import { useAuthUser } from "contexts/userContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  location: Yup.string().required("Location is required"),
  category_id: Yup.number().required("Category is required"),
  assignee_id: Yup.string().required("Assignee is required"),
  sub_category_id: Yup.number().nullable(),
  status_id: Yup.number().required("Status is required"),
  estimated_date: Yup.date().nullable(),
  start_date: Yup.date().nullable(),
});

// Helper function to format dates correctly for input fields
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Handle timezone offset to ensure we get the correct local date
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split("T")[0];
};

const EditTask = () => {
  const { fetchSuccess, fetchError } = useSnackbar();
  const { user } = useAuthUser();
  const { usersList } = useFetchUsers();
  const { task_id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [category, setCategory] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rolesList, setRolesList] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await authAxios.get("/tasks/status/all", {
          params: { type: "task" },
        });
        setStatuses(res.data.list || []);
      } catch (err) {
        fetchError("Failed to fetch statuses");
      }
    };

    fetchStatuses();
  }, [fetchError]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authAxios.get("/categories");
        setCategory(res.data.list);
      } catch (err) {
        fetchError("Failed to fetch categories");
      }
    };

    const fetchTaskDetails = async () => {
      try {
        const res = await authAxios.get(`/tasks/${task_id}`);
        const task = res.data;

        setInitialValues({
          title: task?.title,
          description: task?.description,
          location: task?.location,
          category_id: task?.category_id,
          sub_category_id: task?.sub_category_id || null,
          assignee_id: task?.assignee_id,
          role_id: task?.role_id || null,
          status_id: task?.status_id,
          estimated_date: formatDateForInput(task?.estimated_date),
          start_date: formatDateForInput(task?.start_date),
        });

        setSelectedCategoryId(task.category_id);
      } catch (err) {
        console.error("Error fetching task details", err);
        fetchError("Failed to fetch task details");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchTaskDetails();
  }, [task_id, fetchError]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) return;
      try {
        const res = await authAxios.get(`/sub-category/category/${selectedCategoryId}`);
        setSubcategories(res.data?.list || []);
      } catch (err) {
        fetchError("Failed to fetch subcategories");
      }
    };

    fetchSubcategories();
  }, [selectedCategoryId, fetchError]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await authAxios.get("/roles/list/for-tasks");
        setRolesList(res.data?.list || []);
      } catch (err) {
        fetchError("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, [fetchError]);

  if (loading || !initialValues) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Card style={{ padding: "30px", textAlign: "center" }}>
          <SoftTypography variant="h6">Loading task details...</SoftTypography>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "30px", width: "100%", borderRadius: "8px" }}>
        <SoftTypography variant="h5" style={{ marginBottom: "18px" }}>
          Edit Task
        </SoftTypography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              const updatedData = {
                title: values.title,
                description: values.description,
                location: values.location,
                assignee_id: values.assignee_id,
                role_id: values.role_id,
                category_id: values.category_id,
                sub_category_id: values.sub_category_id,
                estimated_date: values.estimated_date || null,
                start_date: values.start_date || null,
              };

              const taskStatus = values.status_id;

              // Call main update
              await authAxios.put(`/tasks/${task_id}`, updatedData);

              // Call status update if status changed
              if (taskStatus !== initialValues.status_id) {
                await authAxios.put(`/tasks/${task_id}/status`, {
                  status_id: taskStatus,
                });
              }

              fetchSuccess("Task updated successfully");
              navigate("/tasks");
            } catch (err) {
              fetchError("Failed to update task");
            }
          }}
        >
          {({ errors, touched, handleChange, setFieldValue, values, handleSubmit }) => (
            <Form
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
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
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Description
                    </SoftTypography>
                    <TextField
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.description && touched.description}
                      helperText={touched.description && errors.description}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Location
                    </SoftTypography>
                    <TextField
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.location && touched.location}
                      helperText={touched.location && errors.location}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Category
                    </SoftTypography>
                    <Autocomplete
                      options={category.filter((cat) => cat.is_active)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.category_id) === Number(value.category_id)
                      }
                      onChange={(e, value) => {
                        const categoryId = value ? Number(value.category_id) : null;
                        setFieldValue("category_id", categoryId);
                        setSelectedCategoryId(categoryId);
                        setFieldValue("sub_category_id", null);
                      }}
                      value={
                        category.find((cat) => Number(cat.category_id) === values.category_id) ||
                        null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          error={!!errors.category_id && touched.category_id}
                          helperText={touched.category_id && errors.category_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                {values.category_id && subcategories.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <SoftTypography component="label" variant="caption" fontWeight="bold">
                        Subcategory
                      </SoftTypography>
                      <Autocomplete
                        options={subcategories.filter((sub) => sub.is_active)}
                        getOptionLabel={(option) => option?.name || ""}
                        isOptionEqualToValue={(option, value) =>
                          Number(option?.sub_category_id) === Number(value?.sub_category_id)
                        }
                        onChange={(e, value) => {
                          setFieldValue(
                            "sub_category_id",
                            value ? Number(value.sub_category_id) : null
                          );
                        }}
                        value={
                          subcategories.find(
                            (item) => item.sub_category_id === values.sub_category_id
                          ) || null
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            error={!!errors.sub_category_id && touched.sub_category_id}
                            helperText={touched.sub_category_id && errors.sub_category_id}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Role
                    </SoftTypography>
                    <Autocomplete
                      options={rolesList}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.role_id) === Number(value.role_id)
                      }
                      onChange={(e, value) => {
                        setFieldValue("role_id", value ? value.role_id : null);
                        setFieldValue("assignee_id", null);
                      }}
                      value={
                        rolesList.find((r) => Number(r.role_id) === Number(values.role_id)) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          name="role_id"
                          error={!!errors.role_id && touched.role_id}
                          helperText={touched.role_id && errors.role_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Assignee To
                    </SoftTypography>
                    <Autocomplete
                      options={usersList?.filter((user) => user.is_active)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e, value) => {
                        setFieldValue("assignee_id", value ? value.id : null);
                        setFieldValue("role_id", null);
                      }}
                      value={usersList?.find((user) => user.id === values.assignee_id) || null}
                      renderOption={(props, option) => {
                        const isSelf = option.id === user?.id;
                        return (
                          <li {...props}>
                            <span style={{ fontWeight: isSelf ? "bold" : "normal" }}>
                              {option.name} {isSelf && "(Self)"}
                            </span>
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          error={!!errors.assignee_id && touched.assignee_id}
                          helperText={touched.assignee_id && errors.assignee_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <SoftTypography
                    variant="caption"
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      fontStyle: "italic",
                      color: "gray",
                    }}
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    To assign the task to a group of users, please select a Role — all users under
                    that role will receive the task. To assign the task to an individual, please use
                    the Assign To option.
                  </SoftTypography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Status
                    </SoftTypography>
                    <Autocomplete
                      options={statuses}
                      getOptionLabel={(option) => option?.status_name || ""}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.status_id) === Number(value.status_id)
                      }
                      onChange={(e, value) => {
                        setFieldValue("status_id", value ? value.status_id : null);
                      }}
                      value={statuses.find((item) => item.status_id === values.status_id) || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          error={!!errors.status_id && touched.status_id}
                          helperText={touched.status_id && errors.status_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Start Date
                    </SoftTypography>
                    <TextField
                      name="start_date"
                      type="date"
                      value={values.start_date}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.start_date && touched.start_date}
                      helperText={touched.start_date && errors.start_date}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Estimated Date
                    </SoftTypography>
                    <TextField
                      name="estimated_date"
                      type="date"
                      value={values.estimated_date}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.estimated_date && touched.estimated_date}
                      helperText={touched.estimated_date && errors.estimated_date}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2} mt={2}>
                <Grid item>
                  <SoftButton type="submit" variant="gradient" className="add-usr-button">
                    Update
                  </SoftButton>
                </Grid>
                <Grid item>
                  <SoftButton
                    variant="gradient"
                    className="cancel-button"
                    onClick={() => navigate("/tasks")}
                  >
                    Cancel
                  </SoftButton>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Card>
    </DashboardLayout>
  );
};

export default EditTask;
