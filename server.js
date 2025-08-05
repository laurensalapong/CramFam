const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let events = {}; // Stores events and availability

// Create new event
app.post("/createEvent", (req, res) => {
  const { userName, eventName } = req.body; // Fixed parameter names

  if (!userName || !eventName) {
    return res.status(400).json({ error: "Missing userName or eventName" });
  }

  const eventId = uuidv4();
  events[eventId] = {
    host: userName,
    name: eventName,
    availability: {},
  };

  res.status(200).json({ eventId });
  console.log(`✅ Created event: ${eventId} by ${userName}`);
});

// Save availability
app.post("/saveAvailability", (req, res) => {
  const { name, eventId, availability } = req.body; // Use eventId directly

  if (!eventId || !events[eventId]) {
    return res.status(404).json({ error: "Event not found" });
  }

  events[eventId].availability[name] = availability;
  res.status(200).json({ message: "Availability saved" });
  console.log(`✅ Saved availability for ${name} in event ${eventId}`);
});

// Save guest availability (updated to include eventId from URL)
app.post("/submitGuestAvailability", (req, res) => {
  const { name, availability } = req.body;
  const { eventId } = req.query; // Get eventId from URL query params
  
  if (!eventId || !events[eventId]) {
    return res.status(404).json({ error: "Event not found" });
  }
  
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  
  events[eventId].availability[name] = availability;
  res.status(200).json({ message: "Guest availability saved", eventId });
  console.log(`✅ Saved guest availability for ${name} in event ${eventId}`);
});

// Get availability for an event (fixed to return array format)
app.get("/getAvailability", (req, res) => {
  const { eventId } = req.query;

  if (!eventId || !events[eventId]) {
    return res.status(404).json({ error: "Event not found" });
  }

  // Convert object to array format expected by calendar
  const availabilityArray = [];
  Object.entries(events[eventId].availability).forEach(([personName, slots]) => {
    console.log(`Processing availability for: ${personName}`, slots);
    if (Array.isArray(slots)) {
      slots.forEach(slot => {
        if (slot.start && slot.end) { // Only add valid time slots
          availabilityArray.push({
            title: personName, // Use the person's name as the title
            start: slot.start,
            end: slot.end
          });
        }
      });
    }
  });

  console.log("Sending availability array:", availabilityArray);
  res.status(200).json(availabilityArray);
});

// Get event metadata (name + host)
app.get("/getEventDetails", (req, res) => {
  const { eventId } = req.query;

  if (!eventId || !events[eventId]) {
    return res.status(404).json({ error: "Event not found" });
  }

  const { name, host } = events[eventId];
  res.status(200).json({ eventName: name, hostName: host });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});