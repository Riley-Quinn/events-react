import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import { useAbility } from "../../contexts/AbilityContext";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";

// Soft UI Dashboard React base styles
import typography from "assets/theme/base/typography";

// Dashboard layout components
import BuildByDevelopers from "layouts/dashboard/components/BuildByDevelopers";
import WorkWithTheRockets from "layouts/dashboard/components/WorkWithTheRockets";
import Projects from "layouts/dashboard/components/Projects";
import OrderOverview from "layouts/dashboard/components/OrderOverview";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";
import { Typography } from "@mui/material";
import authAxios from "authAxios";

function Dashboard() {
  const { size } = typography;
  const { chart, items } = reportsBarChartData;
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const ability = useAbility(); // ✅ CASL ability instance
  const [userCount, setUserCount] = useState(0);
  const [rolesCount, setRolesCount] = useState(0);
  const [pressStatusCounts, setPressStatusCounts] = useState({
    Draft: 0,
    "Open for Review": 0,
    "Ready to Publish": 0,
    "Feedback Pending": 0,
    Unpublish: 0,
    Published: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    Open: 0,
    Pending: 0,
    "In Progress": 0,
    "On Hold": 0,
    Done: 0,
    Closed: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch users count
    const fetchUsers = async () => {
      try {
        const res = await authAxios.get("/auth/users");
        setUserCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch (err) {
        console.error("Failed to fetch users count", err);
      }
    };

    // Fetch tasks count by status
    const fetchTasks = async () => {
      try {
        console.log("⏳ Fetching tasks…");
        const res = await authAxios.get("/tasks");
        console.log("✅ /api/tasks response:", res.data);
        const tasks = Array.isArray(res.data.list) ? res.data.list : [];
        // tally up by their status field (e.g. status_name or status)
        const counts = tasks.reduce(
          (acc, t) => {
            // use the correct property from your task object:
            const s = t.status_name ?? t.status;
            if (acc[s] !== undefined) acc[s] += 1;
            return acc;
          },
          {
            Open: 0,
            Pending: 0,
            "In Progress": 0,
            "On Hold": 0,
            Done: 0,
            Closed: 0,
          }
        );
        console.log("🔢 Computed statusCounts:", counts);
        setStatusCounts(counts);
      } catch (err) {
        console.error("Failed to fetch tasks count", err);
      }
    };
    // Fetch press release counts by status
    const fetchPressReleases = async () => {
      try {
        console.log("⏳ Fetching press releases…");
        const res = await authAxios.get("/press-release");
        console.log("✅ /press-release response:", res.data);
        const pressReleases = Array.isArray(res.data) ? res.data : [];
        const counts = pressReleases.reduce(
          (acc, pr) => {
            const s = pr.status_name ?? pr.status;
            if (acc[s] !== undefined) acc[s] += 1;
            return acc;
          },
          {
            Draft: 0,
            "Open for Review": 0,
            "Ready to Publish": 0,
            "Feedback Pending": 0,
            Unpublish: 0,
            Published: 0,
          }
        );
        console.log("🔢 Computed pressStatusCounts:", counts);
        setPressStatusCounts(counts);
      } catch (err) {
        console.error("Failed to fetch press releases count", err);
      }
    };

    fetchUsers();
    // fetchRoles();
    fetchTasks();
    fetchPressReleases();
  }, []);
  if (!userCount && userCount !== 0) return null;
  if (!rolesCount && rolesCount !== 0) return null;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  if (!user) return null;

  const canCreateUser = ability.can("manage", "User");
  const canManageRoles = ability.can("modify", "Permission");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            {canCreateUser && (
              <Grid
                item
                xs={12}
                sm={6}
                xl={3}
                onClick={() => navigate("/users")}
                style={{ cursor: "pointer" }}
              >
                <MiniStatisticsCard
                  title={{ text: "Total Users" }}
                  count={userCount}
                  icon={{ color: "warning", component: "people" }}
                />
              </Grid>
            )}

            {/* {canManageRoles && (
              <Grid
                item
                xs={12}
                sm={6}
                xl={3}
                onClick={() => navigate("/manage-roles")}
                style={{ cursor: "pointer" }}
              >
                <MiniStatisticsCard
                  title={{ text: "Total Roles" }}
                  count={rolesCount} // ← primitive count
                  icon={{ color: "warning", component: "supervisor_account" }}
                />
              </Grid>
            )}
            {!canCreateUser && !canManageRoles && (
              <Grid item xs={12} sm={6} xl={3}>
                <MiniStatisticsCard
                  title={{ text: "No access – contact admin" }}
                  icon={{ color: "info", component: "emoji_events" }}
                />
              </Grid>
            )} */}
          </Grid>
          <Typography variant="h6" gutterBottom mt={8}>
            <strong>Task Status</strong>
          </Typography>
          <Grid container spacing={3} mt={3}>
            {["Open", "Pending", "In Progress", "On Hold", "Done", "Closed"].map((status) => {
              // choose icon + color by status
              let icon, color;
              switch (status) {
                case "Open":
                  icon = "folder_open";
                  color = "primary";
                  break;
                case "Pending":
                  icon = "hourglass_empty";
                  color = "warning";
                  break;
                case "In Progress":
                  icon = "autorenew";
                  color = "info";
                  break;
                case "On Hold":
                  icon = "pause_circle_filled";
                  color = "secondary";
                  break;
                case "Done":
                  icon = "check_circle";
                  color = "success";
                  break;
                case "Published":
                  icon = "highlight_off";
                  color = "error";
                  break;
                default:
                  icon = "task";
                  color = "dark";
              }
              return (
                <Grid
                  key={status}
                  item
                  xs={12}
                  sm={6}
                  xl={3}
                  onClick={() => navigate(`/tasks?status=${encodeURIComponent(status)}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <MiniStatisticsCard
                    title={{ text: status }}
                    count={statusCounts[status]}
                    icon={{ color, component: icon }}
                  />
                </Grid>
              );
            })}
          </Grid>
          <Typography variant="h6" gutterBottom mt={8}>
            <strong>Press-Release Status</strong>
          </Typography>
          <Grid container spacing={3} mt={3}>
            {[
              "Draft",
              "Open for Review",
              "Ready to Publish",
              "Feedback Pending",
              "Unpublish",
              "Published",
            ].map((status) => {
              // choose icon + color by status
              let icon, color;
              switch (status) {
                case "Draft":
                  icon = "folder_open";
                  color = "primary";
                  break;
                case "Open for Review":
                  icon = "hourglass_empty";
                  color = "warning";
                  break;
                case "Ready to Publish":
                  icon = "autorenew";
                  color = "info";
                  break;
                case "Feedback Pending":
                  icon = "pause_circle_filled";
                  color = "secondary";
                  break;
                case "Unpublish":
                  icon = "check_circle";
                  color = "success";
                  break;
                case "Closed":
                  icon = "highlight_off";
                  color = "error";
                  break;
                default:
                  icon = "task";
                  color = "dark";
              }
              return (
                <Grid
                  key={status}
                  item
                  xs={12}
                  sm={6}
                  xl={3}
                  onClick={() => navigate(`/press-release?status=${encodeURIComponent(status)}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <MiniStatisticsCard
                    title={{ text: status }}
                    count={pressStatusCounts[status] || 0} // default to 0 if undefined
                    icon={{ color, component: icon }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Dashboard;
