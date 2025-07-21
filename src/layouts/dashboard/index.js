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

function Dashboard() {
  const { size } = typography;
  const { chart, items } = reportsBarChartData;
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const ability = useAbility(); // ✅ CASL ability instance

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
              <Grid item xs={12} sm={6} xl={3} onClick={() => navigate("/users")}>
                <MiniStatisticsCard
                  title={{ text: "Create User" }}
                  icon={{
                    color: "warning", // MUI color, close to orange
                    component: "person",
                  }}
                />
              </Grid>
            )}
            {canManageRoles && (
              <Grid item xs={12} sm={6} xl={3} onClick={() => navigate("/manage-roles")}>
                <MiniStatisticsCard
                  title={{ text: "Manage Roles" }}
                  icon={{ color: "warning", component: "supervisor_account" }}
                />
              </Grid>
            )}
            {canManageRoles && (
              <Grid item xs={12} sm={6} xl={3} onClick={() => navigate("/manage-permissions")}>
                <MiniStatisticsCard
                  title={{ text: "Manage Permissions" }}
                  icon={{ color: "warning", component: "admin_panel_settings" }}
                />
              </Grid>
            )}
            {!canCreateUser && !canManageRoles && (
              <Grid item xs={12} sm={6} xl={3}>
                <MiniStatisticsCard
                  title={{ text: "You don't have web access please contact admin" }}
                  icon={{ color: "info", component: "emoji_events" }}
                />
              </Grid>
            )}
          </Grid>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Dashboard;
