import * as React from "react";
import { Dialog, DialogTitle, DialogContent, Card } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MUIDataTable from "mui-datatables";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import authAxios from "authAxios";
import Switch from "@mui/material/Switch";
import dayjs from "dayjs";
import AddSubCategory from "./AddSubCategory";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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

const SubCategoriesList = () => {
  const [categoryData, setCategoryData] = React.useState([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [subCategories, setSubCategories] = React.useState([]);
  const [editSubCategory, setEditSubCategory] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = React.useState(null);
  const subcategoryData = subCategories || [];

  const fetchData = React.useCallback(async () => {
    try {
      const response = await authAxios.get("/categories");
      setCategoryData(response?.data?.list);
    } catch (error) {
      console.error("Error: ", error);
    }
  }, []);

  const subcatfetch = React.useCallback(async () => {
    try {
      const info = await authAxios.get("/sub-category");
      setSubCategories(info?.data?.list);
    } catch (err) {
      console.error("Errorsub:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    subcatfetch();
  }, [fetchData, subcatfetch]);

  const handleStatus = async (data, isActive) => {
    try {
      await authAxios.put(`/sub-category/${data?.sub_category_id}`, {
        is_active: isActive,
      });
      subcatfetch();
    } catch (error) {
      console.error(error.response.data.error);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY, h:mm A");
  };

  const columns = [
    { name: "category_name", label: "Category Name" },
    { name: "name", label: "Sub-Category Name" },
    {
      name: "created_at",
      label: "Created At",
      options: {
        filter: false,
        customBodyRender: (value) => formatDate(value),
      },
    },
    {
      name: "is_active",
      label: "Status",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const data = subCategories[rowIndex];
          return (
            <Switch
              checked={!!value}
              onChange={(event) => handleStatus(data, event.target.checked)}
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
          const row = subcategoryData[dataIndex];
          return (
            <>
              <IconButton
                color="primary"
                onClick={() => {
                  setEditSubCategory(row);
                  setIsAddOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  setSelectedSubCategoryId(row.sub_category_id);
                  setDeleteDialogOpen(true);
                }}
              >
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
            onClick={() => {
              setEditSubCategory(null);
              setIsAddOpen(true);
            }}
          >
            Add Sub-Category
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
              title={"Manage Sub-Categories"}
              data={subCategories}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </SoftBox>
      </Card>

      <Dialog
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditSubCategory(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editSubCategory ? "Edit Sub-Category" : "Add New Sub-Category"}</DialogTitle>
        <DialogContent>
          <AddSubCategory
            categories={categoryData}
            onClose={() => {
              setIsAddOpen(false);
              subcatfetch();
            }}
            editSubCategory={editSubCategory}
            setEditSubCategory={setEditSubCategory}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this sub-category?</p>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}
          >
            <SoftButton
              onClick={() => setDeleteDialogOpen(false)}
              variant="gradient"
              className="add-usr-button"
            >
              Cancel
            </SoftButton>
            <SoftButton
              variant="gradient"
              className="cancel-button"
              onClick={async () => {
                try {
                  await authAxios.delete(`/sub-category/${selectedSubCategoryId}`);
                  setDeleteDialogOpen(false);
                  subcatfetch(); // refresh data
                } catch (err) {
                  console.error("Delete failed", err);
                }
              }}
            >
              Delete
            </SoftButton>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubCategoriesList;
