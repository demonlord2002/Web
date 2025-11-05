const container = document.getElementById("movieContainer");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;

async function fetchMovies() {
  const res = await fetch("/api/movies");
  movies = await res.json();

  // ✅ Reverse order so latest uploaded movies show first
  movies.reverse();

  displayMovies();
}

function displayMovies() {
  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const visibleMovies = movies.slice(start, end);
  container.innerHTML = "";

  visibleMovies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    // ✅ Image left + text/buttons right layout (unchanged)
    card.innerHTML = `
      <div class="movie-row">
        <img src="${movie.image}" alt="${movie.title}" class="movie-img" />
        <div class="movie-info">
          <h2>${movie.title}</h2>
          ${movie.qualities.map(q => `
            <p>📥 ${q.label} →
              <button class="download-btn" onclick="startDownloadTimer('${q.url}', this)">Generate Link</button>
              <span class="timer-text" style="display:none; color:#fff; margin-left:10px;"></span>
              <a href="${q.url}" class="final-download-btn" target="_blank" style="display:none;">Click Here</a>
            </p>
          `).join('')}
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
  const filtered = movies.filter(movie =>
    movie.title.toLowerCase().includes(term)
  );
  displayFiltered(filtered);
});

function displayFiltered(list) {
  container.innerHTML = "";
  list.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <div class="movie-row">
        <img src="${movie.image}" alt="${movie.title}" class="movie-img" />
        <div class="movie-info">
          <h2>${movie.title}</h2>
          ${movie.qualities.map(q => `
            <p>📥 ${q.label} →
              <button class="download-btn" onclick="startDownloadTimer('${q.url}', this)">Generate Link</button>
              <span class="timer-text" style="display:none; color:#fff; margin-left:10px;"></span>
              <a href="${q.url}" class="final-download-btn" target="_blank" style="display:none;">Click Here</a>
            </p>
          `).join('')}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  pagination.innerHTML = "";
}

// ✅ 18-second timer feature (NEW)
function startDownloadTimer(url, btn) {
  btn.disabled = true;
  btn.style.display = "none";

  const timerEl = btn.nextElementSibling; // span.timer-text
  const finalLink = timerEl.nextElementSibling; // a.final-download-btn

  let timeLeft = 18;
  timerEl.style.display = "inline";
  timerEl.textContent = `Please wait ${timeLeft}s...`;

  const countdown = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Please wait ${timeLeft}s...`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      timerEl.style.display = "none";
      finalLink.style.display = "inline-block";
    }
  }, 1000);
}

// ✅ Load all movies (latest-first)
fetchMovies();
