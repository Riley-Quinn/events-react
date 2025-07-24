//AddSubCategories.js

import React, { useState, useEffect } from "react";
import { TextField, FormControl, Grid, CircularProgress, Autocomplete } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import authAxios from "authAxios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

const validationSchema = Yup.object({
  name: Yup.string().required("Subcategory name is required"),
  category_id: Yup.string().required("Category is required"),
});

// eslint-disable-next-line react/prop-types
const AddSubCategory = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchError, fetchSuccess } = useSnackbar();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await authAxios.get("/categories");
        setCategories(res?.data?.list);
      } catch (error) {
        fetchError("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Formik
      initialValues={{ name: "", category_id: "" }}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        setSubmitting(true);
        try {
          const res = await authAxios.post("/sub-category", values);
          fetchSuccess(res?.data?.message || "Subcategory added");
          resetForm();
          if (onClose) onClose();
        } catch (err) {
          fetchError("Failed to add subcategory", err);
        }
      }}
    >
      {({ errors, touched, handleChange, setFieldValue, values }) => (
        <Form style={{ marginTop: "16px" }}>
          <Grid container spacing={2}>
            {/* Category Selection with Autocomplete */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <SoftTypography component="label" variant="caption" fontWeight="bold">
                  Select Category
                </SoftTypography>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  loading={loading}
                  onChange={(e, value) =>
                    setFieldValue("category_id", value ? value.category_id : "")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Choose category"
                      error={touched.category_id && Boolean(errors.category_id)}
                      helperText={touched.category_id && errors.category_id}
                      sx={{ mt: 1 }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            {/* Subcategory Name */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <SoftTypography component="label" variant="caption" fontWeight="bold">
                  Subcategory Name
                </SoftTypography>
                <TextField
                  fullWidth
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  sx={{ mt: 1 }}
                />
              </FormControl>
            </Grid>
            {/* Action Buttons */}
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

export default AddSubCategory;
