import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAxios from "authAxios";
import { Card, Typography, CircularProgress, Divider, Button, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import SoftBox from "components/SoftBox";

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

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  if (!task) return <Typography>No Task Found</Typography>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card sx={{ padding: 4, maxWidth: "800px", margin: "20px auto" }}>
        <Typography variant="h5" gutterBottom>
          Task Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Title</Typography>
            <Typography>{task.title}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Category</Typography>
            <Typography>{task.category_name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Location</Typography>
            <Typography>{task.location}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Assignee</Typography>
            <Typography>{task.assignee_name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Status</Typography>
            <Typography>{task.status_name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Description</Typography>
            <Typography>{task.description}</Typography>
          </Grid>
        </Grid>

        <SoftBox mt={4} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </SoftBox>
      </Card>
    </DashboardLayout>
  );
};

export default ViewTask;
