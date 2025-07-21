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
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  notes: Yup.string().required("Note is required"),
  assignee_id: Yup.number().required("Assignee is required"),
});

const AddPressRelease = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        alert("Unauthorized or failed to fetch users");
      }
    };

    fetchUsers();
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
            notes: "",
            assignee_id: "",
            status_id: 1,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setFieldError }) => {
            setSubmitting(true);

            const pressData = {
              title: values.title,
              notes: values.notes,
              assignee_id: values.assignee_id,
              status_id: 1,
            };

            try {
              const res = await axios.post(
                "http://localhost:4000/api/press-release/create",
                pressData,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              navigate("/press-release");
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
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Assigne
                    </SoftTypography>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e, value) => {
                        setFieldValue("assignee_id", value ? value.id : "");
                      }}
                      value={users.find((user) => user.id === values.assignee_id) || null}
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
                <Grid item xs={12} sm={12}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Notes
                    </SoftTypography>
                    <TextField
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={6}
                      inputProps={{
                        style: { width: "100%", minWidth: "500px" }, // Makes the input wide
                      }}
                      error={!!errors.notes && touched.notes}
                      helperText={touched.notes && errors.notes}
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

export default AddPressRelease;
