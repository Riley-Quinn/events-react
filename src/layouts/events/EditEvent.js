import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, TextField, FormControl, Grid } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import authAxios from "authAxios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  location: Yup.string().required("Location is required"),
  date: Yup.string().required("Date is required"),
  time: Yup.string().required("Time is required"),
});

const EditEvent = () => {
  const { id } = useParams();
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await authAxios.get(`/events/${id}`);

      const event = res.data;

      setInitialValues({
        title: event.title,
        description: event.description,
        location: event.location,
        date: event.date.slice(0, 10), // ✅ Ensure YYYY-MM-DD format
        time: event.time,
      });
    } catch (err) {
      fetchError("Failed to fetch event details", err);
    }
  };

  if (!initialValues) return null; // Avoid rendering until data is fetched

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "30px", width: "100%", borderRadius: "8px" }}>
        <SoftTypography variant="h5" style={{ marginBottom: "18px" }}>
          Edit Event
        </SoftTypography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values) => {
            setSubmitting(true);

            try {
              await authAxios.put(`/events/${id}`, values);

              fetchSuccess("Event updated successfully!");
              navigate("/events");
            } catch (err) {
              fetchError("Failed to update event", err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, handleChange, values }) => (
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

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Date
                    </SoftTypography>
                    <TextField
                      name="date"
                      type="date"
                      value={values.date}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.date && touched.date}
                      helperText={touched.date && errors.date}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Time
                    </SoftTypography>
                    <TextField
                      name="time"
                      type="time"
                      value={values.time}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.time && touched.time}
                      helperText={touched.time && errors.time}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item>
                  <SoftButton
                    variant="gradient"
                    type="submit"
                    disabled={submitting}
                    className="add-usr-button"
                  >
                    Save
                  </SoftButton>
                </Grid>
                <Grid item>
                  <SoftButton
                    variant="gradient"
                    onClick={() => navigate("/events")}
                    className="cancel-button"
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

export default EditEvent;
