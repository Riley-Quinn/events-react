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
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import Switch from "@mui/material/Switch";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  location: Yup.string().required("Location is required"),
  category_id: Yup.number().typeError("Category must be selected").required("Category is required"),
  sub_category_id: Yup.number().nullable(),
  status_id: Yup.number().typeError("Status is required").required("Status is required"),
  estimated_date: Yup.date().nullable(),
  start_date: Yup.date().nullable(),
  start_date: Yup.date()
    .nullable()
    .required("Start Date is Required")
    .test("valid-year", "Year must be 4 digits", (value) => {
      if (!value) return true;
      const year = new Date(value).getFullYear().toString();
      return year.length === 4;
    }),
  estimated_date: Yup.date()
    .nullable()
    .required("Estimated Date is Required")
    .test("valid-year", "Year must be 4 digits", (value) => {
      if (!value) return true;
      const year = new Date(value).getFullYear().toString();
      return year.length === 4;
    }),
  is_important: Yup.boolean(),
  assignee_id: Yup.string().nullable(),
  role_id: Yup.number().nullable(),
  latitude: Yup.number().required("Please select a location on the map"),
  longitude: Yup.number().required("Please select a location on the map"),
}).test(
  "assignee-or-role",
  "Either assignee or role must be selected",
  (values) => !!values.assignee_id || !!values.role_id
);

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
  const [rolesList, setRolesList] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [tempMarkerPosition, setTempMarkerPosition] = useState(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [address, setAddress] = useState("");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authAxios.get("/categories");
        setCategory(res.data.list);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        fetchError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, [fetchError]);

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
        setTaskStatusOptions([]);
      }
    };

    fetchTaskStatuses();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await authAxios.get("/roles/list/for-tasks");
        setRolesList(res.data?.list || []);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };
    fetchRoles();
  }, []);

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
    setGeocoder(new window.google.maps.Geocoder());
  };

  const handleMapClick = (event) => {
    const newMarkerPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setTempMarkerPosition(newMarkerPosition);
    reverseGeocode(newMarkerPosition);
  };

  const handleMarkerDragEnd = (event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setTempMarkerPosition(newPosition);
    reverseGeocode(newPosition);
  };

  const reverseGeocode = (position) => {
    if (!geocoder) return;

    geocoder.geocode({ location: position }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Location selected");
      }
    });
  };

  const handleSearchClick = () => {
    if (geocoder && searchQuery) {
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const newMarkerPosition = {
            lat: location.lat(),
            lng: location.lng(),
          };
          setTempMarkerPosition(newMarkerPosition);
          setAddress(results[0].formatted_address);
          if (map) {
            map.panTo(newMarkerPosition);
          }
        } else {
          fetchError("Location not found!");
        }
      });
    }
  };

  const handleConfirmLocation = (setFieldValue) => {
    if (!tempMarkerPosition) return;

    setMarkerPosition(tempMarkerPosition);
    setFieldValue("location", address);
    setFieldValue("latitude", tempMarkerPosition.lat);
    setFieldValue("longitude", tempMarkerPosition.lng);
    setMapOpen(false);
  };

  const handleMapClose = () => {
    setMapOpen(false);
    setTempMarkerPosition(markerPosition);
    setAddress("");
  };

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
            role_id: null,
            category_id: null,
            sub_category_id: null,
            status_id: 1,
            estimated_date: "",
            start_date: "",
            is_important: false,
            latitude: null,
            longitude: null,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setFieldError }) => {
            setSubmitting(true);

            if (!values.latitude || !values.longitude) {
              setFieldError("location", "Please select a location on the map");
              setSubmitting(false);
              return;
            }

            const taskData = {
              title: values.title,
              description: values.description,
              location: values.location,
              assignee_id: values.assignee_id,
              role_id: values.role_id,
              category_id: values.category_id,
              sub_category_id: values.sub_category_id,
              status_id: values.status_id,
              estimated_date: values.estimated_date || null,
              start_date: values.start_date || null,
              is_important: values.is_important || false,
              latitude: values.latitude,
              longitude: values.longitude,
            };

            try {
              const res = await authAxios.post("/tasks", taskData);
              navigate("/tasks");
              fetchSuccess("Task created successfully");
            } catch (err) {
              fetchError(err.response?.data?.message || "Failed to add task");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, handleChange, setFieldValue, values, handleBlur, handleSubmit }) => (
            <Form
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
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
                      variant="outlined"
                      fullWidth
                      error={!!errors.location && touched.location}
                      helperText={touched.location && errors.location}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setMapOpen(true)} sx={{ color: "#ff883a " }}>
                              <LocationOnIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                        readOnly: true,
                      }}
                    />
                  </FormControl>
                </Grid>

                {/* Map Selection Dialog */}
                <Dialog
                  open={mapOpen}
                  onClose={handleMapClose}
                  maxWidth="md"
                  fullWidth
                  PaperProps={{ style: { height: "80vh" } }}
                >
                  <DialogTitle>Select Location</DialogTitle>
                  <DialogContent style={{ padding: 0, position: "relative" }}>
                    {isLoaded && (
                      <GoogleMap
                        center={tempMarkerPosition || { lat: 17.4239, lng: 78.4738 }}
                        zoom={15}
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        onClick={handleMapClick}
                        onLoad={onMapLoad}
                      >
                        {tempMarkerPosition && (
                          <Marker
                            position={tempMarkerPosition}
                            draggable={true}
                            onDragEnd={handleMarkerDragEnd}
                          />
                        )}
                        <Box
                          sx={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            zIndex: 1,
                            display: "flex",
                            backgroundColor: "white",
                            padding: "5px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            width: "calc(100% - 40px)",
                            margin: "10px",
                          }}
                        >
                          <TextField
                            variant="outlined"
                            placeholder="Search location"
                            size="large"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1 }}
                            onKeyPress={(e) => e.key === "Enter" && handleSearchClick()}
                          />
                          <Button
                            variant="outlined"
                            className="add-usr-button"
                            onClick={handleSearchClick}
                            sx={{ marginLeft: "5px" }}
                          >
                            Search
                          </Button>
                        </Box>
                      </GoogleMap>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Box sx={{ flexGrow: 1, paddingLeft: 2 }}>
                      {address && (
                        <SoftTypography variant="body2">Selected: {address}</SoftTypography>
                      )}
                    </Box>
                    <Button onClick={handleMapClose} variant="contained" className="cancel-button">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleConfirmLocation(setFieldValue)}
                      variant="contained"
                      className="add-usr-button"
                      disabled={!tempMarkerPosition}
                    >
                      Confirm Location
                    </Button>
                  </DialogActions>
                </Dialog>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Category
                    </SoftTypography>
                    <Autocomplete
                      options={category.filter((cat) => cat.is_active)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.category_id) === Number(value.category_id)
                      }
                      onChange={(e, value) => {
                        const categoryId = value ? Number(value.category_id) : null;
                        setFieldValue("category_id", categoryId);
                        setSelectedCategoryId(categoryId);
                        setFieldValue("sub_category_id", null);
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
                        options={subcategories.filter((sub) => sub.is_active)}
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
                      Role
                    </SoftTypography>
                    <Autocomplete
                      options={rolesList}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        Number(option.role_id) === Number(value.role_id)
                      }
                      onChange={(e, value) => {
                        setFieldValue("role_id", value ? value.role_id : null);
                        setFieldValue("assignee_id", null);
                      }}
                      value={
                        rolesList.find((r) => Number(r.role_id) === Number(values.role_id)) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          name="role_id"
                          error={!!errors.role_id && touched.role_id}
                          helperText={touched.role_id && errors.role_id}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Assignee To
                    </SoftTypography>
                    <Autocomplete
                      options={usersList?.filter((user) => user.is_active)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e, value) => {
                        setFieldValue("assignee_id", value ? value.id : null);
                        setFieldValue("role_id", null);
                      }}
                      value={usersList?.find((user) => user.id === values.assignee_id) || null}
                      renderOption={(props, option) => {
                        const isSelf = option.id === user?.id;
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

                <Grid item xs={12}>
                  <SoftTypography
                    variant="caption"
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      fontStyle: "italic",
                      color: "gray",
                    }}
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    To assign the task to a group of users, please select a Role — all users under
                    that role will receive the task. To assign the task to an individual, please use
                    the Assign To option.
                  </SoftTypography>
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
                      Start Date
                    </SoftTypography>
                    <TextField
                      name="start_date"
                      type="date"
                      value={values.start_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      variant="outlined"
                      fullWidth
                      error={!!errors.start_date && touched.start_date}
                      helperText={touched.start_date && errors.start_date}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
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
                      onBlur={handleBlur}
                      variant="outlined"
                      fullWidth
                      error={!!errors.estimated_date && touched.estimated_date}
                      helperText={touched.estimated_date && errors.estimated_date}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <SoftTypography component="label" variant="caption" fontWeight="bold">
                      Important
                    </SoftTypography>
                    <Switch
                      name="is_important"
                      checked={values.is_important}
                      onChange={handleChange}
                      color="primary"
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                  </FormControl>
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
                        {submitting ? "Saving..." : "Save"}
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
              </Grid>
            </Form>
          )}
        </Formik>
      </Card>
    </DashboardLayout>
  );
};

export default AddTask;
