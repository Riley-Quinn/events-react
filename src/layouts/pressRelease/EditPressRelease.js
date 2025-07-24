//EditPressRelease.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, TextField, FormControl, Grid } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Autocomplete from "@mui/material/Autocomplete";
import authAxios from "authAxios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import { useAuthUser } from "contexts/userContext";
import { useFetchUsers } from "contexts/fetchUsersContext";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  notes: Yup.string().required("Notes are required"),
  assignee_id: Yup.string().required("Assignee is required"),
});

const EditPressRelease = () => {
  const { id } = useParams();
  const { user } = useAuthUser();
  const { usersList } = useFetchUsers();
  const navigate = useNavigate();
  const { fetchError, fetchSuccess } = useSnackbar();
  const [press, setPress] = useState(null);
  const [pressStatusOptions, setPressStatusOptions] = useState([]);

  useEffect(() => {
    const fetchPress = async () => {
      try {
        const res = await authAxios.get(`/press-release/${id}`);
        setPress(res.data);
      } catch (err) {
        fetchError("Failed to fetch press release", err);
      }
    };
    fetchPress();
  }, [id, fetchError]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await authAxios.get("/tasks/status/all", {
          params: {
            type: "press_release",
          },
        });
        setPressStatusOptions(res.data?.list || []);
      } catch (err) {
        fetchError("Failed to fetch statuses", err);
      }
    };

    fetchStatuses();
  }, [fetchError]);

  if (!press) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "30px", width: "100%", borderRadius: "8px" }}>
        <SoftTypography variant="h5" style={{ marginBottom: "18px" }}>
          Edit Press Release
        </SoftTypography>
        <Formik
          enableReinitialize
          initialValues={{
            title: press.title || "",
            notes: press.notes || "",
            assignee_id: press.assignee_id || "",
            status_id: press.status_id || null,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              const token = localStorage.getItem("token");
              await authAxios.put(`/press-release/${id}`, values);
              fetchSuccess("Press release updated successfully");
              navigate("/press-release");
            } catch (err) {
              fetchError("Failed to update press release", err);
            }
          }}
        >
          {({ errors, touched, handleChange, values, setFieldValue }) => (
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
                      Assignee
                    </SoftTypography>
                    <Autocomplete
                      options={usersList}
                      getOptionLabel={(option) => option.name}
                      value={usersList.find((a) => a.id == values.assignee_id) || null}
                      onChange={(e, value) => setFieldValue("assignee_id", value ? value.id : "")}
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
                          variant="outlined"
                          error={!!errors.assignee_id && touched.assignee_id}
                          helperText={touched.assignee_id && errors.assignee_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
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
                      minRows={3}
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
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item>
                  <SoftButton type="submit" variant="gradient" className="add-usr-button">
                    Save
                  </SoftButton>
                </Grid>
                <Grid item>
                  <SoftButton
                    variant="gradient"
                    className="cancel-button"
                    onClick={() => navigate("/press-release")}
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

export default EditPressRelease;
