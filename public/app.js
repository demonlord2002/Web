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
                   data-url="${q.url}">Download Now</a>
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

  // Prev
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

  // Page numbers
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

  // Next
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
/* ✅ RED/GREEN GLOWING DOWNLOAD BUTTON ==================== */
/* ✅ Stay Green even after Refresh (localStorage) ========= */
/* ========================================================= */
function styleDownloadButtons() {
  const clickedSet =
    new Set(JSON.parse(localStorage.getItem("clickedDownloads") || "[]"));

  document.querySelectorAll(".download-btn").forEach((btn) => {
    const url = btn.getAttribute("data-url");

    // Default red glowing style
    btn.style.textDecoration = "none";
    btn.style.border = "none";
    btn.style.padding = "6px 16px";
    btn.style.borderRadius = "25px";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "600";
    btn.style.transition = "all 0.3s ease";

    // Apply style depending on clicked or not
    if (clickedSet.has(url)) {
      setGreenStyle(btn);
    } else {
      setRedStyle(btn);
    }

    // Hover effect
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "scale(1.08)";
      if (clickedSet.has(url)) {
        btn.style.boxShadow = "0 0 20px rgba(0,255,120,1)";
      } else {
        btn.style.boxShadow = "0 0 20px rgba(255,0,90,1)";
      }
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "scale(1)";
      if (clickedSet.has(url)) {
        btn.style.boxShadow = "0 0 12px rgba(0,255,120,0.8)";
      } else {
        btn.style.boxShadow = "0 0 10px rgba(255, 0, 60, 0.7)";
      }
    });

    // Click → turns green permanently
    btn.addEventListener("click", () => {
      clickedSet.add(url);
      localStorage.setItem(
        "clickedDownloads",
        JSON.stringify(Array.from(clickedSet))
      );
      setGreenStyle(btn);
    });
  });
}

function setRedStyle(btn) {
  btn.style.background = "linear-gradient(90deg, #ff003c, #ff4d6d)";
  btn.style.color = "#fff";
  btn.style.boxShadow = "0 0 10px rgba(255, 0, 60, 0.7)";
}

function setGreenStyle(btn) {
  btn.style.background = "linear-gradient(90deg, #00c851, #00e676)";
  btn.style.color = "#fff";
  btn.style.boxShadow = "0 0 12px rgba(0,255,120,0.8)";
}

/* ========================================================= */
/* ✅ INITIAL LOAD ========================================= */
/* ========================================================= */
fetchMovies();
