const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Needed for POST requests

const MOVIES_PATH = path.join(__dirname, "movies.json");

/* ============================================================
   ✅ FETCH ALL MOVIES
   ============================================================ */
app.get("/api/movies", (req, res) => {
  fs.readFile(MOVIES_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading movies.json" });
    try {
      const movies = JSON.parse(data);
      res.json(movies);
    } catch {
      res.status(500).json({ error: "Invalid movies.json format" });
    }
  });
});

/* ============================================================
   🎬 FETCH TOP DOWNLOADED MOVIES (NEW FEATURE)
   ============================================================ */
app.get("/api/top-movies", (req, res) => {
  fs.readFile(MOVIES_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading movies.json" });
    try {
      let movies = JSON.parse(data);

      // Sort by downloads (highest first)
      const topMovies = movies
        .map(m => ({ ...m, downloads: m.downloads || 0 })) // ensure downloads field exists
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 10);

      res.json(topMovies);
    } catch {
      res.status(500).json({ error: "Invalid movies.json format" });
    }
  });
});

/* ============================================================
   📈 INCREMENT DOWNLOAD COUNT (OPTIONAL)
   ============================================================ */
app.post("/api/increment-download", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  fs.readFile(MOVIES_PATH, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading movies.json" });
    try {
      let movies = JSON.parse(data);
      const movie = movies.find(m => m.title === title);

      if (!movie) return res.status(404).json({ error: "Movie not found" });

      movie.downloads = (movie.downloads || 0) + 1;

      fs.writeFile(MOVIES_PATH, JSON.stringify(movies, null, 2), err => {
        if (err) return res.status(500).json({ error: "Error writing movies.json" });
        res.json({ success: true, title, newCount: movie.downloads });
      });
    } catch {
      res.status(500).json({ error: "Invalid movies.json format" });
    }
  });
});

/* ============================================================
   🚀 START SERVER
   ============================================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
