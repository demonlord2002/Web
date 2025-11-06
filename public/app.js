const container = document.getElementById("movieContainer");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;

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
                <button class="download-btn" onclick="showAdAndStartTimer('${q.url}', this)">Download</button>
                <span class="timer-text" style="display:none;"></span>
                <a href="${q.url}" class="final-download-btn" target="_blank" style="display:none;">Download Now</a>
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
                <button class="download-btn" onclick="showAdAndStartTimer('${q.url}', this)">Download</button>
                <span class="timer-text" style="display:none;"></span>
                <a href="${q.url}" class="final-download-btn" target="_blank" style="display:none;">Download Now</a>
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
/* ✅ FULLSCREEN SMART-LINK AD + 18s VALID WAIT LOGIC       */
/* ========================================================= */
function showAdAndStartTimer(url, btn) {
  const overlay = document.createElement("div");
  overlay.className = "fullscreen-ad-overlay";
  overlay.innerHTML = `
    <div class="ad-container">
      <h2>Advertisement</h2>
      <a href="https://www.effectivegatecpm.com/r88d38mj?key=774f077c3d6adc3bc3d33fffe27a66fe"
         target="_blank" class="ad-download-btn"
         style="display:inline-block; background:#ff003c; color:white; padding:10px 20px; border-radius:25px; text-decoration:none; box-shadow:0 0 15px #ff003c; transition:all 0.3s ease;">Download Now</a>
      <p class="tap-text">Click the red button to open the ad. Stay 18s on that page!</p>
      <p class="countdown-text" style="display:none;">⏳ Waiting: 18s</p>
    </div>
  `;
  document.body.appendChild(overlay);

  const adButton = overlay.querySelector(".ad-download-btn");
  const tapText = overlay.querySelector(".tap-text");
  const countdownText = overlay.querySelector(".countdown-text");

  let timerStarted = false;
  let adStartTime = 0;
  let interval;

  adButton.addEventListener("click", () => {
    if (timerStarted) return; // prevent double click
    timerStarted = true;

    adStartTime = Date.now();
    tapText.style.display = "none";
    countdownText.style.display = "block";

    // Open the ad in a new tab
    window.open(adButton.href, "_blank");

    // Update countdown every second
    interval = setInterval(() => {
      const elapsed = (Date.now() - adStartTime) / 1000;
      const remaining = Math.ceil(18 - elapsed);

      if (remaining <= 0) {
        clearInterval(interval);
        overlay.remove();
        showFinalButton(btn);
      } else {
        countdownText.textContent = `⏳ Please stay on the ad page. Time left: ${remaining}s`;
      }
    }, 1000);
  });

  // Prevent timer from starting if user comes back before clicking
  window.addEventListener("focus", function onReturn() {
    if (!timerStarted) return;
  });
}

/* ✅ Show final download button after 18s */
function showFinalButton(btn) {
  btn.style.display = "none";
  const timerEl = btn.nextElementSibling;
  const finalLink = timerEl.nextElementSibling;

  finalLink.style.display = "inline-block";
  finalLink.classList.add("show-download");
}

/* ✅ Load all movies */
fetchMovies();
