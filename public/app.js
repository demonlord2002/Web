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
                <button class="download-btn" onclick="showAdAndStartTimer('${q.url}', this)">Generate Link</button>
                <span class="timer-text" style="display:none;"></span>
                <a href="${q.url}" class="final-download-btn" target="_blank" style="display:none;">Click Here</a>
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
                <button class="download-btn" onclick="showAdAndStartTimer('${q.url}', this)">Generate Link</button>
                <span class="timer-text" style="display:none;"></span>
                <a href="${q.url}" class="final-download-btn" target="_blank" style="display:none;">Click Here</a>
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
/* ✅ FULLSCREEN SMART-LINK AD + 18s TIMER FUNCTION          */
/* ========================================================= */
function showAdAndStartTimer(url, btn) {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "fullscreen-ad-overlay";
  overlay.innerHTML = `
    <div class="ad-container">
      <h2>Advertisement</h2>
      <a href="https://www.effectivegatecpm.com/r88d38mj?key=774f077c3d6adc3bc3d33fffe27a66fe"
         target="_blank" class="ad-download-btn"
         style="display:inline-block; background:#ff003c; color:white; padding:10px 20px; border-radius:25px; text-decoration:none; box-shadow:0 0 15px #ff003c; transition:all 0.3s ease;">Download Now</a>
      <p class="tap-text">Click the red button above to open the ad</p>
    </div>
  `;
  document.body.appendChild(overlay);

  const adButton = overlay.querySelector(".ad-download-btn");
  const tapText = overlay.querySelector(".tap-text");

  adButton.addEventListener("click", () => {
    // Change to yellow
    adButton.style.background = "#ffd700";
    adButton.style.boxShadow = "0 0 25px #ffd700";

    // Open ad in new tab
    window.open(
      "https://www.effectivegatecpm.com/r88d38mj?key=774f077c3d6adc3bc3d33fffe27a66fe",
      "_blank"
    );

    // Start countdown
    let timeLeft = 18;
    tapText.textContent = `⏳ Please wait ${timeLeft}s...`;
    tapText.style.color = "#00ff99";
    const timer = setInterval(() => {
      timeLeft--;
      tapText.textContent = `⏳ Please wait ${timeLeft}s...`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        overlay.remove(); // close popup
        showFinalButton(btn);
      }
    }, 1000);
  });
}

/* ✅ Show green "Click Here" button after ad finishes */
function showFinalButton(btn) {
  btn.style.display = "none";
  const timerEl = btn.nextElementSibling;
  const finalLink = timerEl.nextElementSibling;

  finalLink.style.display = "inline-block";
  finalLink.classList.add("show-download");
}

// ✅ Load all movies
fetchMovies();
