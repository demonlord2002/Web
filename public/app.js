const container = document.getElementById("movieContainer");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;
let filteredMovies = null; // Track filtered list

/* ========================================================= */
/* ✅ FETCH & DISPLAY MOVIES                                 */
/* ========================================================= */
async function fetchMovies() {
  const res = await fetch("/api/movies");
  movies = await res.json();

  // ✅ Show latest uploads first
  movies.reverse();

  displayMovies();
}

function displayMovies(list = null) {
  const movieList = list || movies;
  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const visibleMovies = movieList.slice(start, end);
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
                <a href="${q.url}" target="_blank" class="download-btn">Download Now</a>
              </p>
            `
            )
            .join("")}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  setupPagination(movieList);
}

/* ========================================================= */
/* ✅ PAGINATION WITH PREVIOUS / NEXT                        */
/* ========================================================= */
function setupPagination(list) {
  const pageCount = Math.ceil(list.length / moviesPerPage);
  pagination.innerHTML = "";

  // Previous Button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      displayMovies(list);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  pagination.appendChild(prevBtn);

  // Page Numbers
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.background = "#ff003c";
    btn.onclick = () => {
      currentPage = i;
      displayMovies(list);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    pagination.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === pageCount;
  nextBtn.onclick = () => {
    if (currentPage < pageCount) {
      currentPage++;
      displayMovies(list);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  pagination.appendChild(nextBtn);
}

/* ========================================================= */
/* ✅ SEARCH FUNCTIONALITY                                   */
/* ========================================================= */
searchBar.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  currentPage = 1; // Reset to first page on search

  if (term === "") {
    filteredMovies = null;
    displayMovies();
  } else {
    filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(term)
    );
    displayMovies(filteredMovies);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ========================================================= */
/* ✅ LOAD ALL MOVIES                                        */
/* ========================================================= */
fetchMovies();

/* ========================================================= */
/* ✅ DOWNLOAD BUTTON ANIMATION (MATCH SITE DESIGN)         */
/* ========================================================= */
const style = document.createElement('style');
style.innerHTML = `
.download-btn {
  display: inline-block;
  margin: 5px 0;
  padding: 10px 20px;
  color: #fff;
  background: #ff003c;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 0 10px #ff003c, 0 0 15px #ff3366;
  transition: all 0.3s ease;
  animation: glowRed 1.5s infinite alternate;
  text-decoration: none;
}

.download-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px #ff003c, 0 0 30px #ff3366;
}

@keyframes glowRed {
  0% { box-shadow: 0 0 10px #ff003c, 0 0 15px #ff3366; }
  50% { box-shadow: 0 0 15px #ff003c, 0 0 25px #ff3366; }
  100% { box-shadow: 0 0 20px #ff003c, 0 0 30px #ff3366; }
}
`;
document.head.appendChild(style);
