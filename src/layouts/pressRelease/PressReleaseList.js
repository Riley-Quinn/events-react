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
  Chip,
  Box,
  Switch,
  FormControl,
  FormGroup,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Typography,
  TableRow,
  Paper,
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
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isFromDashboard, setIsFromDashboard] = useState(false);
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
      const response = await authAxios.get("/press-release/");
      // Sort by priority if available, otherwise by created_at
      const sortedData = response.data.list.sort((a, b) => {
        if (a.priority !== undefined && b.priority !== undefined) {
          return a.priority - b.priority;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setRows(sortedData);
    } catch (error) {
      console.error("Unable to fetch press releases", error);
      fetchError("Failed to load press releases");
    }
  }, [fetchError]);

  useEffect(() => {
    let filtered = [...rows];

    if (statusFilter) {
      filtered = filtered.filter((press) => press.status_name === statusFilter);
    } else if (!isFromDashboard && !showAll) {
      filtered = filtered.filter((press) => press.status_name === "Draft");
    }

    setFilteredRows(filtered);
  }, [rows, statusFilter, showAll, isFromDashboard]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = reorder(filteredRows, result.source.index, result.destination.index);
    setFilteredRows(reordered);

    try {
      const updatedPressReleases = reordered.map((press, index) => ({
        press_id: press.press_id,
        priority: index + 1,
      }));

      await authAxios.post("/press-release/update-priority", {
        press: updatedPressReleases,
      });

      fetchSuccess("Press release order updated successfully");
    } catch (error) {
      fetchError("Failed to update press release order");
      fetchData();
    }
  };

  const clearStatusFilter = () => {
    setStatusFilter(null);
    navigate("/press-release");
  };

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
              <Chip label="Showing Drafts Only" color="info" variant="outlined" />
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
                  label="Show All Press Releases"
                />
              </FormGroup>
            </FormControl>
            {ability.can("add", "PressRelease") && (
              <SoftButton
                variant="gradient"
                className="add-usr-button"
                onClick={() => navigate(`/press-release/add-press`)}
              >
                Add Press Release
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
                          <TableCell>Title</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Assignee</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRows.map((row, index) => (
                          <Draggable
                            key={row.press_id}
                            draggableId={row.press_id.toString()}
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
                                  cursor: "grab",
                                }}
                                hover
                              >
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
                                  <Tooltip title={row.notes}>
                                    <Typography
                                      noWrap
                                      sx={{
                                        maxWidth: 150,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {row.notes}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>{row.assignee_name}</TableCell>
                                <TableCell>{row.status_name}</TableCell>
                                <TableCell>
                                  <IconButton
                                    color="primary"
                                    onClick={() => navigate(`/edit-press/${row.press_id}`)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  {ability.can("view", "PressRelease") && (
                                    <IconButton
                                      color="primary"
                                      onClick={() =>
                                        navigate(`/press-release/view-press/${row.press_id}`)
                                      }
                                    >
                                      <Visibility />
                                    </IconButton>
                                  )}
                                  {ability.can("delete", "PressRelease") && (
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteClick(row.press_id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  )}
                                  {/* <IconButton
                                    color="secondary"
                                    onClick={() => handleEditClick(row)}
                                  >
                                    <EditIcon />
                                  </IconButton> */}
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
    </DashboardLayout>
  );
};

export default PressReleaseList;
