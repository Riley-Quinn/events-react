//SubCategoriesList.js

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
  ];
  console.log("Subcategories:", subCategories);
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card style={{ padding: "24px", margin: "16px auto", maxWidth: "2000px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
          <SoftButton
            variant="gradient"
            className="add-usr-button"
            onClick={() => setIsAddOpen(true)}
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

      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Sub-Category</DialogTitle>
        <DialogContent>
          <AddSubCategory
            // categories={categoryData}
            onClose={() => {
              setIsAddOpen(false);
              fetchData();
              subcatfetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubCategoriesList;
