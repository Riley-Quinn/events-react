//viewtaskpage

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAxios from "authAxios";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  stepConnectorClasses,
  CardContent,
  Card,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CommentBox from "layouts/Comments";
import PropTypes from "prop-types";

// Custom stepper connector
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 3,
    borderRadius: 1,
    borderColor: "#e0e0e0",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: "#4caf50",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: "#4caf50",
  },
}));

const ViewTask = () => {
  const { task_id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFlow, setStatusFlow] = useState([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const [taskRes, trackerRes] = await Promise.all([
          authAxios.get(`/tasks/${task_id}`),
          authAxios.get(`/tasks/${task_id}/status-flow`),
        ]);
        setTask(taskRes.data);
        setStatusFlow(trackerRes.data.flow || []);
      } catch (error) {
        console.error("Failed to fetch task or status tracker", error);
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

  const activeIndex = statusFlow.findIndex((status) => status === task.status_name);

  const sectionStyle = {
    backgroundColor: "#f9f9f9",
    padding: 2,
    height: "100%",
    borderRadius: 2,
    boxShadow: 1,
    display: "flex",
    flexDirection: "column",
  };

  const CustomStepIcon = (props) => {
    const { active, completed, className, icon } = props;

    return (
      <div
        className={className}
        style={{
          backgroundColor: completed ? "#e6762d" : "#e0e0e0",
          color: "#fff",
          borderRadius: "50%",
          width: 25,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          zIndex: 1,
          position: "relative",
        }}
      >
        {completed ? "✔" : icon}
      </div>
    );
  };

  CustomStepIcon.propTypes = {
    active: PropTypes.bool,
    completed: PropTypes.bool,
    className: PropTypes.string,
    icon: PropTypes.node,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom mb={2}>
          Task Details
        </Typography>
        <Grid sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Grid item xs={12} md={12} sm={12}>
            <Card sx={{ ...sectionStyle, minHeight: 200, overflowX: "auto" }}>
              <CardContent>
                <div style={{ width: "100%", marginTop: 20 }}>
                  <Typography variant="h6" gutterBottom>
                    Status Tracker
                  </Typography>
                  <Stepper
                    alternativeLabel
                    connector={<ColorConnector />}
                    sx={{ flexWrap: "wrap", justifyContent: "center" }}
                  >
                    {statusFlow.map((step, index) => (
                      <Step key={index} completed>
                        <StepLabel
                          StepIconComponent={CustomStepIcon}
                          optional={
                            step.changed_at && step.changed_by ? (
                              <Typography variant="caption">
                                Created by {step.changed_by}
                                <br />
                                {new Date(step.changed_at).toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </Typography>
                            ) : null
                          }
                        >
                          {step.name}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  ...sectionStyle,
                  minHeight: 400,
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Grid container spacing={2} flexWrap="wrap">
                    {[
                      { label: "Title", value: task.title },
                      { label: "Category", value: task.category_name },
                      { label: "Location", value: task.location },
                      { label: "Assignee", value: task.assignee_name },
                      { label: "Status", value: task.status_name },
                      { label: "Description", value: task.description },
                    ].map((item, index) => (
                      <React.Fragment key={index}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.label}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={8}
                          sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflowY: "auto",
                            pr: 1,
                            width: "100%",
                          }}
                        >
                          <Typography variant="body1">{item.value}</Typography>
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

            {/* Comment Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ flex: 1, height: "600px" }}>
                <CommentBox module="task" moduleId={task_id} />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ViewTask;
