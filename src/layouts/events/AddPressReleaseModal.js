import React, { useState, useEffect } from "react";
import { Modal, Box, TextField, FormControl, Grid, Autocomplete } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import authAxios from "authAxios";
import { useFetchUsers } from "contexts/fetchUsersContext";
import { useAuthUser } from "contexts/userContext";
import PropTypes from "prop-types";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  notes: Yup.string().required("Note is required"),
  assignee_id: Yup.string().required("Assignee is required"),
  status_id: Yup.string().required("Status is required"),
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AddPressReleaseModal = ({ open, onClose }) => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const { user } = useAuthUser();
  const { usersList } = useFetchUsers();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [pressStatusOptions, setPressStatusOptions] = useState([]);

  useEffect(() => {
    if (!open) return;
    const fetchPressStatuses = async () => {
      try {
        const res = await authAxios.get("/tasks/status/all", {
          params: { type: "press_release" },
        });
        setPressStatusOptions(res.data?.list || []);
      } catch (err) {
        console.error("Failed to fetch task statuses", err);
        setPressStatusOptions([]);
      }
    };
    fetchPressStatuses();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <SoftTypography variant="h5" sx={{ mb: 2 }}>
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
          onSubmit={async (values) => {
            setSubmitting(true);
            const pressData = {
              title: values.title,
              notes: values.notes,
              assignee_id: values.assignee_id,
              status_id: values.status_id,
            };

            try {
              const res = await authAxios.post("/press-release/create", pressData);
              fetchSuccess(res?.data?.message);
              onClose?.(); // close modal
              navigate("/press-release");
            } catch (err) {
              fetchError("Failed to add press release", err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, handleChange, setFieldValue, values }) => (
            <Form>
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
                      Assignee
                    </SoftTypography>
                    <Autocomplete
                      options={usersList.filter((u) => u.is_active)}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e, value) => setFieldValue("assignee_id", value ? value.id : "")}
                      value={usersList.find((u) => u.id === values.assignee_id) || null}
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
                      onChange={(e, value) =>
                        setFieldValue("status_id", value ? value.status_id : "")
                      }
                      value={
                        pressStatusOptions.find((s) => s.status_id === values.status_id) || null
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

              <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <SoftButton
                  variant="gradient"
                  className="add-usr-button"
                  type="submit"
                  disabled={submitting}
                >
                  Save
                </SoftButton>
                <SoftButton variant="gradient" className="cancel-button" onClick={onClose}>
                  Cancel
                </SoftButton>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default AddPressReleaseModal;
AddPressReleaseModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
