const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ----------------- MONGODB CONNECTION -----------------
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://drdoom2003p:drdoom2003p@cluster0.fnhjrtn.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// ----------------- MOVIE SCHEMA -----------------
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: String,
  qualities: [
    {
      label: String,
      url: String
    }
  ],
  downloads: { type: Number, default: 0 }
});

const Movie = mongoose.model("Movie", movieSchema);

// ----------------- API ROUTES -----------------

// GET all movies
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ _id: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies" });
  }
});

// GET top 10 downloaded movies
app.get("/api/top-movies", async (req, res) => {
  try {
    const topMovies = await Movie.find().sort({ downloads: -1 }).limit(10);
    res.json(topMovies);
  } catch (err) {
    res.status(500).json({ error: "Error fetching top movies" });
  }
});

// POST increment download count
app.post("/api/increment-download", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  try {
    const movie = await Movie.findOneAndUpdate(
      { title },
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!movie) return res.status(404).json({ error: "Movie not found" });

    res.json({ success: true, title, newCount: movie.downloads });
  } catch (err) {
    res.status(500).json({ error: "Error updating downloads" });
  }
});

// Fallback route for frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
