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
/* ✅ ADVANCED ADBLOCK + BRAVE DETECTION =================== */
/* ========================================================= */
function detectAdBlockerAdvanced() {
  let adDetected = false;

  const adDiv = document.createElement("div");
  adDiv.className = "adsbox";
  adDiv.style.height = "1px";
  adDiv.style.position = "absolute";
  adDiv.style.top = "-1000px";
  document.body.appendChild(adDiv);
  if (adDiv.offsetHeight === 0) adDetected = true;
  adDiv.remove();

  const bait = document.createElement("div");
  bait.className = "adsbox bait";
  bait.style.width = "1px";
  bait.style.height = "1px";
  bait.style.position = "absolute";
  bait.style.top = "-9999px";
  document.body.appendChild(bait);
  const baitStyle = getComputedStyle(bait);
  if (baitStyle.display === "none" || baitStyle.visibility === "hidden")
    adDetected = true;
  bait.remove();

  const scriptCheck = new Promise((resolve) => {
    const testScript = document.createElement("script");
    testScript.type = "text/javascript";
    testScript.async = true;
    testScript.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

    let called = false;
    testScript.onerror = () => {
      if (!called) {
        called = true;
        resolve(true);
      }
    };
    testScript.onload = () => {
      if (!called) {
        called = true;
        resolve(false);
      }
    };
    document.head.appendChild(testScript);
  });

  const braveCheck = new Promise((resolve) => {
    if (navigator.brave && typeof navigator.brave.isBrave === "function") {
      navigator.brave.isBrave().then((isBrave) => resolve(isBrave));
    } else resolve(false);
  });

  Promise.all([scriptCheck, braveCheck]).then(([scriptBlocked, isBrave]) => {
    if (adDetected || scriptBlocked || isBrave) showAdBlockWarningAdvanced();
  });
}

function showAdBlockWarningAdvanced() {
  const overlay = document.createElement("div");
  overlay.className = "adblock-overlay";
  overlay.innerHTML = `
    <div class="adblock-container">
      <h2>⚠️ AdBlocker or Brave Detected</h2>
      <p>We noticed you're using an AdBlocker or Brave browser. Please disable it or use a normal browser for the best experience.</p>
      <button onclick="window.location.reload()" style="background:#ff003c;color:white;padding:10px 25px;border-radius:10px;border:none;font-weight:bold;cursor:pointer;">Reload Page</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

window.addEventListener("load", detectAdBlockerAdvanced);

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
                <a href="${q.url}" class="download-btn" target="_blank">Download Now</a>
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
/* ✅ RED GLOWING DOWNLOAD BUTTON (Turns Green When Clicked) */
/* ========================================================= */
function styleDownloadButtons() {
  document.querySelectorAll(".download-btn").forEach((btn) => {
    btn.style.textDecoration = "none";
    btn.style.border = "none";
    btn.style.padding = "6px 16px";
    btn.style.borderRadius = "25px";
    btn.style.background = "linear-gradient(90deg, #ff003c, #ff4d6d)";
    btn.style.color = "#fff";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "600";
    btn.style.boxShadow = "0 0 10px rgba(255, 0, 60, 0.7)";
    btn.style.transition = "all 0.3s ease";
    btn.addEventListener("mouseenter", () => {
      btn.style.boxShadow = "0 0 20px rgba(255, 0, 90, 1)";
      btn.style.transform = "scale(1.08)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.boxShadow = "0 0 10px rgba(255, 0, 60, 0.7)";
      btn.style.transform = "scale(1)";
    });
    btn.addEventListener("click", () => {
      btn.style.background = "#00c851";
      btn.style.boxShadow = "0 0 18px rgba(0,255,120,0.8)";
      setTimeout(() => {
        btn.style.background = "linear-gradient(90deg, #ff003c, #ff4d6d)";
        btn.style.boxShadow = "0 0 10px rgba(255, 0, 60, 0.7)";
      }, 1500);
    });
  });
}

/* ========================================================= */
/* ✅ INITIAL LOAD ========================================= */
/* ========================================================= */
fetchMovies();
