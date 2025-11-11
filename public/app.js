/* ========================================================= */
/* =================== ELEMENT SELECTORS ================== */
/* ========================================================= */
const container = document.getElementById("movieContainer");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");
const topContainer = document.getElementById("topDownloads");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;
let filteredMovies = [];
let isSearching = false;

/* ========================================================= */
/* ===================== FETCH & DISPLAY ================== */
/* ========================================================= */
async function fetchMovies() {
  try {
    const res = await fetch("/api/movies");
    movies = await res.json();
    movies.reverse(); // latest first
    displayMovies();
    fetchTopDownloads();
  } catch (err) {
    console.error("Error fetching movies:", err);
  }
}

function displayMovies(list = movies) {
  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const visibleMovies = list.slice(start, end);
  container.innerHTML = "";

  visibleMovies.forEach((movie) => {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <div class="movie-row">
        <img src="${movie.image}" alt="${movie.title}" class="movie-img" />
        <div class="movie-info">
          <h2>${movie.title}</h2>
          ${movie.qualities
            .map(
              (q) => `
            <p>📥 ${q.label} →
              <a href="${q.url}" class="download-btn" target="_blank">Download Now</a>
            </p>`
            )
            .join("")}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  setupPagination(list);
  styleDownloadButtons(); // Apply glowing red style
}

/* ========================================================= */
/* ===================== PAGINATION ======================= */
/* ========================================================= */
function setupPagination(list = movies) {
  pagination.innerHTML = "";

  const pageCount = Math.ceil(list.length / moviesPerPage);
  if (pageCount <= 1) return;

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "⟨ Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      displayMovies(isSearching ? filteredMovies : movies);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  pagination.appendChild(prevBtn);

  // Number buttons
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      displayMovies(isSearching ? filteredMovies : movies);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (i === currentPage) btn.style.background = "#ff003c";
    pagination.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ⟩";
  nextBtn.disabled = currentPage === pageCount;
  nextBtn.onclick = () => {
    if (currentPage < pageCount) {
      currentPage++;
      displayMovies(isSearching ? filteredMovies : movies);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  pagination.appendChild(nextBtn);
}

/* ========================================================= */
/* ===================== SEARCH BAR ======================= */
/* ========================================================= */
searchBar.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase().trim();
  if (term === "") {
    isSearching = false;
    filteredMovies = [];
    currentPage = 1;
    displayMovies(movies);
    return;
  }

  isSearching = true;
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(term)
  );
  currentPage = 1;
  displayMovies(filteredMovies);
});

/* ========================================================= */
/* ===================== TOP DOWNLOADS ===================== */
/* ========================================================= */
async function fetchTopDownloads() {
  if (!topContainer) return;
  try {
    const res = await fetch("/api/top-downloads");
    const topMovies = await res.json();
    topMovies.reverse();

    topContainer.innerHTML = "";
    topMovies.forEach((movie) => {
      const card = document.createElement("div");
      card.classList.add("top-movie-card");
      card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}" class="top-movie-img" />
        <h3>${movie.title}</h3>
        <p>📈 ${movie.downloadCount || 0} downloads</p>
      `;
      topContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching top downloads:", err);
  }
}

/* ========================================================= */
/* ===================== DOWNLOAD BUTTON STYLE ============ */
/* ========================================================= */
function styleDownloadButtons() {
  const buttons = document.querySelectorAll(".download-btn");

  buttons.forEach((btn) => {
    // Base style
    btn.style.textDecoration = "none";
    btn.style.color = "#fff";
    btn.style.background = "#ff003c";
    btn.style.padding = "6px 14px";
    btn.style.borderRadius = "6px";
    btn.style.fontWeight = "600";
    btn.style.transition = "all 0.3s ease";
    btn.style.boxShadow = "0 0 8px rgba(255, 0, 60, 0.5)";
    btn.style.display = "inline-block";
    btn.style.marginLeft = "8px";

    // Hover animation
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#ff1f5a";
      btn.style.boxShadow = "0 0 15px rgba(255, 30, 80, 0.8)";
      btn.style.transform = "scale(1.06)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.background = "#ff003c";
      btn.style.boxShadow = "0 0 8px rgba(255, 0, 60, 0.5)";
      btn.style.transform = "scale(1)";
    });

    // Click / tap glow switch effect
    btn.addEventListener("mousedown", () => {
      btn.style.background = "#00c851"; // green
      btn.style.boxShadow = "0 0 18px rgba(0, 255, 100, 0.8)";
      btn.style.transform = "scale(1.08)";
    });

    btn.addEventListener("mouseup", () => {
      btn.style.background = "#ff003c";
      btn.style.boxShadow = "0 0 10px rgba(255, 0, 60, 0.7)";
      btn.style.transform = "scale(1.02)";
    });
  });
}

/* ========================================================= */
/* ===================== INITIAL LOAD ===================== */
/* ========================================================= */
fetchMovies();
