const container = document.getElementById("movieContainer");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;

/* ========================================================= */
/* ✅ FETCH & DISPLAY MOVIES (CLEAN & UPDATED)             */
/* ========================================================= */
async function fetchMovies() {
  const res = await fetch("/api/movies");
  movies = await res.json();

  // ✅ Show latest uploads first
  movies.reverse();

  displayMovies();
}

function displayMovies() {
  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const visibleMovies = movies.slice(start, end);
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

  setupPagination();
}

function setupPagination() {
  pagination.innerHTML = "";
  const pageCount = Math.ceil(movies.length / moviesPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      displayMovies();
    };
    if (i === currentPage) btn.style.background = "#ff003c";
    pagination.appendChild(btn);
  }
}

searchBar.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = movies.filter((movie) =>
    movie.title.toLowerCase().includes(term)
  );
  displayFiltered(filtered);
});

function displayFiltered(list) {
  container.innerHTML = "";
  list.forEach((movie) => {
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
  pagination.innerHTML = "";
}

/* ========================================================= */
/* ✅ LOAD ALL MOVIES                                        */
/* ========================================================= */
fetchMovies();

/* ========================================================= */
/* ✅ DOWNLOAD BUTTON ANIMATION (Glowing Red)               */
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
  box-shadow: 0 0 10px #ff003c;
  transition: all 0.3s ease;
  animation: glowRed 1.5s infinite alternate;
  text-decoration: none;
}

.download-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px #ff3366;
}

@keyframes glowRed {
  0% {
    box-shadow: 0 0 10px #ff003c, 0 0 20px #ff3366;
  }
  50% {
    box-shadow: 0 0 15px #ff003c, 0 0 25px #ff3366;
  }
  100% {
    box-shadow: 0 0 20px #ff003c, 0 0 30px #ff3366;
  }
}
`;
document.head.appendChild(style);
