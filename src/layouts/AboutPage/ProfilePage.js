//ProfilePage.js

import { Card, CardContent, Grid, Box, Avatar, Typography, FormHelperText } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Profile from "assets/images/Profile.png";
const ProfilePage = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid
        container
        spacing={3}
        sx={{
          mt: 15,
          maxWidth: "2000px",
          marginRight: "16px",
        }}
      >
        {/* CARD with Profile Image */}
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Grid>
            <Box sx={{ position: "relative" }}>
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
                        sx={{ color: "#e6762d", display: "flex", justifyContent: "right" }}
                      >
                        <strong>MBBS,MS</strong>
                      </FormHelperText>
                    </Typography>

                    <Typography variant="body2" color="textSecondary" align="left">
                      General & Laparoscopic Surgeon
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="left">
                      Director, Maa Sharada Hospitals
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="left">
                      Chairman, YAGNA FOUNDATION
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="left">
                      Email:yourmail@email.com
                    </Typography>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid>
            <Card>
              <CardContent>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, mt: 2 }}>
                  <strong>Current Responsibilities in </strong>
                  <Box component="span" sx={{ color: "#e6762d" }}>
                    Vikarabad BJP
                  </Box>
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ textIndent: 0, textAlign: "justify", hyphens: "auto" }}
                >
                  ✓ Dharmic Cell In-charge: Since September 2024, serving as the Dharmic Cell
                  In-charge for Vikarabad district.
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ textIndent: 0, textAlign: "justify", hyphens: "auto" }}
                >
                  ✓ Disha Committee Member: Currently serving as a nominated member in the Vikarabad
                  district Disha Committee, under the leadership of Chevella MP Shri Konda
                  Vishweshwar Reddy.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Right Side Card */}
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Grid>
            <Card>
              <CardContent>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, mt: 2, color: "#e6762d" }}>
                  <strong>About </strong>
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ textIndent: "2em", textAlign: "justify", hyphens: "auto" }}
                >
                  A dedicated medical professional, social reformer, and community leader, he has
                  seamlessly blended healthcare service, education, and spiritual values to uplift
                  rural lives. With vast experience as a surgeon and a passion for social change, he
                  established institutions that provide free medical care, education, and support
                  for the underprivileged. Deeply inspired by the teachings of Swami Vivekananda,
                  his work spans across healthcare innovation, youth empowerment, and active
                  involvement in political and cultural causes, making a lasting impact on society.
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, mt: 3, color: "#e6762d" }}>
                  <strong>Spiritual Education </strong>
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ textIndent: "2em", textAlign: "justify", hyphens: "auto" }}
                >
                  Studied Upanishads, Brahmasutras, Bhagavad Gita, and Sanskrit Grammar at{" "}
                  <strong>Arsha Vijnana Gurukulam, Nagpur</strong> (2017-2020)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ProfilePage;
