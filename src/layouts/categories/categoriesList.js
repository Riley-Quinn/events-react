import * as React from "react";
import { Dialog, DialogTitle, DialogContent, Card } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MUIDataTable from "mui-datatables";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import axios from "axios";
import Switch from "@mui/material/Switch";
import AddCategory from "./AddCategories";
import dayjs from "dayjs";

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

const CategoriesList = () => {
  const [categoryData, setCategoryData] = React.useState([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/categories");
      setCategoryData(response?.data?.list);
    } catch (error) {
      console.error("Error: ", error);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatus = async (data, isActive) => {
    try {
      await axios.put(`http://localhost:4000/api/categories/${data?.category_id}`, {
        is_active: isActive,
      });
      fetchData();
    } catch (error) {
      console.error(error.response.data.error);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY, h:mm A");
  };
  const columns = [
    { name: "name", label: "Category Name" },
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
              Add Category
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

      {/* Add Category Modal */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <AddCategory
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

export default CategoriesList;
