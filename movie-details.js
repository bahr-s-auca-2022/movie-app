const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const BACKDROP_PATH = "https://image.tmdb.org/t/p/w1280";

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

// DOM Elements
const movieDetails = document.getElementById("movie-details");

// Load Movie Details
document.addEventListener("DOMContentLoaded", () => {
  if (movieId) {
    fetchMovieDetails(movieId);
  } else {
    showError("No movie ID provided.");
  }
});

//  Fetch Movie Details
async function fetchMovieDetails(id) {
  try {
    showLoading();

    const movieResponse = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}`
    );

    if (!movieResponse.ok) throw new Error("Failed to fetch movie details");

    const movie = await movieResponse.json();

    const creditsResponse = await fetch(
      `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    );

    const credits = await creditsResponse.json();
    const cast = credits.cast.slice(0, 6);
    const similarResponse = await fetch(
      `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`
    );

    const similarData = await similarResponse.json();
    const similarMovies = similarData.results.slice(0, 6);

    renderMovieDetails(movie, cast, similarMovies);
  } catch (error) {
    showError("Failed to load movie details. Please try again.");
    console.error("Error:", error);
  }
}

function renderMovieDetails(movie, cast, similarMovies) {
  const {
    title,
    poster_path,
    backdrop_path,
    vote_average,
    overview,
    release_date,
    runtime,
    genres,
    budget,
    revenue,
  } = movie;

  const releaseYear = release_date
    ? new Date(release_date).getFullYear()
    : "N/A";
  const formattedBudget = budget ? `$${(budget / 1000000).toFixed(1)}M` : "N/A";
  const formattedRevenue = revenue
    ? `$${(revenue / 1000000).toFixed(1)}M`
    : "N/A";
  const formattedRuntime = runtime ? `${runtime} min` : "N/A";
  const formattedDate = release_date
    ? new Date(release_date).toLocaleDateString()
    : "N/A";

  movieDetails.innerHTML = `
    <!-- Hero Section with Backdrop -->
    <div class="relative min-h-[70vh] bg-cover bg-center bg-no-repeat" style="background-image: url('${
      backdrop_path ? BACKDROP_PATH + backdrop_path : ""
    }')">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-primary/80 to-primary"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div class="flex flex-col lg:flex-row gap-8 items-center lg:items-end">
          <!-- Poster -->
          <div class="flex-shrink-0">
            <img src="${
              poster_path
                ? IMG_PATH + poster_path
                : "https://via.placeholder.com/300x450?text=No+Image"
            }" 
                 alt="${title}"
                 class="w-64 h-96 sm:w-72 sm:h-108 lg:w-80 lg:h-120 rounded-2xl shadow-2xl border-2 border-white/10" />
            <button onclick="toggleWatchlist(${JSON.stringify(movie).replace(
              /'/g,
              "&#39;"
            )})" 
                    class="w-full mt-4 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              ${
                isInWatchlist(movie.id)
                  ? "Remove from Watchlist"
                  : "Add to Watchlist"
              }
            </button>
          </div>
          
          <!-- Movie Info -->
          <div class="flex-1 text-center lg:text-left">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              ${title} <span class="text-gray-400 font-normal">(${releaseYear})</span>
            </h1>
            
            <!-- Meta Information -->
            <div class="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
              <span class="px-4 py-2 ${getRatingClass(
                vote_average
              )} rounded-full text-sm font-semibold border border-white/10 flex items-center gap-2">
                ${vote_average ? vote_average.toFixed(1) + "/10" : "N/A"}
              </span>
              <span class="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/10 flex items-center gap-2">
                 ${formattedRuntime}
              </span>
              <span class="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/10 flex items-center gap-2">
                 ${formattedDate}
              </span>
            </div>
            
            <!-- Genres -->
            <div class="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
              ${
                genres && genres.length > 0
                  ? genres
                      .map(
                        (genre) =>
                          `<span class="px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-full text-sm font-semibold">${genre.name}</span>`
                      )
                      .join("")
                  : '<span class="text-gray-400">No genres available</span>'
              }
            </div>
            
            <!-- Financial Info -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <div class="px-4 py-3 bg-white/10 rounded-xl border border-white/10 text-center">
                <div class="text-gray-400 text-sm">Budget</div>
                <div class="text-white font-semibold">${formattedBudget}</div>
              </div>
              <div class="px-4 py-3 bg-white/10 rounded-xl border border-white/10 text-center">
                <div class="text-gray-400 text-sm">Revenue</div>
                <div class="text-white font-semibold">${formattedRevenue}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview Section -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10">
        <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          Overview
        </h2>
        <p class="text-gray-300 text-lg leading-relaxed">${
          overview || "No overview available."
        }</p>
      </div>
    </section>

    ${
      cast && cast.length > 0
        ? `
    <!-- Cast Section -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        Top Cast
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        ${cast
          .map(
            (actor) => `
          <div class="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-accent-purple/50 transition-all duration-300 cursor-pointer">
            <img src="${
              actor.profile_path
                ? IMG_PATH + actor.profile_path
                : "https://via.placeholder.com/150x225?text=No+Image"
            }" 
                 alt="${actor.name}"
                 class="w-full h-48 object-cover" />
            <div class="p-4">
              <h3 class="font-semibold text-white text-sm mb-1 line-clamp-1">${
                actor.name
              }</h3>
              <p class="text-gray-400 text-xs line-clamp-2">${
                actor.character
              }</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </section>
    `
        : ""
    }

    ${
      similarMovies && similarMovies.length > 0
        ? `
    <!-- Similar Movies Section -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        Similar Movies
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        ${similarMovies
          .map(
            (movie) => `
          <div class="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-accent-purple/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer" onclick="location.href='movie-details.html?id=${
            movie.id
          }'">
            <img src="${
              movie.poster_path
                ? IMG_PATH + movie.poster_path
                : "https://via.placeholder.com/200x300?text=No+Image"
            }" 
                 alt="${movie.title}"
                 class="w-full h-64 object-cover" />
            <div class="p-4">
              <h3 class="font-semibold text-white text-sm mb-2 line-clamp-2">${
                movie.title
              }</h3>
              <span class="px-2 py-1 ${getRatingClass(
                movie.vote_average
              )} text-white rounded-full text-xs font-bold">
                ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </section>
    `
        : ""
    }
  `;
}

