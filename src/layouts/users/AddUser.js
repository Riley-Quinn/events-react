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
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import authAxios from "authAxios";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid phone number")
    .required("Phone number is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password is too short - should be 6 chars minimum.")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-])/,
      "Password must contain at least one letter, one number, and one special character"
    ),
  address: Yup.string().required("Address is required"),
  role_id: Yup.number().required("Role is required"),
});

const AddUser = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await authAxios.get("/roles");
        setRoles(res.data);
      } catch (err) {
        fetchError("Failed to fetch roles:", err);
      }
    };

    fetchRoles();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "30px", width: "100%", borderRadius: "8px" }}>
        <SoftTypography variant="h5" style={{ marginBottom: "18px" }}>
          Add New User
        </SoftTypography>
        <Formik
          initialValues={{
            name: "",
            email: "",
            phone: "",
            password: "",
            address: "",
            role_id: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setFieldError }) => {
            setSubmitting(true);

            const userData = {
              name: values.name,
              email: values.email,
              phone: values.phone,
              password: values.password,
              address: values.address,
              role_id: values.role_id,
            };
            try {
              const res = await authAxios.post("/auth/register", userData);
              navigate("/users");
              fetchSuccess(res?.data?.message);
            } catch (err) {
              const errorMsg = err?.response?.data?.message || "Failed to add user";
              fetchError(errorMsg);
              if (err?.response?.status === 400 && errorMsg.includes("Email")) {
                setFieldError("email", errorMsg);
              }
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
                      Name
                    </SoftTypography>
                    <TextField
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.name && touched.name}
                      helperText={touched.name && errors.name}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Phone Number
                    </SoftTypography>
                    <TextField
                      name="phone"
                      value={values.phone}
                      inputProps={{ maxLength: 10 }}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.phone && touched.phone}
                      helperText={touched.phone && errors.phone}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Email
                    </SoftTypography>
                    <TextField
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.email && touched.email}
                      helperText={touched.email && errors.email}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}></Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Password
                    </SoftTypography>
                    <TextField
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.password && touched.password}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Address
                    </SoftTypography>
                    <TextField
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      error={!!errors.address && touched.address}
                      helperText={touched.address && errors.address}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Role
                    </SoftTypography>
                    <Autocomplete
                      options={roles.filter((role) => role.is_active)}
                      getOptionLabel={(option) => option.name}
                      onChange={(e, value) => {
                        setFieldValue("role_id", value ? value.id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="role_id"
                          variant="outlined"
                          error={!!errors.role_id && touched.role_id}
                          helperText={touched.role_id && errors.role_id}
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
                      onClick={() => navigate(`/users`)}
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

export default AddUser;
