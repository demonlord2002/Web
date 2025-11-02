const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/movies", (req, res) => {
  fs.readFile(path.join(__dirname, "movies.json"), "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading movies.json" });
    res.json(JSON.parse(data));
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
