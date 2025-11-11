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
/* ✅ FETCH & DISPLAY MOVIES =============================== */
/* ========================================================= */
async function fetchMovies() {
  try {
    const res = await fetch("/api/movies");
    movies = await res.json();
    movies.reverse();
    displayMovies();
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

    const movieKey = movie.title.toLowerCase().trim();

    card.innerHTML = `
      <div class="movie-row">
        <img src="${movie.image}" alt="${movie.title}" class="movie-img" />
        <div class="movie-info">
          <h2>${movie.title}</h2>
          ${movie.qualities
            .map(
              (q) => `
              <p>📥 ${q.label} →
                <a href="${q.url}" class="download-btn" target="_blank"
                   data-movie="${movieKey}">Download Now</a>
              </p>`
            )
            .join("")}
        </div>
      </div>`;
    container.appendChild(card);
  });

  setupPagination(list);
  styleDownloadButtons();
}

/* ========================================================= */
/* ✅ PAGINATION (Stable after search/back) ================ */
/* ========================================================= */
function setupPagination(list = movies) {
  pagination.innerHTML = "";
  const pageCount = Math.ceil(list.length / moviesPerPage);
  if (pageCount <= 1) return;

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

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.background = "#ff003c";
    btn.onclick = () => {
      currentPage = i;
      displayMovies(isSearching ? filteredMovies : movies);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    pagination.appendChild(btn);
  }

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
/* ✅ SEARCH BAR (Stable pagination) ======================= */
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
  filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(term)
  );
  currentPage = 1;
  displayMovies(filteredMovies);
});

/* ========================================================= */
/* ✅ RED GLOWING ANIMATED DOWNLOAD BUTTON ================= */
/* ========================================================= */
function styleDownloadButtons() {
  document.querySelectorAll(".download-btn").forEach((btn) => {
    btn.style.textDecoration = "none";
    btn.style.border = "none";
    btn.style.padding = "8px 20px";
    btn.style.borderRadius = "25px";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "700";
    btn.style.color = "#fff";
    btn.style.letterSpacing = "0.5px";
    btn.style.transition = "all 0.3s ease";
    btn.style.background = "linear-gradient(90deg, #ff003c, #ff4d6d)";
    btn.style.boxShadow = "0 0 18px rgba(255, 0, 80, 0.9)";
    btn.style.animation = "pulseRed 2s infinite";

    // Hover effect
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "scale(1.08)";
      btn.style.boxShadow = "0 0 25px rgba(255, 0, 90, 1)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "0 0 18px rgba(255, 0, 80, 0.9)";
    });

    // Click action animation
    btn.addEventListener("click", (e) => {
      e.target.classList.add("clicked-flash");
      setTimeout(() => e.target.classList.remove("clicked-flash"), 500);
    });
  });
}

/* ========================================================= */
/* ✅ KEYFRAME ANIMATIONS (Dynamic CSS Injected) ============ */
/* ========================================================= */
const style = document.createElement("style");
style.textContent = `
@keyframes pulseRed {
  0% { box-shadow: 0 0 12px rgba(255, 0, 80, 0.6); transform: scale(1); }
  50% { box-shadow: 0 0 22px rgba(255, 0, 80, 1); transform: scale(1.03); }
  100% { box-shadow: 0 0 12px rgba(255, 0, 80, 0.6); transform: scale(1); }
}

.clicked-flash {
  animation: flashClick 0.5s ease;
}

@keyframes flashClick {
  0% { background: linear-gradient(90deg, #ff4d6d, #ff003c); box-shadow: 0 0 40px rgba(255,255,255,1); transform: scale(1.15); }
  100% { background: linear-gradient(90deg, #ff003c, #ff4d6d); box-shadow: 0 0 18px rgba(255, 0, 80, 0.9); transform: scale(1); }
}
`;
document.head.appendChild(style);

/* ========================================================= */
/* ✅ INITIAL LOAD ========================================= */
/* ========================================================= */
fetchMovies();
