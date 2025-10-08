// API Endpoints
const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`;

// DOM Elements
const main = document.getElementById("main");
const form = document.getElementById("form");
const searchInput = document.getElementById("search");

// Category URLs
const CATEGORIES = {
  popular: `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`,
  top_rated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
  upcoming: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`,
  now_playing: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`,
};

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies(API_URL);
  initializeCategoryTabs();
});

function initializeCategoryTabs() {
  const tabs = document.querySelectorAll(".tab[data-category]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((t) => {
        t.classList.remove(
          "bg-gradient-to-r",
          "from-accent-purple",
          "to-accent-pink",
          "text-white",
          "border-transparent",
          "shadow-md",
          "-translate-y-0.5"
        );
        t.classList.add(
          "bg-white/10",
          "border",
          "border-white/10",
          "text-gray-300"
        );
      });

      // Add active class to clicked tab
      e.target.classList.remove(
        "bg-white/10",
        "border",
        "border-white/10",
        "text-gray-300"
      );
      e.target.classList.add(
        "bg-gradient-to-r",
        "from-accent-purple",
        "to-accent-pink",
        "text-white",
        "border-transparent",
        "shadow-md",
        "-translate-y-0.5"
      );

      const category = e.target.dataset.category;
      fetchMovies(CATEGORIES[category]);
    });
  });
}

async function fetchMovies(url) {
  try {
    showLoading();
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
    console.error("Fetch Error:", error);
  }
}

function renderMovies(movies) {
  main.innerHTML = movies
    .map(({ id, title, poster_path, vote_average, overview, release_date }) => {
      const isInWatchlist = checkWatchlistStatus(id);
      const safeTitle = title.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      const safeOverview = overview
        ? overview.replace(/'/g, "&#39;").replace(/"/g, "&quot;")
        : "No overview available.";

      return `
        <div class="movie group bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/10">
          <img 
            src="${
              poster_path
                ? IMG_PATH + poster_path
                : "https://via.placeholder.com/300x450?text=No+Image"
            }" 
            alt="${safeTitle}"
            onclick="location.href='movie-details.html?id=${id}'"
            class="w-full h-80 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
          />
          <div class="p-4">
            <div class="movie-info flex justify-between items-start gap-3 mb-3">
              <h3 class="text-white font-bold text-lg flex-1 line-clamp-2">${safeTitle}</h3>
              <span class="${getRatingClass(
                vote_average
              )} px-3 py-1 rounded-full text-sm font-bold text-white flex-shrink-0">
                ${vote_average.toFixed(1)}
              </span>
            </div>
            
            <div class="movie-actions flex gap-2 mb-3">
              <button class="watchlist-btn flex-1 py-2 px-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                isInWatchlist
                  ? "bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50 hover:text-white"
                  : "bg-accent-purple/20 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/30 hover:border-accent-purple/50 hover:text-white"
              }" 
                onclick="toggleWatchlistFromHome(${id}, '${safeTitle}', '${
        poster_path || ""
      }', ${vote_average}, '${safeOverview}', '${release_date || ""}')">
                
                ${isInWatchlist ? "Added" : "Watchlist"}
              </button>
              <button class="details-btn py-2 px-4 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 flex-1"
                onclick="location.href='movie-details.html?id=${id}'">
                
                Details
              </button>
            </div>
            
            <div class="overview">
              <h4 class="text-white font-semibold text-sm mb-2">Overview</h4>
              <p class="text-gray-300 text-sm line-clamp-3 leading-relaxed">${safeOverview}</p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function getRatingClass(vote) {
  if (vote >= 8) return "bg-gradient-to-r from-green-500 to-green-400";
  if (vote >= 5) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
  return "bg-gradient-to-r from-red-500 to-red-400";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    fetchMovies(SEARCH_API + encodeURIComponent(searchTerm));

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove(
        "bg-gradient-to-r",
        "from-accent-purple",
        "to-accent-pink",
        "text-white",
        "border-transparent",
        "shadow-md",
        "-translate-y-0.5"
      );
      tab.classList.add(
        "bg-white/10",
        "border",
        "border-white/10",
        "text-gray-300"
      );
    });
  } else {
    window.location.reload();
  }
});

// Watchlist functions
function checkWatchlistStatus(movieId) {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  return watchlist.some((movie) => movie.id === movieId);
}

function toggleWatchlistFromHome(
  id,
  title,
  poster_path,
  vote_average,
  overview,
  release_date
) {
  const movie = {
    id,
    title: title.replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    poster_path,
    vote_average,
    overview: overview.replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
    release_date,
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

  const currentMovies = document.querySelectorAll(".movie");
  currentMovies.forEach((movieEl) => {
    const watchlistBtn = movieEl.querySelector(".watchlist-btn");
    if (watchlistBtn) {
      const onclickAttr = watchlistBtn.getAttribute("onclick");
      const movieIdMatch = onclickAttr.match(/toggleWatchlistFromHome\((\d+)/);
      if (movieIdMatch) {
        const currentMovieId = parseInt(movieIdMatch[1]);
        const isInWatchlistNow = checkWatchlistStatus(currentMovieId);

        if (isInWatchlistNow) {
          watchlistBtn.classList.remove(
            "bg-accent-purple/20",
            "border-accent-purple/30",
            "text-accent-purple"
          );
          watchlistBtn.classList.add(
            "bg-red-500/20",
            "border-red-500/30",
            "text-red-300"
          );
          watchlistBtn.innerHTML = "Added";
        } else {
          watchlistBtn.classList.remove(
            "bg-red-500/20",
            "border-red-500/30",
            "text-red-300"
          );
          watchlistBtn.classList.add(
            "bg-accent-purple/20",
            "border-accent-purple/30",
            "text-accent-purple"
          );
          watchlistBtn.innerHTML = " Watchlist";
        }
      }
    }
  });
}

function showNotification(message, type = "success") {
  document.querySelectorAll(".notification").forEach((notif) => notif.remove());

  const notification = document.createElement("div");
  notification.className = `notification fixed top-20 right-4 z-50 px-6 py-4 rounded-xl backdrop-blur-lg border-l-4 ${
    type === "success"
      ? "bg-green-500/10 border-green-400 text-green-100"
      : "bg-blue-500/10 border-blue-400 text-blue-100"
  } shadow-xl transform transition-all duration-300 translate-x-0`;

  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="font-medium">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white text-lg">
        ×
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

function showLoading() {
  main.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-16">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-white/10 border-t-accent-purple rounded-full animate-spin mb-4 mx-auto"></div>
        <p class="text-gray-400 text-lg">Loading movies...</p>
      </div>
    </div>
  `;
}

function showError(message) {
  main.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-16">
      <div class="text-center">
        <p class="text-gray-300 text-xl mb-6">${message}</p>
        <button onclick="location.reload()" 
                class="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
          Try Again
        </button>
      </div>
    </div>
  `;
}
