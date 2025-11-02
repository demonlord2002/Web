const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// API endpoint for movies
app.get("/api/movies", (req, res) => {
  fs.readFile(path.join(__dirname, "movies.json"), "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading movies.json:", err);
      return res.status(500).json({ error: "Error reading movies.json" });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseError) {
      console.error("Error parsing movies.json:", parseError);
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

// Serve index.html for all other routes (important for Heroku)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Heroku port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
