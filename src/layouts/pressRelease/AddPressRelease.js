import React, { useState, useEffect, use } from "react";
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
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import authAxios from "authAxios";
import { useFetchUsers } from "contexts/fetchUsersContext";
import { useAuthUser } from "contexts/userContext";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  notes: Yup.string().required("Note is required"),
  assignee_id: Yup.string().required("Assignee is required"),
  status_id: Yup.string().required("Status is required"),
});

const AddPressRelease = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const { user } = useAuthUser();
  const { usersList } = useFetchUsers();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [pressStatusOptions, setPressStatusOptions] = useState([]);

  useEffect(() => {
    const fetchPressStatuses = async () => {
      try {
        const res = await authAxios.get("/tasks/status/all", {
          params: {
            type: "press_release",
          },
        });
        setPressStatusOptions(res.data?.list || []);
      } catch (err) {
        console.error("Failed to fetch task statuses", err);
        setPressStatusOptions([]); // fallback
      }
    };
    fetchPressStatuses();
  }, [fetchError]);
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "30px", width: "100%", borderRadius: "8px" }}>
        <SoftTypography variant="h5" style={{ marginBottom: "18px" }}>
          Add Press Release
        </SoftTypography>
        <Formik
          initialValues={{
            title: "",
            notes: "",
            assignee_id: "",
            status_id: null,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setFieldError }) => {
            setSubmitting(true);

            const pressData = {
              title: values.title,
              notes: values.notes,
              assignee_id: values.assignee_id,
              status_id: values.status_id,
            };

            try {
              const res = await authAxios.post("/press-release/create", pressData);
              navigate("/press-release");
              fetchSuccess(res?.data?.message);
            } catch (err) {
              fetchError("Failed to add press release", err);
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
                      options={usersList.filter((user) => user.is_active)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e, value) => {
                        setFieldValue("assignee_id", value ? value.id : "");
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Status
                    </SoftTypography>
                    <Autocomplete
                      options={pressStatusOptions}
                      getOptionLabel={(option) => option.status_name}
                      isOptionEqualToValue={(option, value) => option.status_id === value.status_id}
                      onChange={(e, value) => {
                        setFieldValue("status_id", value ? value.status_id : "");
                      }}
                      value={
                        pressStatusOptions.find(
                          (status) => status.status_id === values.status_id
                        ) || null
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
                      onClick={() => navigate(`/press-release`)}
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
