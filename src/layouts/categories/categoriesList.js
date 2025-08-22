import * as React from "react";
import { Dialog, DialogTitle, DialogContent, Card, IconButton, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MUIDataTable from "mui-datatables";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import Switch from "@mui/material/Switch";
import AddCategory from "./AddCategories";
import AddSubCategory from "layouts/subCategory/AddSubCategory";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import authAxios from "authAxios";

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
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "8px 16px",
          },
        },
      },
    },
  });

const CategoriesList = () => {
  const [categoryData, setCategoryData] = React.useState([]);
  const [subCategories, setSubCategories] = React.useState([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState(null);
  const [editSubCategory, setEditSubCategory] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteSubDialogOpen, setDeleteSubDialogOpen] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    try {
      const response = await authAxios.get("/categories");
      setCategoryData(response?.data?.list);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const subcatfetch = React.useCallback(async () => {
    try {
      const info = await authAxios.get("/sub-category");
      setSubCategories(info?.data?.list);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    subcatfetch();
  }, [fetchData, subcatfetch]);

  const getSubcategoriesForCategory = (categoryId) => {
    return subCategories.filter((sub) => sub.category_id === categoryId);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY, h:mm A");
  };

  const handleStatus = async (data, isActive) => {
    try {
      await authAxios.put(`/categories/${data.category_id}`, {
        is_active: isActive,
      });
      setCategoryData((prev) =>
        prev.map((item) =>
          item.category_id === data.category_id ? { ...item, is_active: isActive } : item
        )
      );
    } catch (error) {
      console.error("Error updating category status:", error);
    }
  };

  const handleSubcategoryStatus = async (data, isActive) => {
    try {
      setSubCategories((prev) =>
        prev.map((sub) =>
          sub.sub_category_id === data.sub_category_id ? { ...sub, is_active: isActive } : sub
        )
      );

      await authAxios.put(`/sub-category/${data.sub_category_id}`, {
        is_active: isActive,
      });

      await subcatfetch();
    } catch (error) {
      setSubCategories((prev) =>
        prev.map((sub) =>
          sub.sub_category_id === data.sub_category_id ? { ...sub, is_active: !isActive } : sub
        )
      );
      console.error("Error updating subcategory status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await authAxios.delete(`/categories/${selectedCategoryId}`);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleDeleteSubcategory = async () => {
    try {
      await authAxios.delete(`/sub-category/${selectedSubCategoryId}`);
      setDeleteSubDialogOpen(false);
      subcatfetch();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Subcategory columns
  // Subcategory columns
  const subcategoryColumns = [
    {
      name: "sub_category_id",
      label: "ID",
      options: {
        display: false,
        filter: false,
      },
    },
    {
      name: "name",
      label: "Subcategory Name",
      options: {
        filter: false,
      },
    },
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
          const subCategoryId = tableMeta.rowData[0];
          const subCategory = subCategories.find((sub) => sub.sub_category_id == subCategoryId);

          if (!subCategory) return null;

          return (
            <Switch
              checked={!!subCategory.is_active}
              onChange={(e) => handleSubcategoryStatus(subCategory, e.target.checked)}
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
        customBodyRender: (value, tableMeta) => {
          const subCategoryId = tableMeta.rowData[0];
          const subCategory = subCategories.find((sub) => sub.sub_category_id == subCategoryId);

          if (!subCategory) return null;

          return (
            <>
              <IconButton
                color="primary"
                onClick={() => {
                  setEditSubCategory(subCategory);
                  setIsAddSubCategoryOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  setSelectedSubCategoryId(subCategory.sub_category_id);
                  setDeleteSubDialogOpen(true);
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

  // Main category columns
  const columns = [
    {
      name: "category_id",
      label: "ID",
      options: {
        display: false,
        filter: false,
      },
    },
    {
      name: "name",
      label: "Category Name",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const categoryId = categoryData[rowIndex]?.category_id;
          const count = getSubcategoriesForCategory(categoryId).length;

          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>{value}</span>
              {count > 0 && (
                <span style={{ marginLeft: "8px", color: "#666", fontSize: "0.85rem" }}>
                  ({count})
                </span>
              )}
            </div>
          );
        },
      },
    },
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
          const data = categoryData[rowIndex];
          return (
            <Switch
              checked={!!value}
              onChange={(e) => handleStatus(data, e.target.checked)}
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
          const row = categoryData[dataIndex];
          return (
            <>
              <IconButton color="primary" onClick={() => setEditCategory(row)}>
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  setSelectedCategoryId(row.category_id);
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

  const options = {
    selectableRows: "none",
    selectableRowsHeader: false,
    elevation: 0,
    expandableRows: true,
    expandableRowsHeader: false,
    renderExpandableRow: (rowData, rowMeta) => {
      const categoryId = rowData[0];
      const subcategories = getSubcategoriesForCategory(categoryId);

      return (
        <tr>
          <td colSpan={rowData.length + 1} style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
            <Box sx={{ marginLeft: "32px" }}>
              <ThemeProvider theme={getMuiTheme}>
                <MUIDataTable
                  title=""
                  data={subcategories}
                  columns={subcategoryColumns}
                  options={{
                    selectableRows: "none",
                    selectableRowsHeader: false,
                    elevation: 0,
                    search: false,
                    download: false,
                    print: false,
                    viewColumns: false,
                    filter: false,
                  }}
                />
              </ThemeProvider>
            </Box>
          </td>
        </tr>
      );
    },
  };

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
              Add Category
            </SoftButton>
            <SoftButton
              variant="gradient"
              className="add-usr-button"
              onClick={() => setIsAddSubCategoryOpen(true)}
            >
              Add Subcategory
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
                title={"Manage Categories"}
                data={categoryData}
                columns={columns}
                options={options}
              />
            </ThemeProvider>
          </SoftBox>
        </Card>
      </DashboardLayout>

      {/* Modals */}
      <Dialog
        open={isAddOpen || !!editCategory}
        onClose={() => {
          setIsAddOpen(false);
          setEditCategory(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogContent>
          <AddCategory
            initialData={editCategory}
            onClose={() => {
              setIsAddOpen(false);
              setEditCategory(null);
              fetchData();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddSubCategoryOpen || !!editSubCategory}
        onClose={() => {
          setIsAddSubCategoryOpen(false);
          setEditSubCategory(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editSubCategory ? "Edit Subcategory" : "Add New Subcategory"}</DialogTitle>
        <DialogContent>
          <AddSubCategory
            editSubCategory={editSubCategory}
            setEditSubCategory={setEditSubCategory}
            onClose={() => {
              setIsAddSubCategoryOpen(false);
              setEditSubCategory(null);
              fetchData();
              subcatfetch();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Category Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Category Deletion</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this category?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <SoftButton
              variant="gradient"
              className="cancel-button"
              onClick={() => setDeleteDialogOpen(false)}
              style={{ marginRight: "8px" }}
            >
              Cancel
            </SoftButton>
            <SoftButton variant="gradient" className="add-usr-button" onClick={handleDelete}>
              Delete
            </SoftButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subcategory Delete Dialog */}
      <Dialog open={deleteSubDialogOpen} onClose={() => setDeleteSubDialogOpen(false)}>
        <DialogTitle>Confirm Subcategory Deletion</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this subcategory?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <SoftButton
              variant="gradient"
              className="cancel-button"
              onClick={() => setDeleteSubDialogOpen(false)}
              style={{ marginRight: "8px" }}
            >
              Cancel
            </SoftButton>
            <SoftButton
              variant="gradient"
              className="add-usr-button"
              onClick={handleDeleteSubcategory}
            >
              Delete
            </SoftButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoriesList;
