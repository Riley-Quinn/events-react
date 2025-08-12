// pages/ViewEvent.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import authAxios from "authAxios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ImageList,
  ImageListItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPressReleaseModal from "./AddPressReleaseModal";

const ViewEvent = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState(null);

  const [error, setError] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const [openPressDialog, setOpenPressDialog] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchMedia();
  }, []);

  const fetchEventDetails = async () => {
    try {
      const res = await authAxios.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error("Error loading event", err);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await authAxios.get(`/media/event/${id}`);
      setMedia(res.data);
    } catch (err) {
      console.error("Failed to load media", err);
    }
  };
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
      await authAxios.post(`/media/upload/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setError(""); // clear error on successful upload
      fetchMedia();
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  useEffect(() => {
    if (media.length < MAX_UPLOADS) {
      setIsDisabled(false);
      setError("");
    }
  }, [media.length]);

  const handleMediaClick = (item) => {
    setSelectedMedia(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (id) => {
    setSelectedMediaId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await authAxios.delete(`/media/${selectedMediaId}`);
      fetchMedia();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setConfirmOpen(false);
      setSelectedMediaId(null);
    }
  };
  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d); // parse UTC ISO
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
  };

  const formatTime = (t) => {
    if (!t) return "";
    return t.slice(0, 5); // HH:mm
  };

  const getFileUrl = (url) => `${process.env.REACT_APP_MEDIA_BASE_URL}/${url}`;

  if (!event) return <div>Loading...</div>;
  const handleOpenModal = () => {
    setOpenPressDialog(true);
  };
  const handleCloseModal = () => {
    setOpenPressDialog(false);
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ padding: 3 }} className="event_details">
        <Typography variant="h4" gutterBottom mb={2}>
          Event Details
        </Typography>
        <Grid container spacing={1} className="details">
          <Grid item sm={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              Title
            </Typography>
          </Grid>
          <Grid item sm={9}>
            <Typography variant="body1">: {event.title}</Typography>
          </Grid>

          <Grid item sm={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              Description
            </Typography>
          </Grid>
          <Grid item sm={9}>
            <Typography variant="body1">: {event.description}</Typography>
          </Grid>

          <Grid item sm={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              Location
            </Typography>
          </Grid>
          <Grid item sm={9}>
            <Typography variant="body1">: {event.location}</Typography>
          </Grid>

          <Grid item sm={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              Date
            </Typography>
          </Grid>
          <Grid item sm={9}>
            <Typography variant="body1">: {formatDate(event.date)}</Typography>
          </Grid>

          <Grid item sm={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              Time
            </Typography>
          </Grid>
          <Grid item sm={9}>
            <Typography variant="body1">
              :{event.time === "00:00:00" ? "All Day" : formatTime(event.time)}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom mt={2}>
          Upload Media
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 4 }}>
          <TextField
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

          <Button variant="contained" className="add-usr-button" onClick={() => handleOpenModal()}>
            Add Press Release
          </Button>
        </Box>

        <Typography variant="h5" gutterBottom>
          Uploaded Media
        </Typography>

        <ImageList cols={3} gap={16}>
          {media.map((item) => {
            const fileUrl = getFileUrl(item.url);
            const isVideo = item.url.match(/\.(mp4|webm|ogg)$/i);
            const isPdf = item.url.match(/\.pdf$/i);

            return (
              <ImageListItem key={item.id} sx={{ position: "relative" }}>
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
                  onClick={() => handleDeleteClick(item.id)}
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
      </Box>
      <AddPressReleaseModal open={openPressDialog} onClose={handleCloseModal} />
    </DashboardLayout>
  );
};

export default ViewEvent;
