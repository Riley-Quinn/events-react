import React, { useState, useEffect } from "react";
import {
  Card,
  TextField,
  FormControl,
  Grid,
  InputAdornment,
  IconButton,
  Button,
  Autocomplete,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import authAxios from "authAxios";
import { useFetchUsers } from "contexts/fetchUsersContext";
import { useAuthUser } from "contexts/userContext";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  location: Yup.string().required("Location is required"),
  category_id: Yup.number().typeError("Category must be selected").required("Category is required"),
  assignee_id: Yup.string().required("Assignee is required"),
  sub_category_id: Yup.number().nullable(),
  status_id: Yup.number().typeError("Status is required").required("Status is required"),
  estimated_date: Yup.date().nullable(),
});

const AddTask = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const { usersList } = useFetchUsers();
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [taskStatusOptions, setTaskStatusOptions] = useState([]);
  console.log("Status options:", taskStatusOptions);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authAxios.get("/categories");
        setCategory(res.data.list);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        alert("Unauthorized or failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) return;
      try {
        const res = await authAxios.get(`/sub-category/category/${selectedCategoryId}`);
        setSubcategories(res.data?.list || []);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      }
    };
    fetchSubcategories();
  }, [selectedCategoryId]);

  useEffect(() => {
    const fetchTaskStatuses = async () => {
      try {
        const res = await authAxios.get("/tasks/status/all", {
          params: {
            type: "task",
          },
        });
        setTaskStatusOptions(res.data?.list || []);
      } catch (err) {
        console.error("Failed to fetch task statuses", err);
        setTaskStatusOptions([]); // fallbackn
      }
    };

    fetchTaskStatuses();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "30px", width: "100%", borderRadius: "8px" }}>
        <SoftTypography variant="h5" style={{ marginBottom: "18px" }}>
          Add New Task
        </SoftTypography>
        <Formik
          initialValues={{
            title: "",
            description: "",
            location: "",
            assignee_id: null,
            category_id: null,
            sub_category_id: null,
            status_id: 1,
            estimated_date: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setFieldError }) => {
            setSubmitting(true);

            const taskData = {
              title: values.title,
              description: values.description,
              location: values.location,
              assignee_id: values.assignee_id,
              category_id: values.category_id,
              sub_category_id: values.sub_category_id,
              status_id: values.status_id,
              estimated_date: values.estimated_date || null,
            };

            try {
              const res = await authAxios.post("/tasks", taskData);
              console.log("Fetched tasks:", res.data.list);
              navigate("/tasks");
              fetchSuccess(res?.data?.message);
            } catch (err) {
              fetchError("Failed to add task", err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, handleChange, setFieldValue, values }) => (
            <Form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                      options={category}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.category_id) === Number(value.category_id)
                      }
                      onChange={(e, value) => {
                        const categoryId = value ? Number(value.category_id) : null;
                        setFieldValue("category_id", categoryId);
                        setSelectedCategoryId(categoryId);
                        setFieldValue("sub_category_id", null); // Reset on category change
                      }}
                      value={
                        category.find(
                          (cat) => Number(cat.category_id) === Number(values.category_id)
                        ) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="category_id"
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
                        Subcategories
                      </SoftTypography>
                      <Autocomplete
                        options={subcategories}
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
                            name="sub_category_id"
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
                      Assigne
                    </SoftTypography>
                    <Autocomplete
                      options={usersList}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e, value) => {
                        setFieldValue("assignee_id", value ? value.id : null);
                      }}
                      value={usersList.find((user) => user.id === values.assignee_id) || null}
                      renderOption={(props, option) => {
                        const isSelf = option.id === user?.id; // define this variable
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
                          name="assignee_id"
                          variant="outlined"
                          error={!!errors.assignee_id && touched.assignee_id}
                          helperText={touched.assignee_id && errors.assignee_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Status
                    </SoftTypography>
                    <Autocomplete
                      options={taskStatusOptions}
                      getOptionLabel={(option) => option.status_name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.status_id) === Number(value.status_id)
                      }
                      onChange={(e, value) => {
                        setFieldValue("status_id", value ? value.status_id : null);
                      }}
                      value={
                        Array.isArray(taskStatusOptions)
                          ? taskStatusOptions.find(
                              (s) => Number(s.status_id) === Number(values.status_id)
                            ) || null
                          : null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="status_id"
                          variant="outlined"
                          error={!!errors.status_id && touched.status_id}
                          helperText={touched.status_id && errors.status_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
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
                      error={!!errors.estimated_date && touched.estimated_date}
                      helperText={touched.estimated_date && errors.estimated_date}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item>
                    <SoftButton
                      variant="gradient"
                      className="add-usr-button"
                      type="submit"
                      disabled={submitting}
                    >
                      Save
                    </SoftButton>
                  </Grid>
                  <Grid item>
                    <SoftButton
                      variant="gradient"
                      className="cancel-button"
                      onClick={() => navigate(`/tasks`)}
                    >
                      Cancel
                    </SoftButton>
                  </Grid>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Card>
    </DashboardLayout>
  );
};

export default AddTask;
