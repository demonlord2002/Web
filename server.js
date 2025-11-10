const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== MONGO SETUP ======
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://drdoom2003p:drdoom2003p@cluster0.fnhjrtn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== Movie Schema ======
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  image: String,
  qualities: Array,
  downloadCount: { type: Number, default: 0 },
});

const Movie = mongoose.model("Movie", movieSchema);

// ====== Load movies.json and update MongoDB ======
fs.readFile(path.join(__dirname, "movies.json"), "utf-8", async (err, data) => {
  if (err) return console.log("❌ Error reading movies.json");

  try {
    const movies = JSON.parse(data);

    // Delete old movies and import fresh from movies.json
    await Movie.deleteMany({});
    await Movie.insertMany(movies);
    console.log("✅ Movies imported/updated in MongoDB");
  } catch (error) {
    console.error("❌ Error parsing/inserting movies.json:", error);
  }
});

// ====== API ROUTES ======

// Get all movies
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ title: 1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// Increment download count
app.post("/api/increment", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title missing" });

  try {
    const movie = await Movie.findOne({ title });
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    movie.downloadCount += 1;
    await movie.save();

    res.json({ success: true, downloadCount: movie.downloadCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to increment download count" });
  }
});

// Get top downloads
app.get("/api/top-downloads", async (req, res) => {
  try {
    const topMovies = await Movie.find().sort({ downloadCount: -1 }).limit(10);
    res.json(topMovies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top downloads" });
  }
});

// ====== Start Server ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
