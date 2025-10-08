const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const BACKDROP_PATH = "https://image.tmdb.org/t/p/w1280";

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

const movieDetails = document.getElementById("movie-details");

document.addEventListener("DOMContentLoaded", () => {
  if (movieId) {
    fetchMovieDetails(movieId);
  } else {
    showError("No movie ID provided.");
  }
});

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

  const releaseYear = new Date(release_date).getFullYear();
  const formattedBudget = budget ? `$${(budget / 1000000).toFixed(1)}M` : "N/A";
  const formattedRevenue = revenue
    ? `$${(revenue / 1000000).toFixed(1)}M`
    : "N/A";

  movieDetails.innerHTML = `
        <section class="movie-hero" style="background-image: url('${BACKDROP_PATH}${backdrop_path}')">
            <div class="hero-overlay"></div>
            <div class="movie-content">
                <div class="movie-poster">
                    <img src="${
                      poster_path
                        ? IMG_PATH + poster_path
                        : "https://via.placeholder.com/300x450?text=No+Image"
                    }" 
                         alt="${title}" />
                    <button class="watchlist-btn" onclick="toggleWatchlist(${JSON.stringify(
                      movie
                    ).replace(/'/g, "\\'")})">
                        ${
                          isInWatchlist(movie.id)
                            ? "Remove from Watchlist"
                            : "Add to Watchlist"
                        }
                    </button>
                </div>
                <div class="movie-info">
                    <h1>${title} <span class="year">(${releaseYear})</span></h1>
                    
                    <div class="movie-meta">
                        <span class="rating ${getRatingClass(vote_average)}">
                            ${vote_average.toFixed(1)}/10
                        </span>
                        <span class="runtime">${runtime} min</span>
                        <span class="release">${new Date(
                          release_date
                        ).toLocaleDateString()}</span>
                    </div>
                    
                    <div class="genres">
                        ${genres
                          .map(
                            (genre) =>
                              `<span class="genre-tag">${genre.name}</span>`
                          )
                          .join("")}
                    </div>
                    
                    <div class="financial-info">
                        <div class="budget">
                            <strong>Budget:</strong> ${formattedBudget}
                        </div>
                        <div class="revenue">
                            <strong>Revenue:</strong> ${formattedRevenue}
                        </div>
                    </div>
                    
                    <div class="overview-section">
                        <h3>Overview</h3>
                        <p>${overview || "No overview available."}</p>
                    </div>
                </div>
            </div>
        </section>

        ${
          cast.length > 0
            ? `
        <section class="cast-section">
            <h2>Top Cast</h2>
            <div class="cast-grid">
                ${cast
                  .map(
                    (actor) => `
                    <div class="cast-card">
                        <img src="${
                          actor.profile_path
                            ? IMG_PATH + actor.profile_path
                            : "https://via.placeholder.com/150x225?text=No+Image"
                        }" 
                             alt="${actor.name}" />
                        <div class="cast-info">
                            <h4>${actor.name}</h4>
                            <p>${actor.character}</p>
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
          similarMovies.length > 0
            ? `
        <section class="similar-movies">
            <h2>Similar Movies</h2>
            <div class="similar-grid">
                ${similarMovies
                  .map(
                    (movie) => `
                    <div class="similar-card" onclick="location.href='movie-details.html?id=${
                      movie.id
                    }'">
                        <img src="${
                          movie.poster_path
                            ? IMG_PATH + movie.poster_path
                            : "https://via.placeholder.com/200x300?text=No+Image"
                        }" 
                             alt="${movie.title}" />
                        <h4>${movie.title}</h4>
                        <span class="rating ${getRatingClass(
                          movie.vote_average
                        )}">
                            ${movie.vote_average.toFixed(1)}
                        </span>
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
  if (vote >= 8) return "green";
  if (vote >= 5) return "orange";
  return "red";
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

  const watchlistBtn = document.querySelector(".watchlist-btn");
  if (watchlistBtn) {
    watchlistBtn.textContent = isInWatchlist(movie.id)
      ? "Remove from Watchlist"
      : "Add to Watchlist";
  }
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showLoading() {
  movieDetails.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading movie details...</p>
        </div>
    `;
}

function showError(message) {
  movieDetails.innerHTML = `
        <div class="error">
            <p>${message}</p>
            <button onclick="location.href='index.html'">← Back to Home</button>
        </div>
    `;
}
