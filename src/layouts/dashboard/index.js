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
import { Card, CardContent, Typography, Box, Avatar, FormHelperText } from "@mui/material";
import Profile from "assets/images/Profile.png";
import logo from "assets/images/ramakrishna.png";
import acc from "assets/images/acc.png";
import bgm from "assets/images/bgbdy.png";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import authAxios from "authAxios";

function Dashboard() {
  const { size } = typography;
  const { chart, items } = reportsBarChartData;
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const ability = useAbility();
  const [userCount, setUserCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [birthdaytoday, setBirthdayToday] = useState([]);
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

        if (Array.isArray(res.data)) {
          const users = res.data;

          // Total users count
          setUserCount(users.length);

          // Active users count (is_active === 1)
          const activeUsers = users.filter((user) => user.is_active === 1);
          setActiveUsersCount(activeUsers.length);
        } else {
          setUserCount(0);
          setActiveUsersCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch users count", err);
        setUserCount(0);
        setActiveUsersCount(0);
      }
    };

    // Fetch tasks count by status
    const fetchTasks = async () => {
      try {
        const res = await authAxios.get("/tasks?all=true");
        const tasks = Array.isArray(res.data.list) ? res.data.list : [];
        setTasks(tasks);

        // Update counts
        const counts = tasks.reduce(
          (acc, t) => {
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
        setStatusCounts(counts);
      } catch (err) {
        console.error("Failed to fetch tasks count", err);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await authAxios.get("/events/all");
        const eventsList = Array.isArray(res.data) ? res.data : [];
        setEvents(eventsList);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    // Fetch press release counts by status
    const fetchPressReleases = async () => {
      try {
        const res = await authAxios.get("/press-release");
        const pressReleases = Array.isArray(res.data.list) ? res.data.list : [];
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
        setPressStatusCounts(counts);
      } catch (err) {
        console.error("Failed to fetch press releases count", err);
      }
    };
    const fetchBirthdays = async () => {
      try {
        const res = await authAxios.get("/birthdays/all");
        const birthdays = Array.isArray(res.data) ? res.data : [];

        const today = new Date();
        const todayMonth = today.getMonth() + 1; // 1-12
        const todayDay = today.getDate(); // 1-31

        const todayBirthdays = birthdays.filter((b) => {
          if (!b.birth_date) return false;

          // Parse birthday string into Date (local time)
          const dob = new Date(b.birth_date);

          const dobMonth = dob.getMonth() + 1;
          const dobDay = dob.getDate();

          return dobMonth === todayMonth && dobDay === todayDay;
        });

        setBirthdayToday(todayBirthdays);
      } catch (err) {
        console.error("Failed to fetch Birthdays", err);
        setBirthdayToday([]);
      }
    };

    fetchBirthdays();
    fetchUsers();
    fetchTasks();
    fetchPressReleases();
    fetchEvents();
  }, []);
  if (!userCount && userCount !== 0) return null;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  if (!user) return null;

  const canCreateUser = ability.can("manage", "User");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
              {/* ================= LEFT SECTION ================= */}
              <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column" }}>
                <Grid container spacing={3} gap={2}>
                  {/*1st row: Birthday Banner + Total Users */}
                  <Grid container spacing={3}>
                    {/*Birthday */}
                    <Grid item xs={12} md={8}>
                      <Card
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          height: "100%",
                          background:
                            birthdaytoday.length > 0
                              ? "linear-gradient(180deg, #cbf5f7 56%, #fde2cf 61%, #fde2cf 82%)"
                              : "linear-gradient(180deg, #cbf5f7 56%, #fde2cf 61%, #ebb791 82%)",
                          boxShadow: 2,
                          "&:hover": { boxShadow: 4 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          {/* Left side image */}
                          <SoftBox
                            component="img"
                            src={bgm}
                            alt="Birthday"
                            width="120px"
                            height="100px"
                            sx={{ mr: 2 }}
                          />

                          {/* Right side text */}
                          <Box sx={{ textAlign: "center", flex: 1 }}>
                            {birthdaytoday.length > 0 ? (
                              <>
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                  <strong>
                                    Dear{" "}
                                    {birthdaytoday.map((b, i) =>
                                      i === birthdaytoday.length - 1 ? b.name : `${b.name}, `
                                    )}
                                  </strong>
                                </Typography>
                                <Typography
                                  variant="h4"
                                  sx={{
                                    fontFamily: "'Courier New', Courier, monospace",
                                    fontWeight: "bold",
                                    color: "black",
                                    textShadow: "1px 1px 0 #fff, -1px -1px 0 #fff",
                                  }}
                                >
                                  Have a Happy Birthday!
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="h4">No birthdays today 🎉</Typography>
                            )}
                          </Box>
                        </Box>
                      </Card>
                    </Grid>

                    {/*Total Users count */}
                    <Grid item xs={12} md={4}>
                      {canCreateUser && (
                        <Card
                          onClick={() => navigate("/users")}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            cursor: "pointer",
                            background: "linear-gradient(135deg, #fff6f0, #fde2cf)",
                            boxShadow: 2,
                            "&:hover": { boxShadow: 4 },
                            height: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              gap: 2,
                            }}
                          >
                            {/* Left side image */}
                            <SoftBox
                              component="img"
                              src={acc}
                              alt="Logo"
                              width="60px"
                              height="70px"
                            />

                            {/* Right side text */}
                            <Box sx={{ textAlign: "left" }}>
                              <Typography variant="subtitle1" sx={{ color: "#333" }}>
                                <strong>Total Users</strong>
                              </Typography>
                              <Typography
                                variant="h3"
                                sx={{ fontWeight: "bold", fontSize: 44, color: "#000" }}
                              >
                                {userCount}
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                sx={{ color: "green", fontSize: "18px", fontWeight: "bold" }}
                              >
                                <strong>Active Users:</strong>
                                {activeUsersCount}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      )}
                    </Grid>
                  </Grid>
                  {/*2nd row Task Status + Press Status */}
                  <Grid container spacing={3}>
                    {/*Task status */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 3,
                          boxShadow: 2,
                          background: "linear-gradient(135deg, #fff6f0, #fde2cf)", // light peach-pink
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                            <strong>Task Status</strong>
                          </Typography>
                          <ArrowOutwardIcon onClick={() => navigate("/tasks")} />
                        </Box>
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
                          {["Open", "Pending", "In Progress", "On Hold", "Done", "Closed"].map(
                            (status) => {
                              let icon, color;
                              switch (status) {
                                case "Open":
                                  icon = "folder_open";
                                  color = "error.main";
                                  break;
                                case "Pending":
                                  icon = "hourglass_empty";
                                  color = "warning.main";
                                  break;
                                case "In Progress":
                                  icon = "autorenew";
                                  color = "info.main";
                                  break;
                                case "On Hold":
                                  icon = "pause_circle_filled";
                                  color = "secondary.main";
                                  break;
                                case "Done":
                                  icon = "check_circle";
                                  color = "success.main";
                                  break;
                                case "Closed":
                                  icon = "highlight_off";
                                  color = "grey.600";
                                  break;
                                default:
                                  icon = "task";
                                  color = "text.secondary";
                              }
                              return (
                                <Box
                                  key={status}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    py: 1,
                                    cursor: "pointer",
                                    "&:hover": { backgroundColor: "grey.50" },
                                  }}
                                  onClick={() =>
                                    navigate(`/tasks?status=${encodeURIComponent(status)}`)
                                  }
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Icon sx={{ color }}>{icon}</Icon>
                                    <Typography fontSize={14}>{status}</Typography>
                                  </Box>
                                  <Typography fontWeight="bold" fontSize="14px">
                                    {statusCounts[status] ?? 0}
                                  </Typography>
                                </Box>
                              );
                            }
                          )}
                        </Card>
                      </Box>
                    </Grid>
                    {/* Press Release Status */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 3,
                          boxShadow: 2,
                          background: "linear-gradient(135deg, #fff6f0, #fde2cf)", // light peach-pink
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                            <strong>Press Release Status</strong>
                          </Typography>
                          <ArrowOutwardIcon onClick={() => navigate("/press-release")} />
                        </Box>
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
                          {[
                            "Draft",
                            "Open for Review",
                            "Ready to Publish",
                            "Feedback Pending",
                            "Unpublish",
                            "Published",
                          ].map((status) => {
                            let icon, color;
                            switch (status) {
                              case "Draft":
                                icon = "description";
                                color = "error.main";
                                break;
                              case "Open for Review":
                                icon = "hourglass_empty";
                                color = "warning.main";
                                break;
                              case "Ready to Publish":
                                icon = "publish";
                                color = "info.main";
                                break;
                              case "Feedback Pending":
                                icon = "feedback";
                                color = "secondary.main";
                                break;
                              case "Unpublish":
                                icon = "cancel";
                                color = "grey.600";
                                break;
                              case "Published":
                                icon = "check_circle";
                                color = "success.main";
                                break;
                              default:
                                icon = "task";
                                color = "text.secondary";
                            }
                            return (
                              <Box
                                key={status}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  py: 1,
                                  cursor: "pointer",
                                  "&:hover": { backgroundColor: "grey.50" },
                                }}
                                onClick={() =>
                                  navigate(`/press-release?status=${encodeURIComponent(status)}`)
                                }
                              >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Icon sx={{ color }}>{icon}</Icon>
                                  <Typography fontSize={14}>{status}</Typography>
                                </Box>
                                <Typography fontWeight="bold" fontSize="14px">
                                  {pressStatusCounts[status] ?? 0}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Card>
                      </Box>
                    </Grid>
                  </Grid>
                  {/*3rd Row Tasks List + Event List */}
                  <Grid container spacing={3}>
                    {/* Task List */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 3,
                          boxShadow: 2,
                          background: "linear-gradient(135deg, #fff6f0, #fde2cf)", // light peach-pink
                          height: "50vh",
                        }}
                      >
                        <Card sx={{ p: 2, height: "43vh" }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6">
                              {" "}
                              <strong>Tasks List</strong>
                            </Typography>
                            <Typography
                              variant="button"
                              color="primary"
                              sx={{ cursor: "pointer" }}
                              onClick={() => navigate("/tasks")}
                            >
                              View All
                            </Typography>
                          </Box>

                          <Box sx={{ mt: 2, height: "30vh", overflowY: "auto" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Today
                            </Typography>

                            {tasks
                              .filter((t) => {
                                const startDate = new Date(t.start_date);
                                return startDate.toDateString() === new Date().toDateString();
                              })
                              .map((task) => (
                                <Box
                                  key={task.id}
                                  sx={{
                                    mb: 2,
                                    p: 1.5,
                                    pl: 1,
                                    borderRadius: 2,
                                    backgroundColor: "grey.50",
                                    "&:hover": { backgroundColor: "grey.100", cursor: "pointer" },
                                  }}
                                  onClick={() => navigate("/tasks")}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    fontSize="14px"
                                    noWrap
                                  >
                                    {task.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    fontSize="14px"
                                    noWrap
                                  >
                                    Location: {task.location}
                                  </Typography>
                                </Box>
                              ))}

                            {/* If no tasks for today */}
                            {tasks.filter(
                              (t) =>
                                new Date(t.start_date).toDateString() === new Date().toDateString()
                            ).length === 0 && (
                              <Typography variant="body2" color="text.secondary" fontSize="14px">
                                No tasks scheduled for today.
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Box>
                    </Grid>

                    {/* Events List */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 3,
                          boxShadow: 2,
                          background: "linear-gradient(135deg, #fff6f0, #fde2cf)", // light peach-pink
                          height: "50vh",
                        }}
                      >
                        <Card sx={{ p: 2, height: "43vh" }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6">
                              <strong>Events List</strong>
                            </Typography>
                            <Typography
                              variant="button"
                              color="primary"
                              sx={{ cursor: "pointer" }}
                              onClick={() => navigate("/events")}
                            >
                              View All
                            </Typography>
                          </Box>

                          <Box sx={{ mt: 2, height: "30vh", overflowY: "auto" }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Today
                            </Typography>

                            {events
                              .filter((event) => {
                                const today = new Date().toLocaleDateString("en-CA");
                                const eventDay = new Date(event.date).toLocaleDateString("en-CA");
                                return eventDay === today;
                              })
                              .map((event) => {
                                const eventDate = new Date(
                                  `${event.date.split("T")[0]}T${event.time}`
                                );

                                const time =
                                  event.time === "00:00:00"
                                    ? "All Day"
                                    : eventDate.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      });

                                return (
                                  <Box
                                    key={event.id}
                                    sx={{
                                      mb: 2,
                                      p: 1.5,
                                      pl: 1,
                                      borderRadius: 2,
                                      backgroundColor: "grey.50",
                                      "&:hover": { backgroundColor: "grey.100", cursor: "pointer" },
                                    }}
                                    onClick={() => navigate(`/events/view/${event.id}`)}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      fontSize="14px"
                                      noWrap
                                    >
                                      {time} – {event.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      fontSize="14px"
                                      noWrap
                                    >
                                      Location: {event.location || "Not specified"}
                                    </Typography>
                                  </Box>
                                );
                              })}

                            {/* If no events for today */}
                            {events.filter((event) => {
                              const today = new Date().toLocaleDateString("en-CA");
                              const eventDay = new Date(event.date).toLocaleDateString("en-CA");
                              return eventDay === today;
                            }).length === 0 && (
                              <Typography variant="body2" color="text.secondary" fontSize="14px">
                                No events scheduled for today.
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* ================= RIGHT SIDEBAR ================= */}
              <Grid item xs={12} md={4}>
                <Grid container spacing={3} direction="column">
                  {/* Quote Card */}
                  <Grid item xs={12} sx={{ mt: -3 }}>
                    <Card sx={{ p: 3, textAlign: "center" }}>
                      <SoftBox
                        component="img"
                        src={logo}
                        alt="Logo"
                        sx={{
                          width: "300px",
                          height: "125px",
                          display: "block",
                          margin: "0 auto", // centers horizontally
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ fontStyle: "italic", mb: 1, fontSize: "14px" }}
                      >
                        “The Man who works for others, without any selfish motive, really does good
                        to himself.”
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "warning.main", fontSize: "14px" }}
                      >
                        — Sri Ramakrishna
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Profile Card */}
                  <Grid item xs={12}>
                    <Box sx={{ position: "relative", mt: 20 }}>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 2,
                        }}
                      >
                        <Avatar
                          alt="Profile"
                          src={Profile}
                          sx={{
                            width: 250,
                            height: 250,
                            border: "4px solid white",
                          }}
                        />
                      </Box>

                      {/* Card Content */}
                      <Card sx={{ paddingTop: 20 }}>
                        <CardContent>
                          <Grid item xs={12} textAlign="center">
                            <Typography variant="h4" gutterBottom sx={{ color: "#e6762d" }}>
                              <strong> Dr.KOPPULA RAJASEKHAR REDDY</strong>
                              <FormHelperText
                                sx={{
                                  color: "#e6762d",
                                  display: "flex",
                                  justifyContent: "right",
                                  fontSize: "14px",
                                }}
                              >
                                <strong>MBBS,MS</strong>
                              </FormHelperText>
                            </Typography>

                            <Typography
                              variant="body2"
                              color="textSecondary"
                              align="left"
                              fontSize="14px"
                            >
                              General & Laparoscopic Surgeon
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              align="left"
                              fontSize="14px"
                            >
                              Director, Maa Sharada Hospitals
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              align="left"
                              fontSize="14px"
                            >
                              Chairman, YAGNA FOUNDATION
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              align="left"
                              fontSize="14px"
                            >
                              Email:yourmail@email.com
                            </Typography>
                            <Box sx={{ mt: 2, textAlign: "left" }}>
                              <Typography variant="body2" fontSize="14px">
                                <strong>Father’s Name:</strong> Koppula Venkataramireddy
                              </Typography>
                              <Typography variant="body2" fontSize="14px">
                                <strong>Mother’s Name:</strong> Koppula Govindamma
                              </Typography>
                              <Typography variant="body2" fontSize="14px">
                                <strong>Address:</strong> Sai Nagar Colony, Vikarabad Town,
                                Telangana
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "left", gap: 2, mt: 2 }}>
                              <Icon>facebook</Icon>
                              <TwitterIcon />
                              <InstagramIcon />
                            </Box>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </SoftBox>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Dashboard;
