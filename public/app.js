const container = document.getElementById("movieContainer");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;

/* ================== ADVANCED ADBLOCK + BRAVE DETECTION ================== */
function detectAdBlockerAdvanced() {
  let adDetected = false;

  // 1️⃣ Classic hidden div detection
  const adDiv = document.createElement('div');
  adDiv.className = 'adsbox';
  adDiv.style.height = '1px';
  adDiv.style.position = 'absolute';
  adDiv.style.top = '-1000px';
  document.body.appendChild(adDiv);

  if (adDiv.offsetHeight === 0) adDetected = true;
  adDiv.remove();

  // 2️⃣ Bait div detection (aggressive blockers)
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

  // 3️⃣ Script blocking detection (Brave + uBlock + AdGuard)
  const scriptCheck = new Promise((resolve) => {
    const testScript = document.createElement('script');
    testScript.type = 'text/javascript';
    testScript.async = true;
    testScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

    let called = false;
    testScript.onerror = () => {
      if (!called) { called = true; resolve(true); } // Script blocked
    };
    testScript.onload = () => {
      if (!called) { called = true; resolve(false); } // Script loaded
    };

    document.head.appendChild(testScript);
  });

  // 4️⃣ Brave-specific detection (navigator properties)
  const braveCheck = new Promise((resolve) => {
    if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
      navigator.brave.isBrave().then((isBrave) => {
        resolve(isBrave); // true if Brave
      });
    } else {
      resolve(false);
    }
  });

  // Combine results
  Promise.all([scriptCheck, braveCheck]).then(([scriptBlocked, isBrave]) => {
    if (adDetected || scriptBlocked || isBrave) {
      showAdBlockWarningAdvanced();
    }
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

// Run advanced detection on page load
window.addEventListener('load', detectAdBlockerAdvanced);

/* ========================================================= */
/* ✅ FETCH & DISPLAY MOVIES (EXISTING CODE, UNTOUCHED)     */
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
                <a href="${q.url}" target="_blank" class="final-download-btn" style="display:inline-block;">Download Now</a>
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
                <a href="${q.url}" target="_blank" class="final-download-btn" style="display:inline-block;">Download Now</a>
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
/* ✅ LOAD ALL MOVIES                                         */
/* ========================================================= */
fetchMovies();
