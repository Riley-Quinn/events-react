import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAxios from "authAxios";
import { Box, Typography, Button, Grid, CircularProgress } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CommentBox from "layouts/Comments";

const ViewTask = () => {
  const { task_id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await authAxios.get(`/tasks/${task_id}`);
        setTask(res.data);
      } catch (error) {
        console.error("Failed to fetch task", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [task_id]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box sx={{ p: 3 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">No Task Found</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const sectionStyle = {
    backgroundColor: "#f9f9f9", // light grey or any theme color
    padding: 2,
    height: "100%", // allows both to fill Grid height
    borderRadius: 2,
    boxShadow: 1,
    display: "flex",
    flexDirection: "column",
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom mb={2}>
          Task Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{ ...sectionStyle, height: "600px", display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ flex: 1 }}>
                <Grid container spacing={2}>
                  {[
                    { label: "Title", value: task.title },
                    { label: "Category", value: task.category_name },
                    { label: "Location", value: task.location },
                    { label: "Assignee", value: task.assignee_name },
                    { label: "Status", value: task.status_name },
                    { label: "Description", value: task.description },
                  ].map((item, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: "pre-wrap", // keeps line breaks and wraps long text
                            wordBreak: "break-word", // ensures long words break properly
                            maxHeight: item.label === "Description" ? "200px" : "auto", // limit height for description
                            overflowY: item.label === "Description" ? "auto" : "unset", // scroll if content overflows
                          }}
                        >
                          {item.value}
                        </Typography>{" "}
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>

              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: "600px" }}>
              <CommentBox module={"task"} moduleId={task_id} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ViewTask;
