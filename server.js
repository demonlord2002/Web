const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Fetch all movies
app.get("/api/movies", (req, res) => {
  fs.readFile(path.join(__dirname, "movies.json"), "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading movies.json" });
    res.json(JSON.parse(data));
  });
});

// ✅ Fetch top downloaded movies (Netflix-style section)
app.get("/api/top-movies", (req, res) => {
  fs.readFile(path.join(__dirname, "movies.json"), "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading movies.json" });

    let movies = JSON.parse(data);

    // Sort by downloads (highest first)
    const topMovies = movies
      .filter(m => typeof m.downloads === "number") // only those with a downloads field
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10); // top 10 movies

    res.json(topMovies);
  });
});

// ✅ Optional: Auto-increase download count when a user visits a movie link
app.post("/api/increment-download", (req, res) => {
  const { title } = req.body;
  const filePath = path.join(__dirname, "movies.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading movies.json" });

    let movies = JSON.parse(data);
    const movie = movies.find(m => m.title === title);
    if (movie) movie.downloads = (movie.downloads || 0) + 1;

    fs.writeFile(filePath, JSON.stringify(movies, null, 2), err => {
      if (err) return res.status(500).json({ error: "Error writing movies.json" });
      res.json({ success: true, newCount: movie.downloads });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
