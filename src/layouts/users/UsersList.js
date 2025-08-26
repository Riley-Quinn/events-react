import * as React from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Card,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Switch,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SoftBox from "components/SoftBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftButton from "components/SoftButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
import authAxios from "authAxios";
import { useFetchUsers } from "contexts/fetchUsersContext";

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

const UsersList = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const { setUsersList } = useFetchUsers();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    try {
      const response = await authAxios.get("/auth/users");
      setUsersList(response.data);
      setRows(response.data);
    } catch (error) {
      console.error("Unable to get users", error);
      fetchError("Failed to fetch users");
    }
  }, [token, fetchError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await authAxios.delete(`/auth/users/${selectedUserId}`);
      fetchSuccess(res.data.message);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      fetchError("Failed to delete user", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleStatus = async (user, isActive) => {
    const previousState = [...rows];
    const updatedRows = rows.map((u) =>
      u.id === user.id ? { ...u, is_active: isActive ? 1 : 0 } : u
    );
    setRows(updatedRows);

    try {
      await authAxios.put(`/auth/users/${user.id}`, { is_active: isActive ? 1 : 0 });
      fetchSuccess(`User ${isActive ? "Activated" : "Deactivated"} successfully`);
    } catch (error) {
      setRows(previousState); // Rollback in case of error
      fetchError("Failed to update user status", error);
    }
  };

  const columns = [
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "address", label: "Address" },
    { name: "role_name", label: "Role" },
    {
      name: "is_active",
      label: "Status",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const user = rows[tableMeta.rowIndex];
          return (
            <Switch
              checked={!!user.is_active} // Convert 1/0 to boolean
              onChange={(event) => handleStatus(user, event.target.checked)}
              color="primary"
            />
          );
        },
      },
    },
    {
      name: "Actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const user = rows[dataIndex];
          return (
            <>
              <IconButton color="primary" onClick={() => navigate(`/users/edit-user/${user.id}`)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteClick(user.id)}>
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
            color="info"
            onClick={() => navigate(`/users/add-user`)}
            className="add-usr-button"
          >
            Add User
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
            <MUIDataTable title={"Manage Users"} data={rows} columns={columns} options={options} />
          </ThemeProvider>
        </SoftBox>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action can not be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            variant="gradient"
            className="add-usr-button"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="gradient"
            className="cancel-button"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default UsersList;
