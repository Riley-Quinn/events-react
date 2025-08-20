import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Switch,
  FormControl,
  FormGroup,
  Chip,
  Box,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SoftBox from "components/SoftBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftButton from "components/SoftButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import authAxios from "authAxios";
import { Visibility, Clear } from "@mui/icons-material";
import { Tooltip, Typography } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAbility } from "contexts/AbilityContext";

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

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const TasksList = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isFromDashboard, setIsFromDashboard] = useState(false);

  const token = localStorage.getItem("token");
  const ability = useAbility();
  useEffect(() => {
    const referrer = document.referrer;
    setIsFromDashboard(referrer.includes("/dashboard"));
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const statusParam = urlParams.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
      setIsFromDashboard(true);
    } else {
      setStatusFilter(null);
    }
  }, [location.search]);

  const fetchData = useCallback(async () => {
    try {
      const response = await authAxios.get(`/tasks?all=${showAll}`);
      setRows(response.data.list);
    } catch (error) {
      console.error("Unable to fetch tasks", error);
    }
  }, [showAll]);

  useEffect(() => {
    let filtered = [...rows];

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status_name === statusFilter);
    } else if (!isFromDashboard && !showAll) {
      const today = new Date().toLocaleDateString("en-CA");
      filtered = filtered.filter((task) => {
        if (!task.start_date) return false;
        const taskDate = new Date(task.start_date).toLocaleDateString("en-CA");
        return taskDate === today;
      });
    }

    setFilteredRows(filtered);
  }, [rows, statusFilter, showAll, isFromDashboard]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    // Reorder locally first for responsive UI
    const reordered = reorder(filteredRows, result.source.index, result.destination.index);
    console.log("ttttt:", reordered);
    setFilteredRows(reordered);

    try {
      // Calculate new priorities based on position (1-based index)
      const updatedTasks = reordered.map((task, index) => ({
        task_id: task.task_id,
        priority: index + 1,
      }));

      // Send to backend
      await authAxios.post("/tasks/update-priority", {
        tasks: updatedTasks,
      });

      fetchSuccess("Task order updated successfully");
    } catch (error) {
      fetchError("Failed to update task order");
      // Revert local changes if API fails
      fetchData();
    }
  };

  const clearStatusFilter = () => {
    setStatusFilter(null);
    navigate("/tasks");
  };

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
        Open: 1,
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
            {!isFromDashboard && !showAll && !statusFilter && (
              <Chip label="Showing today's tasks" color="info" variant="outlined" />
            )}
          </Box>
          <div style={{ display: "flex", gap: "16px" }}>
            <FormControl component="fieldset">
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAll}
                      onChange={(e) => setShowAll(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show All Tasks"
                />
              </FormGroup>
            </FormControl>
            {ability.can("add", "Task") && (
              <SoftButton
                variant="gradient"
                className="add-usr-button"
                onClick={() => navigate(`/tasks/add-task`)}
              >
                Add Task
              </SoftButton>
            )}
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable-table">
                {(provided) => (
                  <TableContainer
                    component={Paper}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Start Date</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Assign To</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRows.map((row, index) => (
                          <Draggable
                            key={row.task_id}
                            draggableId={row.task_id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  background: snapshot.isDragging ? "#f0f0f0" : "inherit",
                                }}
                              >
                                <TableCell>
                                  {row.start_date
                                    ? new Date(row.start_date).toLocaleDateString()
                                    : "-"}
                                </TableCell>
                                <TableCell>{row.category_name}</TableCell>
                                <TableCell>
                                  <Tooltip title={row.title} arrow>
                                    <Typography
                                      noWrap
                                      sx={{
                                        maxWidth: 150,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {row.title}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={row.description}>
                                    <Typography
                                      noWrap
                                      sx={{
                                        maxWidth: 150,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {row.description}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={row.location} arrow>
                                    <Typography
                                      noWrap
                                      sx={{
                                        maxWidth: 150,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {row.location}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>{row.assignee_name}</TableCell>
                                <TableCell>{row.status_name}</TableCell>
                                <TableCell>
                                  {ability.can("view", "Task") && (
                                    <IconButton
                                      color="primary"
                                      onClick={() => navigate(`/tasks/view-task/${row.task_id}`)}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  )}
                                  <IconButton
                                    color="primary"
                                    onClick={() => navigate(`/tasks/edit-task/${row.task_id}`)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  {ability.can("delete", "Task") && (
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteClick(row.task_id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Droppable>
            </DragDropContext>
          </ThemeProvider>
        </SoftBox>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
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
            <FormControlLabel value="Open" control={<Radio />} label="Open" />
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
