const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Movie Schema
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

/* ============================================================
   ✅ FETCH ALL MOVIES
   ============================================================ */
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies" });
  }
});

/* ============================================================
   🎬 FETCH TOP DOWNLOADED MOVIES
   ============================================================ */
app.get("/api/top-movies", async (req, res) => {
  try {
    const topMovies = await Movie.find().sort({ downloads: -1 }).limit(10);
    res.json(topMovies);
  } catch (err) {
    res.status(500).json({ error: "Error fetching top movies" });
  }
});

/* ============================================================
   📈 INCREMENT DOWNLOAD COUNT
   ============================================================ */
app.post("/api/increment-download", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  try {
    const movie = await Movie.findOneAndUpdate(
      { title },
      { $inc: { downloads: 1 } },
      { new: true, upsert: false }
    );

    if (!movie) return res.status(404).json({ error: "Movie not found" });

    res.json({ success: true, title, newCount: movie.downloads });
  } catch (err) {
    res.status(500).json({ error: "Error updating downloads" });
  }
});

/* ============================================================
   🚀 START SERVER
   ============================================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
