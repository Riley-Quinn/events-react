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
  Tooltip,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CommentBox from "layouts/Comments";
import DeleteIcon from "@mui/icons-material/Delete";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

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

  const [error, setError] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareText = pressRelease ? `${pressRelease.title}\n\n${pressRelease.notes}` : "";

  const getShareUrl = (platform, shareText) => {
    const encodedMessage = encodeURIComponent(shareText);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    switch (platform) {
      case "whatsapp":
        return isMobile
          ? `https://api.whatsapp.com/send?text=${encodedMessage}`
          : `https://web.whatsapp.com/send?text=${encodedMessage}`;

      case "twitter":
        return `https://x.com/intent/tweet?text=${encodedMessage}`;

      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedMessage}`;

      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedMessage}`;

      case "instagram":
        // ❌ Instagram doesn’t support direct text share via URL
        // Workaround: copy text, then open Instagram
        return `https://www.instagram.com/`;

      case "email":
        return `mailto:?body=${encodedMessage}`;

      default:
        return "#";
    }
  };

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

  // Reset disable state when media count changes
  useEffect(() => {
    if (media.length < MAX_UPLOADS) {
      setIsDisabled(false);
      setError("");
    }
  }, [media.length]);

  const MAX_UPLOADS = 4;

  const handleUpload = async () => {
    if (!file) return;

    if (media.length >= MAX_UPLOADS) {
      setError(`You can't upload more than ${MAX_UPLOADS} files.`);
      setIsDisabled(true); // disable after showing error
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      await authAxios.post(`/press-media/upload/${pressId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setError(""); // clear error if upload successful
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
                      <Grid
                        item
                        xs={8}
                        sx={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          maxHeight: { xs: 150, sm: 200, md: 250 }, // responsive height
                          overflowY: "auto",
                          pr: 1,
                          width: "100%",
                        }}
                      >
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
                  disabled={isDisabled}
                  onChange={(e) => setFile(e.target.files[0])}
                  inputProps={{
                    accept:
                      "image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  }}
                  helperText={error}
                  error={!!error}
                />
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  className="add-usr-button"
                  disabled={isDisabled}
                >
                  Upload
                </Button>
                <Button
                  variant="gradient"
                  className="add-usr-button"
                  startIcon={<ShareIcon />}
                  onClick={() => setShareDialogOpen(true)}
                >
                  Share
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
          <Dialog
            open={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Share Press Release</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                {/* WhatsApp */}
                <IconButton
                  component="a"
                  href={getShareUrl("whatsapp", shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "green" }}
                >
                  <WhatsAppIcon />
                </IconButton>

                {/* LinkedIn */}
                <IconButton
                  component="a"
                  href={getShareUrl("linkedin", shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "#0077B5" }}
                >
                  <LinkedInIcon />
                </IconButton>

                {/* Facebook */}
                <IconButton
                  component="a"
                  href={getShareUrl("facebook", shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "#1877F2" }}
                >
                  <FacebookIcon />
                </IconButton>

                {/* Instagram */}
                <IconButton
                  component="a"
                  href={getShareUrl("instagram", shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "#E1306C" }}
                >
                  <InstagramIcon />
                </IconButton>

                {/* Twitter */}
                <IconButton
                  component="a"
                  href={getShareUrl("twitter", shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "#1DA1F2" }}
                >
                  <TwitterIcon />
                </IconButton>

                {/* Email */}
                <IconButton
                  component="a"
                  href={getShareUrl("email", shareText)}
                  sx={{ color: "red" }}
                >
                  <EmailIcon />
                </IconButton>

                {/* Copy to Clipboard */}
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000); // reset after 1s
                  }}
                  sx={{ color: copied ? "green" : "gray" }}
                >
                  {copied ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          ;
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ViewPressRelease;
