// =======================
// 🎬 Movie App – Complete Script
// =======================

// 🌐 API Endpoints
const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`;

// 📌 DOM Elements
const main = document.getElementById("main");
const form = document.getElementById("form");
const searchInput = document.getElementById("search");

// 🚀 Initial Load
document.addEventListener("DOMContentLoaded", () => {
  fetchMovies(API_URL);
});

// =======================
// 📡 Fetch Movies
// =======================
async function fetchMovies(url) {
  try {
    showLoading(); // Show loading indicator
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch movies");

    const data = await response.json();
    if (data.results.length === 0) {
      showError("No movies found.");
    } else {
      renderMovies(data.results);
    }
  } catch (error) {
    showError("Something went wrong. Please try again later.");
    console.error("❌ Fetch Error:", error);
  }
}

// =======================
// 🎨 Render Movies
// =======================
function renderMovies(movies) {
  main.innerHTML = movies
    .map(({ id, title, poster_path, vote_average, overview }) => {
      const isInWatchlist = checkWatchlistStatus(id);

      return `
            <div class="movie">
                <img 
                    src="${
                      poster_path
                        ? IMG_PATH + poster_path
                        : "https://via.placeholder.com/300x450?text=No+Image"
                    }" 
                    alt="${title}"
                    onclick="location.href='movie-details.html?id=${id}'"
                />
                <div class="movie-info">
                    <h3>${title}</h3>
                    <span class="${getRatingClass(
                      vote_average
                    )}">${vote_average.toFixed(1)}</span>
                </div>
                <div class="movie-actions">
                    <button class="watchlist-btn home ${
                      isInWatchlist ? "in-watchlist" : ""
                    }" 
                            onclick="toggleWatchlistFromHome(${id}, '${title.replace(
        /'/g,
        "\\'"
      )}', '${poster_path}', ${vote_average}, '${overview.replace(
        /'/g,
        "\\'"
      )}')">
                        ${isInWatchlist ? "❤️" : "🤍"}
                    </button>
                    <button class="details-btn" onclick="location.href='movie-details.html?id=${id}'">
                        👀 Details
                    </button>
                </div>
                <div class="overview">
                    <h3>Overview</h3>
                    <p>${overview || "No overview available."}</p>
                </div>
            </div>
        `;
    })
    .join("");
}

// =======================
// ⭐ Rating Color Logic
// =======================
function getRatingClass(vote) {
  if (vote >= 8) return "green";
  if (vote >= 5) return "orange";
  return "red";
}

// =======================
// 🔍 Search Movies
// =======================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    fetchMovies(SEARCH_API + encodeURIComponent(searchTerm));
    searchInput.value = "";
  } else {
    window.location.reload();
  }
});

// =======================
// 🏷️ Category Tabs
// =======================
const CATEGORIES = {
  popular: `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`,
  top_rated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
  upcoming: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`,
  now_playing: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`,
};

// Create and insert category tabs
const categoryTabs = document.createElement("div");
categoryTabs.className = "category-tabs";
categoryTabs.innerHTML = `
    <button class="tab active" data-category="popular">Popular</button>
    <button class="tab" data-category="top_rated">Top Rated</button>
    <button class="tab" data-category="upcoming">Upcoming</button>
    <button class="tab" data-category="now_playing">Now Playing</button>
`;

// Insert category tabs after hero section
const hero = document.querySelector(".hero");
if (hero && hero.parentNode) {
  hero.parentNode.insertBefore(categoryTabs, hero.nextSibling);
}

// Add category tab functionality
categoryTabs.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab")) {
    // Remove active class from all tabs
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active");
    });

    // Add active class to clicked tab
    e.target.classList.add("active");

    // Fetch movies for selected category
    const category = e.target.dataset.category;
    fetchMovies(CATEGORIES[category]);
  }
});

// =======================
// 📋 Watchlist Functions
// =======================
function checkWatchlistStatus(movieId) {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  return watchlist.some((movie) => movie.id === movieId);
}

function toggleWatchlistFromHome(
  id,
  title,
  poster_path,
  vote_average,
  overview
) {
  const movie = {
    id,
    title,
    poster_path,
    vote_average,
    overview,
    release_date: "", // Add empty release_date to prevent errors
  };
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (checkWatchlistStatus(id)) {
    watchlist = watchlist.filter((m) => m.id !== id);
    showNotification("Removed from watchlist!", "info");
  } else {
    watchlist.push(movie);
    showNotification("Added to watchlist!", "success");
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist));

  // Re-render movies to update watchlist buttons
  const currentMovies = document.querySelectorAll(".movie");
  currentMovies.forEach((movieEl) => {
    const watchlistBtn = movieEl.querySelector(".watchlist-btn.home");
    if (watchlistBtn) {
      // Extract movie ID from onclick function
      const onclickText = watchlistBtn.getAttribute("onclick");
      const movieIdMatch = onclickText.match(/toggleWatchlistFromHome\((\d+)/);
      if (movieIdMatch) {
        const movieId = parseInt(movieIdMatch[1]);
        watchlistBtn.className = `watchlist-btn home ${
          checkWatchlistStatus(movieId) ? "in-watchlist" : ""
        }`;
        watchlistBtn.innerHTML = checkWatchlistStatus(movieId) ? "❤️" : "🤍";
      }
    }
  });
}

// =======================
// 🔔 Notification System
// =======================
function showNotification(message, type = "success") {
  // Remove existing notifications
  document.querySelectorAll(".notification").forEach((notif) => notif.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// =======================
// 🛠️ Helper Functions
// =======================

// 🌀 Show loading spinner
function showLoading() {
  main.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading movies...</p>
    </div>
  `;
}

// ❌ Show error message
function showError(message) {
  main.innerHTML = `
    <div class="error">
      <p>${message}</p>
      <button onclick="location.reload()">Try Again</button>
    </div>
  `;
}
