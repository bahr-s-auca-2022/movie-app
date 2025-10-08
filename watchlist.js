const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const main = document.getElementById("watchlist-main");

document.addEventListener("DOMContentLoaded", loadWatchlist);

function loadWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (watchlist.length === 0) {
    showEmptyWatchlist();
  } else {
    renderWatchlist(watchlist);
  }
}

function renderWatchlist(movies) {
  main.innerHTML = `
        <div class="watchlist-stats">
            <p>You have ${movies.length} ${
    movies.length === 1 ? "movie" : "movies"
  } in your watchlist</p>
            <button class="clear-all-btn" onclick="clearWatchlist()">Clear All</button>
        </div>
        <div class="watchlist-grid">
            ${movies
              .map(
                (movie) => `
                <div class="watchlist-movie">
                    <div class="movie-card">
                        <img src="${
                          movie.poster_path
                            ? IMG_PATH + movie.poster_path
                            : "https://via.placeholder.com/300x450?text=No+Image"
                        }" 
                             alt="${movie.title}"
                             onclick="location.href='movie-details.html?id=${
                               movie.id
                             }'" />
                        <div class="movie-info">
                            <h3>${movie.title}</h3>
                            <span class="rating ${getRatingClass(
                              movie.vote_average
                            )}">
                                ${movie.vote_average.toFixed(1)}
                            </span>
                        </div>
                        <div class="watchlist-actions">
                            <button class="remove-btn" onclick="removeFromWatchlist(${
                              movie.id
                            })">
                                Remove
                            </button>
                            <button class="view-btn" onclick="location.href='movie-details.html?id=${
                              movie.id
                            }'">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    `;
}

function showEmptyWatchlist() {
  main.innerHTML = `
        <div class="empty-watchlist">
            <div class="empty-icon">🎬</div>
            <h3>Your watchlist is empty</h3>
            <p>Start adding movies you want to watch later!</p>
            <button onclick="location.href='index.html'">Browse Movies</button>
        </div>
    `;
}

function removeFromWatchlist(movieId) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter((movie) => movie.id !== movieId);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));

  showNotification("Removed from watchlist!", "info");
  loadWatchlist();
}

function clearWatchlist() {
  if (confirm("Are you sure you want to clear your entire watchlist?")) {
    localStorage.removeItem("watchlist");
    showNotification("Watchlist cleared!", "info");
    loadWatchlist();
  }
}

function getRatingClass(vote) {
  if (vote >= 8) return "green";
  if (vote >= 5) return "orange";
  return "red";
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
