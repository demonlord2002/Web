const container = document.getElementById("movieContainer");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");
const topContainer = document.getElementById("topMoviesContainer");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;

/* ================== ADVANCED ADBLOCK + BRAVE DETECTION ================== */
function detectAdBlockerAdvanced() {
  let adDetected = false;

  const adDiv = document.createElement('div');
  adDiv.className = 'adsbox';
  adDiv.style.height = '1px';
  adDiv.style.position = 'absolute';
  adDiv.style.top = '-1000px';
  document.body.appendChild(adDiv);
  if (adDiv.offsetHeight === 0) adDetected = true;
  adDiv.remove();

  const bait = document.createElement('div');
  bait.className = 'adsbox bait';
  bait.style.width = '1px';
  bait.style.height = '1px';
  bait.style.position = 'absolute';
  bait.style.top = '-9999px';
  document.body.appendChild(bait);
  const baitStyle = getComputedStyle(bait);
  if (baitStyle.display === 'none' || baitStyle.visibility === 'hidden') adDetected = true;
  bait.remove();

  const scriptCheck = new Promise((resolve) => {
    const testScript = document.createElement('script');
    testScript.type = 'text/javascript';
    testScript.async = true;
    testScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    let called = false;
    testScript.onerror = () => { if (!called) { called = true; resolve(true); } };
    testScript.onload = () => { if (!called) { called = true; resolve(false); } };
    document.head.appendChild(testScript);
  });

  const braveCheck = new Promise((resolve) => {
    if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
      navigator.brave.isBrave().then(resolve);
    } else resolve(false);
  });

  Promise.all([scriptCheck, braveCheck]).then(([scriptBlocked, isBrave]) => {
    if (adDetected || scriptBlocked || isBrave) showAdBlockWarningAdvanced();
  });
}

function showAdBlockWarningAdvanced() {
  const overlay = document.createElement('div');
  overlay.className = 'adblock-overlay';
  overlay.innerHTML = `
    <div class="adblock-container">
      <h2>⚠️ AdBlocker or Brave Detected</h2>
      <p>We noticed you are using an ad blocker or Brave browser. To access downloads, please disable the ad blocker or use a standard browser, then refresh the page.</p>
      <button onclick="window.location.reload()" style="background:#ff003c;color:white;padding:10px 25px;border-radius:10px;border:none;font-weight:bold;cursor:pointer;">Reload Page</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

window.addEventListener('load', detectAdBlockerAdvanced);


/* ========================================================= */
/* ✅ FETCH & DISPLAY MOVIES (MONGODB READY)                */
/* ========================================================= */
async function fetchMovies() {
  try {
    const res = await fetch("/api/movies");
    movies = await res.json();
    movies.reverse(); // latest uploads first
    displayMovies();
    loadTopMovies();
  } catch (err) {
    console.error("Error fetching movies from MongoDB:", err);
  }
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
                <button class="download-btn" data-title="${movie.title}" onclick="showAdAndStartTimer('${q.url}', this)">Download</button>
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
  const filtered = movies.filter((movie) => movie.title.toLowerCase().includes(term));
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
                <button class="download-btn" data-title="${movie.title}" onclick="showAdAndStartTimer('${q.url}', this)">Download</button>
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
/* ✅ FULLSCREEN SMART-LINK AD + 18s TIMER                   */
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
    if (timerStarted) return;
    timerStarted = true;

    adStartTime = Date.now();
    tapText.style.display = "none";
    countdownText.style.display = "block";

    window.open(adButton.href, "_blank");

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
}

function showFinalButton(btn) {
  btn.style.display = "none";
  const timerEl = btn.nextElementSibling;
  const finalLink = timerEl.nextElementSibling;
  finalLink.style.display = "inline-block";
  finalLink.classList.add("show-download");
}


/* ========================================================= */
/* 🎬 NETFLIX-STYLE TOP DOWNLOADED MOVIES FEATURE           */
/* ========================================================= */
async function loadTopMovies() {
  if (!topContainer) return;
  try {
    const res = await fetch("/api/top-movies"); // Use top-movies endpoint from server.js
    const topMovies = await res.json();

    topContainer.innerHTML = topMovies
      .slice(0, 10)
      .map(
        (movie) => `
        <div class="top-card" onclick="scrollToMovie('${movie.title}')">
          <img src="${movie.image}" alt="${movie.title}">
          <div class="top-overlay">
            <h3>${movie.title}</h3>
            <p>🔥 ${movie.downloads || 0} Downloads</p>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading top movies:", err);
  }
}

function scrollToMovie(title) {
  const movieCards = document.querySelectorAll(".movie-card h2");
  for (const h2 of movieCards) {
    if (h2.textContent.trim() === title.trim()) {
      h2.scrollIntoView({ behavior: "smooth", block: "center" });
      h2.style.color = "#ff003c";
      setTimeout(() => (h2.style.color = ""), 2000);
      break;
    }
  }
}

/* ========================================================= */
/* 🔁 AUTO-INCREMENT DOWNLOAD COUNT ON FINAL DOWNLOAD CLICK */
/* ========================================================= */
async function incrementDownload(title) {
  try {
    await fetch("/api/increment-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    loadTopMovies();
  } catch (err) {
    console.warn("Download increment failed:", err);
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("final-download-btn")) {
    const movieTitle = e.target.closest(".movie-card")?.querySelector("h2")?.textContent;
    if (movieTitle) incrementDownload(movieTitle);
  }
});

/* ========================================================= */
/* ✅ INITIALIZE PAGE                                        */
/* ========================================================= */
fetchMovies();
