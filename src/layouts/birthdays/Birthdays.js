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

const Birthdays = () => {
  const [events, setEvents] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [newBirthday, setNewBirthday] = useState({ name: "", birth_date: "" });

  const [selectedBirthday, setSelectedBirthday] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const res = await authAxios.get("/birthdays/all");

      const birthdays = res.data.map((b) => {
        const date = new Date(b.birth_date);
        const todayYear = new Date().getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        return {
          title: `${b.name}'s Birthday 🎂`,
          start: new Date(todayYear, month, day, 0, 0),
          end: new Date(todayYear, month, day, 23, 59),
          allDay: true,
          resource: b,
        };
      });

      setEvents(birthdays);
    } catch (err) {
      console.error("Error fetching birthdays", err);
    }
  };

  const handleAddBirthday = async () => {
    try {
      await authAxios.post("/birthdays/create", newBirthday);
      setOpenAdd(false);
      setNewBirthday({ name: "", birth_date: "" });
      fetchBirthdays();
    } catch (err) {
      console.error("Failed to add birthday", err);
    }
  };

  const handleUpdateBirthday = async () => {
    try {
      await authAxios.put(`/birthdays/${selectedBirthday.id}`, {
        name: selectedBirthday.name,
        birth_date: selectedBirthday.birth_date,
      });
      setEditOpen(false);
      fetchBirthdays();
    } catch (err) {
      console.error("Failed to update birthday", err);
    }
  };

  const handleDeleteBirthday = async () => {
    try {
      await authAxios.delete(`/birthdays/${selectedBirthday.id}`);
      setEditOpen(false);
      setConfirmDeleteOpen(false);
      fetchBirthdays();
    } catch (err) {
      console.error("Failed to delete birthday", err);
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
          <Button variant="contained" onClick={() => setOpenAdd(true)} className="add-usr-button">
            Add Birthday
          </Button>
        </Box>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={(event) => {
            const formattedDate = formatDate(new Date(event.resource.birth_date), "yyyy-MM-dd");
            setSelectedBirthday({
              id: event.resource.id,
              name: event.resource.name,
              birth_date: formattedDate,
            });
            setEditOpen(true);
          }}
        />

        {/* Add Birthday Dialog */}
        <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
          <DialogTitle>Add Birthday</DialogTitle>
          <DialogContent>
            <TextField
              placeholder="Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={newBirthday.name}
              InputLabelProps={{ shrink: false }}
              onChange={(e) => setNewBirthday({ ...newBirthday, name: e.target.value })}
            />
            <TextField
              placeholder="Birth Date"
              type="date"
              fullWidth
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: false }}
              value={newBirthday.birth_date}
              onChange={(e) => setNewBirthday({ ...newBirthday, birth_date: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)} className="cancel-button">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddBirthday} className="add-usr-button">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Birthday Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>Edit Birthday</DialogTitle>
          <DialogContent>
            <TextField
              placeholder="Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={selectedBirthday?.name || ""}
              InputLabelProps={{ shrink: false }}
              onChange={(e) => setSelectedBirthday({ ...selectedBirthday, name: e.target.value })}
            />
            <TextField
              placeholder="Birth Date"
              type="date"
              fullWidth
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: false }}
              value={selectedBirthday?.birth_date || ""}
              onChange={(e) =>
                setSelectedBirthday({ ...selectedBirthday, birth_date: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditOpen(false)}
              className="cancel-button"
              variant="contained"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmDeleteOpen(true)}
              className="delete-btn"
            >
              Delete
            </Button>
            <Button variant="contained" onClick={handleUpdateBirthday} className="add-usr-button">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            Do you really want to delete {selectedBirthday?.name} birthday?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteBirthday}>
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Birthdays;
