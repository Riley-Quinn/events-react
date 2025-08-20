import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { format as formatDate } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import authAxios from "authAxios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
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

const SpecialDays = () => {
  const [events, setEvents] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [newSpecialDay, setNewSpecialDay] = useState({ name: "", importantDay_date: "" });

  const [selectedSpecialDate, setSelectedSpecialDate] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const token = localStorage.getItem("token");
  const ability = useAbility();
  useEffect(() => {
    fetchSpecialDays();
  }, []);

  const fetchSpecialDays = async () => {
    try {
      const res = await authAxios.get("/specialdays/all");

      const specialDays = res.data.map((b) => {
        const date = new Date(b.importantDay_date);
        const todayYear = new Date().getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        return {
          title: `${b.name} `,
          start: new Date(todayYear, month, day, 0, 0),
          end: new Date(todayYear, month, day, 23, 59),
          allDay: true,
          resource: b,
        };
      });

      setEvents(specialDays);
    } catch (err) {
      console.error("Error fetching specialDays", err);
    }
  };

  const handleAddSpecialDay = async () => {
    try {
      await authAxios.post("/specialdays/create", newSpecialDay);
      setOpenAdd(false);
      setNewSpecialDay({ name: "", importantDay_date: "" });
      fetchSpecialDays();
    } catch (err) {
      console.error("Failed to add specialDay", err);
    }
  };

  const handleUpdateSpecialDay = async () => {
    try {
      await authAxios.put(`/specialdays/${selectedSpecialDate.id}`, {
        name: selectedSpecialDate.name,
        importantDay_date: selectedSpecialDate.importantDay_date,
      });
      setEditOpen(false);
      fetchSpecialDays();
    } catch (err) {
      console.error("Failed to update specialDay", err);
    }
  };

  const handleDeleteSpecialDay = async () => {
    try {
      await authAxios.delete(`/specialdays/${selectedSpecialDate.id}`);
      setEditOpen(false);
      setConfirmDeleteOpen(false);
      fetchSpecialDays();
    } catch (err) {
      console.error("Failed to delete specialday", err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div style={{ padding: 20 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 2,
          }}
        >
          {ability.can("add", "ImportantDays") && (
            <Button variant="contained" onClick={() => setOpenAdd(true)} className="add-usr-button">
              Add Important Day
            </Button>
          )}
        </Box>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={(event) => {
            const formattedDate = formatDate(
              new Date(event.resource.importantDay_date),
              "yyyy-MM-dd"
            );
            setSelectedSpecialDate({
              id: event.resource.id,
              name: event.resource.name,
              importantDay_date: formattedDate,
            });
            setEditOpen(true);
          }}
        />

        <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
          <DialogTitle>Add Important Days</DialogTitle>
          <DialogContent>
            <TextField
              placeholder="Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={newSpecialDay.name}
              InputLabelProps={{ shrink: false }}
              onChange={(e) => setNewSpecialDay({ ...newSpecialDay, name: e.target.value })}
            />
            <TextField
              placeholder="Birth Date"
              type="date"
              fullWidth
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: false }}
              value={newSpecialDay.importantDay_date}
              onChange={(e) =>
                setNewSpecialDay({ ...newSpecialDay, importantDay_date: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenAdd(false)}
              className="cancel-button"
              sx={{ padding: 1.5 }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddSpecialDay} className="add-usr-button">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>Edit Important Day</DialogTitle>
          <DialogContent>
            <TextField
              placeholder="Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={selectedSpecialDate?.name || ""}
              InputLabelProps={{ shrink: false }}
              onChange={(e) =>
                setSelectedSpecialDate({ ...selectedSpecialDate, name: e.target.value })
              }
            />
            <TextField
              placeholder="Birth Date"
              type="date"
              fullWidth
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: false }}
              value={selectedSpecialDate?.importantDay_date || ""}
              onChange={(e) =>
                setSelectedSpecialDate({
                  ...selectedSpecialDate,
                  importantDay_date: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => setEditOpen(false)}
              className="cancel-button"
            >
              Cancel
            </Button>
            {ability.can("delete", "ImportantDays") && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmDeleteOpen(true)}
                className="delete-btn"
              >
                Delete
              </Button>
            )}
            <Button variant="contained" onClick={handleUpdateSpecialDay} className="add-usr-button">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            Do you really want to delete {selectedSpecialDate?.name} Important day?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteSpecialDay}>
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SpecialDays;
