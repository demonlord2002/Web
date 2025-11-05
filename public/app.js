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
                <span class="timer-text" style="display:none; color:#fff; margin-left:10px;"></span>
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
                <span class="timer-text" style="display:none; color:#fff; margin-left:10px;"></span>
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

/* ✅ Fullscreen Native Banner Ad + 18s Timer */
function showAdAndStartTimer(url, btn) {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "fullscreen-ad-overlay";
  overlay.innerHTML = `
    <div class="ad-container">
      <div id="ad-slot"></div>
      <p class="tap-text">👉 Tap the ad to start countdown</p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Insert Adstraa ad script dynamically
  const adScript = document.createElement("script");
  adScript.async = true;
  adScript.dataset.cfasync = "false";
  adScript.src = "//pl27968658.effectivegatecpm.com/ea5f5730b58a527b1a36d686e5d2fbf3/invoke.js";
  overlay.querySelector("#ad-slot").appendChild(adScript);

  // When user taps anywhere on ad
  overlay.addEventListener("click", () => {
    const tapText = overlay.querySelector(".tap-text");
    if (!tapText.classList.contains("active")) {
      tapText.classList.add("active");
      tapText.textContent = "⏳ Please wait 18s...";
      startCountdown(url, btn, overlay, tapText);
    }
  });
}

function startCountdown(url, btn, overlay, tapText) {
  let timeLeft = 18;
  const timer = setInterval(() => {
    timeLeft--;
    tapText.textContent = `⏳ Please wait ${timeLeft}s...`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      overlay.remove(); // close ad
      tapText.classList.remove("active");
      showFinalButton(btn);
    }
  }, 1000);
}

function showFinalButton(btn) {
  btn.style.display = "none";
  const timerEl = btn.nextElementSibling;
  const finalLink = timerEl.nextElementSibling;

  finalLink.style.display = "inline-block";
  finalLink.classList.add("show-download");
}

// ✅ Load all movies (latest-first)
fetchMovies();
