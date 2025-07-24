import React, { useState } from "react";
import { TextField, FormControl, Grid } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import authAxios from "authAxios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const validationSchema = Yup.object({
  name: Yup.string().required("Role Name is required"),
});

// eslint-disable-next-line react/prop-types
const AddRole = ({ onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const { fetchError, fetchSuccess } = useSnackbar();
  return (
    <Formik
      initialValues={{
        name: "",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        setSubmitting(true);
        try {
          const res = await authAxios.post("/roles/create", values);
          if (onClose) onClose();
          fetchSuccess(res?.data?.message);
        } catch (err) {
          fetchError("Failed to add role", err);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, touched, handleChange, values }) => (
        <Form style={{ marginTop: "16px" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <SoftTypography component="label" variant="caption" fontWeight="bold">
                  Role Name
                </SoftTypography>
                <TextField
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  error={!!errors.name && touched.name}
                  helperText={touched.name && errors.name}
                  sx={{ mt: 1 }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <SoftButton
                variant="gradient"
                className="cancel-button"
                type="submit"
                disabled={submitting}
              >
                Save
              </SoftButton>
              <SoftButton variant="gradient" className="add-usr-button" onClick={onClose}>
                Cancel
              </SoftButton>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AddRole;
