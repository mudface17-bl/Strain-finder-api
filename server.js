const express = require("express");
const cors = require("cors");

const strains = require("./strains.json");
const dispensaries = require("./dispensaries.json");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Strain Finder API is running!");
});
app.get("/search", (req, res) => {
  const q = (req.query.strain || "").toLowerCase();
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  if (!q) {
    return res.status(400).json({ error: "Missing strain query" });
  }

  // simple Haversine distance
  function distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const matches = dispensaries
    .filter((d) => d.strain.toLowerCase().includes(q))
    .map((d) => {
      if (userLat && userLng && d.lat && d.lng) {
        d.distanceKm = distanceKm(userLat, userLng, d.lat, d.lng);
      } else {
        d.distanceKm = null;
      }
      return d;
    })
    .sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, 3);

  res.json(matches);
});
// --- SEARCH STRAINS ---
app.get("/search", (req, res) => {
  const q = (req.query.strain || "").toLowerCase();
  const matches = dispensaries.filter(d =>
    d.strain.toLowerCase().includes(q)
  );
  res.json(matches);
});

// --- STRAIN PROFILE ---
app.get("/strain/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const strain = strains.find(s => s.name.toLowerCase() === name);
  if (!strain) {
    return res.status(404).json({ error: "Strain not found" });
  }
  res.json(strain);
});

// --- DISPENSARIES NEAR ME ---
app.get("/nearby", (req, res) => {
  const { strain } = req.query;
  const q = (strain || "").toLowerCase();
  const matches = dispensaries.filter(d =>
    d.strain.toLowerCase().includes(q)
  );
  res.json(matches);
});

// Set the port and start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
