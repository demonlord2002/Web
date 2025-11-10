/* ========================================================= */
/* 🎬 NETFLIX-STYLE TOP DOWNLOADED MOVIES SECTION            */
/* ========================================================= */

async function loadTopMovies() {
  try {
    const res = await fetch("/api/top-movies");
    const topMovies = await res.json();
    const topContainer = document.getElementById("topMoviesContainer");

    if (!topContainer) return; // if section not in HTML, skip

    topContainer.innerHTML = topMovies
      .map(
        (movie) => `
        <div class="top-card" onclick="scrollToMovie('${movie.title}')">
          <img src="${movie.image}" alt="${movie.title}">
          <div class="top-overlay">
            <h3>${movie.title}</h3>
            <p>🔥 ${movie.downloads || 0} Downloads</p>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading top movies:", err);
  }
}

/* 🧭 Smooth scroll to that movie on main list */
function scrollToMovie(title) {
  const movieCards = document.querySelectorAll(".movie-card h2");
  for (const h2 of movieCards) {
    if (h2.textContent.trim() === title.trim()) {
      h2.scrollIntoView({ behavior: "smooth", block: "center" });
      h2.style.color = "#ff003c";
      setTimeout(() => (h2.style.color = ""), 2000);
      break;
    }
  }
}

/* ========================================================= */
/* 🔁 AUTO-INCREMENT DOWNLOAD COUNT WHEN USER OPENS LINK     */
/* ========================================================= */

async function incrementDownload(title) {
  try {
    await fetch("/api/increment-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  } catch (err) {
    console.warn("Download increment failed:", err);
  }
}

/* Hook into existing final download click */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("final-download-btn")) {
    const movieTitle =
      e.target.closest(".movie-card")?.querySelector("h2")?.textContent;
    if (movieTitle) incrementDownload(movieTitle);
  }
});

/* 🚀 Load Top Movies on startup */
window.addEventListener("DOMContentLoaded", loadTopMovies);
