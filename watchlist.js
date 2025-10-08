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
        <div class="mb-8">
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div class="text-center sm:text-left">
                        <h3 class="text-xl font-bold text-white mb-2">Your Movie Collection</h3>
                        <p class="text-gray-300">
                            You have <span class="text-accent-purple font-bold">${
                              movies.length
                            }</span> 
                            ${
                              movies.length === 1 ? "movie" : "movies"
                            } in your watchlist
                        </p>
                    </div>
                    <button onclick="clearWatchlist()" 
                            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                        
                        Clear All
                    </button>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            ${movies
              .map(
                (movie) => `
                <div class="group bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/10">
                    <img src="${
                      movie.poster_path
                        ? IMG_PATH + movie.poster_path
                        : "https://via.placeholder.com/300x450?text=No+Image"
                    }" 
                         alt="${movie.title}"
                         onclick="location.href='movie-details.html?id=${
                           movie.id
                         }'"
                         class="w-full h-80 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" />
                    
                    <div class="p-6">
                        <div class="flex justify-between items-start gap-3 mb-4">
                            <h3 class="text-white font-bold text-lg flex-1 line-clamp-2">${
                              movie.title
                            }</h3>
                            <span class="px-3 py-1 rounded-full text-sm font-bold text-white ${getRatingClass(
                              movie.vote_average
                            )} flex-shrink-0">
                                ${movie.vote_average.toFixed(1)}
                            </span>
                        </div>
                        
                        <p class="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                            ${movie.overview || "No overview available."}
                        </p>
                        
                        <div class="flex gap-3">
                            <button onclick="removeFromWatchlist(${movie.id})" 
                                    class="flex-1 py-3 px-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-medium hover:bg-red-500/30 hover:border-red-500/50 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                                Remove
                            </button>
                            <button onclick="location.href='movie-details.html?id=${
                              movie.id
                            }'" 
                                    class="flex-1 py-3 px-4 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                                
                                Details
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
        <div class="flex flex-col items-center justify-center py-16 text-center">

            <h3 class="text-2xl font-bold text-white mb-4">Your Watchlist is Empty</h3>
            <p class="text-gray-300 text-lg mb-8 max-w-md leading-relaxed">
                Start building your movie collection! Add movies you want to watch later from the home page.
            </p>
            <button onclick="location.href='index.html'" 
                    class="px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-gray text-white rounded-xl font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                Browse Movies
                <span>→</span>
            </button>
        </div>
    `;
}

function removeFromWatchlist(movieId) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  const movie = watchlist.find((m) => m.id === movieId);
  watchlist = watchlist.filter((movie) => movie.id !== movieId);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));

  showNotification(
    `"${movie?.title || "Movie"}" removed from watchlist!`,
    "info"
  );
  loadWatchlist();
}

function clearWatchlist() {
  if (
    confirm(
      "Are you sure you want to clear your entire watchlist? This action cannot be undone."
    )
  ) {
    localStorage.removeItem("watchlist");
    showNotification("Watchlist cleared successfully!", "info");
    loadWatchlist();
  }
}

function getRatingClass(vote) {
  if (vote >= 8) return "bg-gradient-to-r from-green-500 to-green-400";
  if (vote >= 5) return "bg-gradient-to-r from-yellow-500 to-yellow-400";
  return "bg-gradient-to-r from-red-500 to-red-400";
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
  setTimeout(() => notification.remove(), 3000);
}
