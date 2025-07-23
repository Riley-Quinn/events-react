//AddCategories.js

import React, { useState } from "react";
import { TextField, FormControl, Grid } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import axios from "axios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const validationSchema = Yup.object({
  name: Yup.string().required("Category is required"),
});

// eslint-disable-next-line react/prop-types
const AddCategory = ({ onClose, initialData = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const { fetchError, fetchSuccess } = useSnackbar();
  return (
    <Formik
      initialValues={{
        name: initialData?.name || "",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        setSubmitting(true);
        try {
          if (initialData) {
            // Edit mode
            const res = await axios.put(
              `http://localhost:4000/api/categories/${initialData.category_id}`,
              values,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            fetchSuccess(res?.data?.message || "Category updated successfully");
          } else {
            // Add mode
            const res = await axios.post("http://localhost:4000/api/categories", values, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            fetchSuccess(res?.data?.message || "Category added successfully");
          }
          if (onClose) onClose();
        } catch (err) {
          fetchError("Failed to save category", err);
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
                  Category Name
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
                {initialData ? "Update" : "Save"}
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

export default AddCategory;
