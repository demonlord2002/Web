const container = document.getElementById("moviesList");
const searchBar = document.getElementById("searchBar");
const pagination = document.getElementById("pagination");

let movies = [];
let currentPage = 1;
const moviesPerPage = 10;

// ✅ Fetch movies from API
async function fetchMovies() {
  try {
    const res = await fetch("/api/movies");
    movies = await res.json();
    displayMovies();
  } catch (err) {
    console.error("Error fetching movies:", err);
    container.innerHTML = "<p style='color:red'>Failed to load movies 😢</p>";
  }
}

// ✅ Display current page of movies
function displayMovies() {
  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const visibleMovies = movies.slice(start, end);
  container.innerHTML = "";

  visibleMovies.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("movie");
    card.innerHTML = `
      <h2>${movie.title}</h2>
      ${movie.qualities.map(q => `
        <p>📥 ${q.label} → 
          <button class="download" onclick="window.open('${q.url}', '_blank')">Download</button>
        </p>`).join('')}
    `;
    container.appendChild(card);
  });

  setupPagination();
}

// ✅ Setup pagination
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
    if (i === currentPage) btn.classList.add("active");
    pagination.appendChild(btn);
  }
}

// ✅ Search filter
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
    card.classList.add("movie");
    card.innerHTML = `
      <h2>${movie.title}</h2>
      ${movie.qualities.map(q => `
        <p>📥 ${q.label} → 
          <button class="download" onclick="window.open('${q.url}', '_blank')">Download</button>
        </p>`).join('')}
    `;
    container.appendChild(card);
  });
  pagination.innerHTML = "";
}

// ✅ Start everything
fetchMovies();
