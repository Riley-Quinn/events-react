import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Chip,
  Box,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SoftBox from "components/SoftBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftButton from "components/SoftButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import authAxios from "authAxios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import { Visibility, Clear } from "@mui/icons-material";

const getMuiTheme = (theme) =>
  createTheme({
    components: {
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.default,
          },
        },
      },
    },
  });

const options = {
  selectableRows: "none",
  selectableRowsHeader: false,
  elevation: 0,
};

const PressReleaseList = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPressId, setSelectedPressId] = useState(null);
  const [selectedPress, setSelectedPress] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const token = localStorage.getItem("token");

  // Extract status from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const statusParam = urlParams.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
    } else {
      setStatusFilter(null);
    }
  }, [location.search]);

  const fetchData = useCallback(async () => {
    try {
      const response = await authAxios.get("/press-release/");
      setRows(response.data);
    } catch (error) {
      console.error("Unable to fetch press releases", error);
    }
  }, [token]);

  // Filter rows based on status filter
  useEffect(() => {
    if (statusFilter) {
      const filtered = rows.filter((press) => press.status_name === statusFilter);
      setFilteredRows(filtered);
    } else {
      setFilteredRows(rows);
    }
  }, [rows, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear status filter
  const clearStatusFilter = () => {
    setStatusFilter(null);
    navigate("/press-release"); // Remove query params from URL
  };

  // Delete Logic
  const handleDeleteClick = (press_id) => {
    setSelectedPressId(press_id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await authAxios.delete(`/press-release/${selectedPressId}`);
      setDeleteDialogOpen(false);
      setSelectedPressId(null);
      fetchData();
      fetchSuccess(res?.data?.message);
    } catch (error) {
      fetchError("Failed to delete press release");
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedPressId(null);
  };

  // Edit Status Logic
  const handleEditClick = (press) => {
    setSelectedPress(press);
    setNewStatus(press.status_name);
    setEditDialogOpen(true);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    try {
      const statusMap = {
        Draft: 1,
        "Open for Review": 2,
        "Ready to Publish": 3,
        "Feedback Pending": 4,
        Unpublish: 5,
        Published: 6,
      };

      const res = await authAxios.put(`/press-release/${selectedPress.press_id}/status`, {
        status_id: statusMap[newStatus],
      });

      setEditDialogOpen(false);
      setSelectedPress(null);
      fetchData();
      fetchSuccess(res?.data?.message);
    } catch (error) {
      fetchError("Failed to update status");
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setSelectedPress(null);
  };

  const columns = [
    { name: "title", label: "Title" },
    { name: "notes", label: "Notes" },
    { name: "assignee_name", label: "Assignee" },
    { name: "status_name", label: "Status" },
    {
      name: "Actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const press = filteredRows[dataIndex];
          return (
            <>
              <IconButton color="primary" onClick={() => navigate(`/edit-press/${press.press_id}`)}>
                <EditIcon />
              </IconButton>

              <IconButton
                color="primary"
                onClick={() => navigate(`/press-release/view-press/${press.press_id}`)}
              >
                <Visibility />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteClick(press.press_id)}>
                <DeleteIcon />
              </IconButton>
            </>
          );
        },
      },
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "24px", margin: "16px auto", maxWidth: "2000px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Box>
            {statusFilter && (
              <Chip
                label={`Filtered by: ${statusFilter}`}
                onDelete={clearStatusFilter}
                deleteIcon={<Clear />}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
            <SoftButton
              variant="gradient"
              className="add-usr-button"
              onClick={() => navigate(`/press-release/add-press`)}
            >
              Add Press Release Note
            </SoftButton>
          </div>
        </div>

        <SoftBox
          sx={{
            "& .MuiTableRow-root:not(:last-child)": {
              "& td": {
                borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                  `${borderWidth[1]} solid ${borderColor}`,
              },
            },
          }}
        >
          <ThemeProvider theme={getMuiTheme}>
            <MUIDataTable
              title={"Manage Press Release"}
              data={filteredRows}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </SoftBox>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Press Release</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this press release? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <SoftButton onClick={handleCancelDelete} variant="gradient" className="cancel-button">
            Cancel
          </SoftButton>
          <SoftButton onClick={handleConfirmDelete} variant="gradient" className="add-usr-button">
            Delete
          </SoftButton>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "24px",
          },
        }}
      >
        <DialogTitle>Edit Press Release Status</DialogTitle>
        <DialogContent>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: "bold" }}>
            Select Status
          </FormLabel>
          <RadioGroup value={newStatus} onChange={handleStatusChange}>
            <FormControlLabel value="Draft" control={<Radio />} label="Draft" />
            <FormControlLabel value="Open for Review" control={<Radio />} label="Open for Review" />
            <FormControlLabel
              value="Ready to Publish"
              control={<Radio />}
              label="Ready to Publish"
            />
            <FormControlLabel
              value="Feedback Pending"
              control={<Radio />}
              label="Feedback Pending"
            />
            <FormControlLabel value="Unpublish" control={<Radio />} label="Unpublish" />
            <FormControlLabel value="Published" control={<Radio />} label="Published" />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end", mt: 2 }}>
          <SoftButton onClick={handleCancelEdit} variant="gradient" className="cancel-button">
            Cancel
          </SoftButton>
          <SoftButton variant="gradient" className="add-usr-button" onClick={handleSaveStatus}>
            Save
          </SoftButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default PressReleaseList;
