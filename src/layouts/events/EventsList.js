/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import authAxios from "authAxios";
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useAbility } from "contexts/AbilityContext";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});
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

const EventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const ability = useAbility();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await authAxios.get("/events/all");

      const formattedEvents = res.data.map((event) => {
        const { date, time, title, id } = event;

        let start, end, allDay;

        if (time && time !== "00:00:00") {
          const [hours, minutes, seconds] = time.split(":").map(Number);
          start = new Date(date);
          start.setHours(hours, minutes, seconds);
          end = new Date(start.getTime() + 60 * 60 * 1000);
          allDay = false;
        } else {
          start = new Date(date);
          end = new Date(date);
          end.setHours(23, 59, 59);
          allDay = true;
        }

        return {
          id,
          title,
          start,
          end,
          allDay,
          resource: event,
        };
      });

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    try {
      await authAxios.delete(`/events/${selectedEvent.id}`);
      setConfirmDelete(false);
      setOpenDialog(false);
      fetchEvents(); // Refresh events
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const CustomEvent = ({ event }) => {
    return (
      <span
        title={event.title}
        style={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {event.title}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div style={{ padding: 20 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
          {ability.can("add", "Event") && (
            <Button
              variant="contained"
              onClick={() => navigate("/events/add-event")}
              className="add-usr-button"
            >
              Add Event
            </Button>
          )}
        </Box>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          components={{
            event: CustomEvent,
          }}
          onSelectEvent={handleEventClick}
        />

        {/* Event Detail Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle sx={{ fontSize: "18px" }}>Event Details</DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box sx={{ fontSize: "14px", lineHeight: 1.5 }}>
                <p>
                  <strong>Title:</strong> {selectedEvent.title}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.resource.description}
                </p>
                <p>
                  <strong>Location:</strong> {selectedEvent.resource.location}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedEvent.resource.date)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {selectedEvent.resource.time === "00:00:00"
                    ? "All Day"
                    : formatTime(selectedEvent.resource.time)}
                </p>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained" className="cancel-button">
              Close
            </Button>
            <Button
              onClick={() => navigate(`/events/edit-event/${selectedEvent.id}`)}
              variant="contained"
              className="add-usr-button"
            >
              Edit
            </Button>
            {ability.can("delete", "Event") && (
              <Button
                onClick={() => setConfirmDelete(true)}
                variant="contained"
                className="delete-btn"
              >
                Delete
              </Button>
            )}
            {ability.can("view", "Event") && (
              <Button
                onClick={() => navigate(`/events/view/${selectedEvent.id}`)}
                variant="contained"
                color="primary"
              >
                View
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
          <DialogTitle sx={{ fontSize: "18px" }}>Confirm Delete</DialogTitle>
          <DialogContent>
            <Box sx={{ fontSize: "14px", lineHeight: 1.5 }}>
              Are you sure you want to delete this event?
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmDelete(false)}
              variant="outlined"
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              className="add-usr-button"
            >
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EventsCalendar;
