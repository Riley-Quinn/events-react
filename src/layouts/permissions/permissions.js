import * as React from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import SoftBox from "components/SoftBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftButton from "components/SoftButton";
import axios from "axios";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";

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

const ManagePermissions = () => {
  const { fetchError, fetchSuccess } = useSnackbar();
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [permissions, setPermissions] = React.useState([]);
  const [rolePermissions, setRolePermissions] = React.useState([]);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState(null);
  const [editedName, setEditedName] = React.useState("");

  const token = localStorage.getItem("token");

  // Fetch roles & permissions
  const fetchData = React.useCallback(async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axios.get("http://localhost:4000/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:4000/api/permissions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRows(rolesRes.data.filter((role) => role.id !== 1));
      setPermissions(permsRes.data);
    } catch (error) {
      console.error("Unable to get roles or permissions", error);
    }
  }, [token]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Edit Button
  const handleEditClick = async (role) => {
    setEditingRole(role);
    setEditedName(role.name);

    try {
      const res = await axios.get(`http://localhost:4000/api/permissions/${role.id}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = res.data.map((p) => p.id);
      setRolePermissions(ids);
      setOpenEdit(true);
    } catch (err) {
      console.error("Failed to fetch role permissions", err);
      setRolePermissions([]);
      setOpenEdit(true);
    }
  };

  // Handle checkbox toggle
  const togglePermission = (permissionId) => {
    setRolePermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Save changes (role name & permissions)
  const handleSave = async () => {
    try {
      // Update role name
      await axios.put(
        `http://localhost:4000/api/roles/${editingRole.id}`,
        { name: editedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update permissions
      const res = await axios.put(
        `http://localhost:4000/api/permissions/${editingRole.id}/permissions`,
        { permissionIds: rolePermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local roles state
      setRows((prev) =>
        prev.map((role) => (role.id === editingRole.id ? { ...role, name: editedName } : role))
      );

      setOpenEdit(false);
      setEditingRole(null);
      setEditedName("");
      fetchSuccess(res?.data?.message);
    } catch (err) {
      fetchError("Failed to save", err);
    }
  };

  const columns = [
    { name: "name", label: "Roles" },
    {
      name: "actions",
      label: "Actions",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const role = rows[dataIndex];
          return (
            <Button
              variant="contained"
              className="add-usr-button"
              size="small"
              onClick={() => handleEditClick(role)}
            >
              Manage Permissions
            </Button>
          );
        },
      },
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "24px", margin: "16px auto", maxWidth: "2000px" }}>
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
              title={"Manage Roles & Permissions"}
              data={rows}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </SoftBox>
      </Card>

      {/* Edit Role & Permissions Modal */}
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
          <Typography variant="h5">Manage Role Permissions</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Permissions
            </Typography>
            <FormGroup>
              {permissions.map((perm) => (
                <FormControlLabel
                  key={perm.id}
                  control={
                    <Checkbox
                      checked={rolePermissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                    />
                  }
                  label={`${perm.action.toUpperCase()} ${perm.subject}`}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end", mt: 2 }}>
          <SoftButton className="cancel-button" onClick={() => setOpenEdit(false)}>
            Cancel
          </SoftButton>
          <SoftButton className="add-usr-button" variant="gradient" onClick={handleSave}>
            Save
          </SoftButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManagePermissions;
