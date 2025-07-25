import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAxios from "authAxios";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CommentBox from "layouts/Comments";
import DeleteIcon from "@mui/icons-material/Delete";
const MEDIA_BASE_URL = "https://d108ysp6ovb3mv.cloudfront.net";

const ViewPressRelease = () => {
  const { pressId } = useParams();
  const navigate = useNavigate();
  const [pressRelease, setPressRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
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
    fetchMedia();
    fetchPressRelease();
  }, [pressId]);

  const fetchMedia = async () => {
    try {
      const res = await authAxios.get(`/press-media/press/${pressId}`);
      setMedia(res.data);
    } catch (err) {
      console.error("Failed to load media", err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await authAxios.post(`/press-media/upload/${pressId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFile(null);
      fetchMedia();
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleMediaClick = (item) => {
    setSelectedMedia(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (image_id) => {
    setSelectedMediaId(image_id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await authAxios.delete(`/press-media/${selectedMediaId}`);
      fetchMedia();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setConfirmOpen(false);
      setSelectedMediaId(null);
    }
  };

  const getFileUrl = (url) => `${MEDIA_BASE_URL}/${url}`;
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
                <Button variant="gradient" className="cancel-button" onClick={() => navigate(-1)}>
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
          <Grid item xs={12} md={6} style={{ display: "flex", flexDirection: "column" }}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom mt={2}>
                Upload Media
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 4, width: "100%" }}>
                <TextField
                  fullWidth
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  inputProps={{
                    accept:
                      "image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  }}
                />
                <Button variant="contained" onClick={handleUpload} className="add-usr-button">
                  Upload
                </Button>
              </Box>
            </Grid>
          </Grid>

          <ImageList cols={3} gap={16}>
            {media.map((item) => {
              const fileUrl = getFileUrl(item.url);
              const isVideo = item.url.match(/\.(mp4|webm|ogg)$/i);
              const isPdf = item.url.match(/\.pdf$/i);

              return (
                <ImageListItem key={item.image_id} sx={{ position: "relative" }}>
                  {isVideo ? (
                    <video
                      src={fileUrl}
                      controls
                      onClick={() => handleMediaClick(item)}
                      style={{ width: "100%", height: 300, borderRadius: 8 }}
                    />
                  ) : isPdf ? (
                    <iframe
                      src={fileUrl}
                      title="PDF"
                      style={{ width: "100%", height: 300, border: "none", borderRadius: 8 }}
                      onClick={() => handleMediaClick(item)}
                    />
                  ) : (
                    <img
                      src={fileUrl}
                      alt="media"
                      loading="lazy"
                      style={{ width: "100%", height: 300, borderRadius: 8, cursor: "pointer" }}
                      onClick={() => handleMediaClick(item)}
                    />
                  )}
                  <IconButton
                    onClick={() => handleDeleteClick(item.image_id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ImageListItem>
              );
            })}
          </ImageList>

          {/* Preview Dialog */}
          {selectedMedia && (
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
              <DialogContent>
                {selectedMedia.url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={getFileUrl(selectedMedia.url)}
                    controls
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                ) : selectedMedia.url.match(/\.pdf$/i) ? (
                  <iframe
                    src={getFileUrl(selectedMedia.url)}
                    style={{ width: "100%", height: "80vh", border: "none" }}
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={getFileUrl(selectedMedia.url)}
                    alt="media"
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => window.open(getFileUrl(selectedMedia.url), "_blank")}
                  variant="outlined"
                >
                  Download
                </Button>
                <Button onClick={handleCloseDialog} variant="contained">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Confirm Delete Dialog */}
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this media? This action is permanent.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ViewPressRelease;
