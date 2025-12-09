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
