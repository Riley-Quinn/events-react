import React, { useState, useEffect } from "react";
import { Card, TextField, FormControl, Grid, InputAdornment, IconButton } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useNavigate, useParams } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import Autocomplete from "@mui/material/Autocomplete";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid phone number")
    .required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  role_id: Yup.number().required("Role is required"),
});

const EditUser = () => {
  const { id } = useParams();
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRolesAndUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const [rolesRes, userRes] = await Promise.all([
          axios.get("http://localhost:4000/api/roles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:4000/api/auth/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRoles(rolesRes.data);

        const user = userRes.data;

        setInitialValues({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          role_id: user.role_id || "",
          password: "", // optional, leave empty if not changing
        });

        setLoading(false);
      } catch (err) {
        fetchError("Failed to fetch user or roles", err);
        setLoading(false);
      }
    };

    fetchRolesAndUser();
  }, [id, fetchError]);

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "30px", width: "100%", borderRadius: "8px" }}>
        <SoftTypography variant="h5" style={{ marginBottom: "18px" }}>
          Edit User
        </SoftTypography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            const token = localStorage.getItem("token");

            const payload = {
              name: values.name,
              email: values.email,
              phone: values.phone,
              address: values.address,
              role_id: values.role_id,
            };

            // Include password only if user enters it
            if (values.password) {
              payload.password = values.password;
            }

            try {
              await axios.put(`http://localhost:4000/api/auth/users/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
              });

              fetchSuccess("User updated successfully");
              navigate("/users");
            } catch (err) {
              fetchError("Failed to update user", err);
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
                      onChange={handleChange}
                      inputProps={{ maxLength: 10 }}
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
                      options={roles}
                      getOptionLabel={(option) => option.name}
                      value={roles.find((r) => r.id === values.role_id) || null}
                      onChange={(e, value) => setFieldValue("role_id", value ? value.id : "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          error={!!errors.role_id && touched.role_id}
                          helperText={touched.role_id && errors.role_id}
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
                    onClick={() => navigate("/users")}
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

export default EditUser;
