import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Button,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SoftBox from "components/SoftBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftButton from "components/SoftButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import authAxios from "authAxios";
import { Visibility } from "@mui/icons-material";

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

const TasksList = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    try {
      const response = await authAxios.get("/tasks/");
      console.log("Full response from /tasks:", response);
      setRows(response.data.list);
    } catch (error) {
      console.error("Unable to fetch tasks", error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete Logic
  const handleDeleteClick = (task_id) => {
    setSelectedTaskId(task_id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await authAxios.delete(`/tasks/${selectedTaskId}`);
      setDeleteDialogOpen(false);
      setSelectedTaskId(null);
      fetchData();
      fetchSuccess(res?.data?.message);
    } catch (error) {
      fetchError("Failed to delete task");
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedTaskId(null);
  };

  // Edit Status Logic
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status_name);
    setEditDialogOpen(true);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    try {
      const statusMap = {
        Pending: 3,
        "In Progress": 2,
        "On Hold": 4,
        Done: 5,
        Closed: 6,
      };

      const res = await authAxios.put(`/tasks/${selectedTask.task_id}/status`, {
        status_id: statusMap[newStatus],
      });

      setEditDialogOpen(false);
      setSelectedTask(null);
      fetchData();
      fetchSuccess(res?.data?.message);
    } catch (error) {
      fetchError("Failed to update status");
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setSelectedTask(null);
  };

  const columns = [
    { name: "category_name", label: "Category" },
    { name: "title", label: "Title" },
    { name: "description", label: "Description" },
    { name: "location", label: "Location" },
    { name: "assignee_name", label: "Assignee" },
    { name: "status_name", label: "Status" },
    {
      name: "Actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const task = rows[dataIndex];
          return (
            <>
              <IconButton
                color="primary"
                onClick={() => navigate(`/tasks/view-task/${task.task_id}`)}
              >
                <Visibility />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => navigate(`/tasks/edit-task/${task.task_id}`)}
              >
                <EditIcon />
              </IconButton>
              {/* <IconButton color="primary" onClick={() => handleEditClick(task)}>
                <EditIcon />
              </IconButton> */}
              <IconButton color="error" onClick={() => handleDeleteClick(task.task_id)}>
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
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
          <SoftButton
            variant="gradient"
            className="add-usr-button"
            onClick={() => navigate(`/tasks/add-task`)}
          >
            Add Task
          </SoftButton>
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
            <MUIDataTable title={"Manage Tasks"} data={rows} columns={columns} options={options} />
          </ThemeProvider>
        </SoftBox>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <SoftButton onClick={handleCancelDelete} color="secondary">
            Cancel
          </SoftButton>
          <SoftButton onClick={handleConfirmDelete} color="error">
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
        <DialogTitle>Edit Task Status</DialogTitle>
        <DialogContent>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: "bold" }}>
            Select Status
          </FormLabel>
          <RadioGroup value={newStatus} onChange={handleStatusChange}>
            <FormControlLabel value="Pending" control={<Radio />} label="Pending" />
            <FormControlLabel value="In Progress" control={<Radio />} label="In Progress" />
            <FormControlLabel value="On Hold" control={<Radio />} label="On Hold" />
            <FormControlLabel value="Done" control={<Radio />} label="Done" />
            <FormControlLabel value="Closed" control={<Radio />} label="Closed" />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end", mt: 2 }}>
          <SoftButton onClick={handleCancelEdit} className="cancel-button">
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

export default TasksList;
