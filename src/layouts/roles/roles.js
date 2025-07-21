import * as React from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Card,
  Button,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  DialogContentText,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SoftBox from "components/SoftBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftButton from "components/SoftButton";
import axios from "axios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import AddRole from "./AddRole";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
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

const ManageRoles = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState(null);
  const [editedName, setEditedName] = React.useState("");
  const [error, setError] = React.useState("");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchData = React.useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(response.data);
    } catch (error) {
      console.error("Unable to get roles", error);
    }
  }, [token]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (role) => {
    setEditingRole(role);
    setEditedName(role.name);
    setError("");
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    if (!editedName.trim()) {
      setError("Role name cannot be empty");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:4000/api/roles/${editingRole.id}`,
        { name: editedName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRows((prevRows) =>
        prevRows.map((role) => (role.id === editingRole.id ? { ...role, name: editedName } : role))
      );

      setOpenEdit(false);
      setEditingRole(null);
      setEditedName("");
      setError("");
      fetchSuccess(res?.data?.message);
    } catch (err) {
      fetchError("Failed to update role name", err);
    }
  };
  const handleStatus = async (data, isActive) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `http://localhost:4000/api/roles/${data?.id}`,
        { is_active: isActive }, // true/false works fine if DB column is boolean/tinyint(1)
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchData();
      fetchSuccess(res?.data?.message);
    } catch (error) {
      console.error(error.response?.data?.error || "Error updating status");
    }
  };
  const handleDeleteClick = (roleId) => {
    setSelectedRoleId(roleId);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      const res = await axios.delete(`http://localhost:4000/api/roles/${selectedRoleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSuccess(res.data.message);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      fetchError("Failed to delete user", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedRoleId(null);
  };

  const columns = [
    { name: "name", label: "Roles" },
    {
      name: "is_active",
      label: "Status",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const { currentTableData, rowIndex } = tableMeta;
          const data = tableMeta?.tableData[currentTableData[rowIndex]?.index];
          return (
            <Switch
              checked={value}
              onChange={(event) => handleStatus(data, event.target.checked)}
              color="primary"
            />
          );
        },
      },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const role = rows[dataIndex];
          return (
            <>
              <Button
                variant="contained"
                className="add-usr-button"
                size="small"
                onClick={() => handleEditClick(role)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                className="delete-btn"
                size="small"
                onClick={() => handleDeleteClick(role.id)}
              >
                Delete
              </Button>
            </>
          );
        },
      },
    },
  ];

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <Card style={{ padding: "24px", margin: "16px auto", maxWidth: "2000px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
            <SoftButton
              variant="gradient"
              className="add-usr-button"
              onClick={() => setIsAddOpen(true)}
            >
              Add Role
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
              <MUIDataTable
                title={"Manage Roles"}
                data={rows}
                columns={columns}
                options={options}
              />
            </ThemeProvider>
          </SoftBox>
        </Card>

        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              padding: "24px",
            },
          }}
        >
          <DialogTitle>
            <Typography variant="h5">Edit Role</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                value={editedName}
                onChange={(e) => {
                  setEditedName(e.target.value);
                  if (e.target.value.trim() !== "") {
                    setError("");
                  }
                }}
                variant="outlined"
                error={!!error}
                helperText={error}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "flex-end", mt: 2 }}>
            <SoftButton className="cancel-button" onClick={() => setOpenEdit(false)}>
              Cancel
            </SoftButton>
            <SoftButton className="add-usr-button" variant="gradient" onClick={handleEditSave}>
              Save
            </SoftButton>
          </DialogActions>
        </Dialog>
        <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <AddRole
            onClose={() => {
              setIsAddOpen(false);
              fetchData(); // Refresh list after adding
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageRoles;
