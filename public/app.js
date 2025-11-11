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
          ${movie.qualities.map(q => `
            <p>📥 ${q.label} →
              <a href="${q.url}" class="download-btn" target="_blank">Download Now</a>
            </p>`).join("")}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  setupPagination(list);
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
/* ===================== INITIAL LOAD ===================== */
/* ========================================================= */
fetchMovies();
