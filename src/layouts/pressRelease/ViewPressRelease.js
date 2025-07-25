import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAxios from "authAxios";
import { Box, Typography, Button, Grid, CircularProgress } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CommentBox from "layouts/Comments";

const ViewPressRelease = () => {
  const { pressId } = useParams();
  const navigate = useNavigate();
  const [pressRelease, setPressRelease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPressRelease = async () => {
      try {
        const res = await authAxios.get(`/press-release/${pressId}`);
        setPressRelease(res.data);
      } catch (error) {
        console.error("Failed to fetch pressRelease", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPressRelease();
  }, [pressId]);

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

  if (!pressRelease) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">No Press Release Found</Typography>
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
          Press Release Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                ...sectionStyle,
                height: "600px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Grid container spacing={2}>
                  {[
                    { label: "Title", value: pressRelease.title },
                    { label: "Created By", value: pressRelease.createdby_name },
                    { label: "Assignee", value: pressRelease.assignee_name },
                    { label: "Notes", value: pressRelease.notes },
                    { label: "Status", value: pressRelease.status_name },
                  ].map((item, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                          {item.value}
                        </Typography>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>

              {/* Back button at bottom */}
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ height: "600px" }}>
              <CommentBox module={"press_release"} moduleId={pressId} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ViewPressRelease;