function getRatingClass(vote) {
  if (!vote) return "bg-gray-500";
  if (vote >= 8) return "bg-gradient-to-r from-green-500 to-green-400";
  if (vote >= 5) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
  return "bg-gradient-to-r from-red-500 to-red-400";
}

function isInWatchlist(movieId) {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  return watchlist.some((movie) => movie.id === movieId);
}

function toggleWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (isInWatchlist(movie.id)) {
    watchlist = watchlist.filter((m) => m.id !== movie.id);
    showNotification("Removed from watchlist!", "info");
  } else {
    watchlist.push(movie);
    showNotification("Added to watchlist!", "success");
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist));

  // Update button text
  const watchlistBtn = document.querySelector(
    'button[onclick*="toggleWatchlist"]'
  );
  if (watchlistBtn) {
    watchlistBtn.textContent = isInWatchlist(movie.id)
      ? "Remove from Watchlist"
      : "Add to Watchlist";
  }
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-xl backdrop-blur-lg border-l-4 ${
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
  movieDetails.innerHTML = `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-white/10 border-t-accent-purple rounded-full animate-spin mb-4 mx-auto"></div>
        <p class="text-gray-400 text-lg">Loading movie details...</p>
      </div>
    </div>
  `;
}

function showError(message) {
  movieDetails.innerHTML = `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <p class="text-gray-300 text-xl mb-6">${message}</p>
        <button onclick="location.href='index.html'" 
                class="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
          ← Back to Home
        </button>
      </div>
    </div>
  `;
}
