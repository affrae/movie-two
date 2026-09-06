// Movie Wishlist — TMDb search app with in-memory wishlist (Act II)
(function () {
  "use strict";

  const API_BASE = "https://api.themoviedb.org/3";
  const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const statusEl = document.getElementById("status");
  const grid = document.getElementById("poster-grid");
  const wishlistList = document.getElementById("wishlist-list");
  const wishlistEmpty = document.getElementById("wishlist-empty");

  // In-memory wishlist: movieId -> { movie, rating }
  const wishlist = new Map();

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle("error", Boolean(isError));
  }

  function clearStatus() {
    setStatus("");
  }

  function posterUrl(path) {
    return path ? POSTER_BASE + path : null;
  }

  function formatYear(dateString) {
    if (!dateString) return "";
    const year = dateString.slice(0, 4);
    return /^\d{4}$/.test(year) ? year : "";
  }

  function isInWishlist(movieId) {
    return wishlist.has(String(movieId));
  }

  function toggleWishlist(movie) {
    const id = String(movie.id);
    if (wishlist.has(id)) {
      wishlist.delete(id);
    } else {
      wishlist.set(id, { movie: movie, rating: 0 });
    }
    renderWishlist();
    updateCardState(id);
  }

  function setRating(movieId, rating) {
    const entry = wishlist.get(String(movieId));
    if (!entry) return;
    entry.rating = rating;
    renderWishlist();
  }

  function createCard(movie) {
    const li = document.createElement("li");
    li.className = "movie-card";
    li.dataset.movieId = String(movie.id);

    const imgUrl = posterUrl(movie.poster_path);
    if (imgUrl) {
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = movie.title;
      img.loading = "lazy";
      li.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "no-poster";
      placeholder.textContent = "No poster available";
      li.appendChild(placeholder);
    }

    const info = document.createElement("div");
    info.className = "movie-info";

    const title = document.createElement("h2");
    title.className = "movie-title";
    title.textContent = movie.title;

    const year = document.createElement("p");
    year.className = "movie-year";
    year.textContent = formatYear(movie.release_date);

    info.appendChild(title);
    info.appendChild(year);
    li.appendChild(info);

    li.addEventListener("click", function () {
      toggleWishlist(movie);
    });

    updateCardState(li, movie.id);
    return li;
  }

  function updateCardState(cardOrId, movieId) {
    const card =
      typeof cardOrId === "string"
        ? grid.querySelector('[data-movie-id="' + cardOrId + '"]')
        : cardOrId;
    if (!card) return;
    const id = String(movieId || card.dataset.movieId);
    card.classList.toggle("in-wishlist", isInWishlist(id));
    card.setAttribute(
      "aria-pressed",
      isInWishlist(id) ? "true" : "false"
    );
  }

  function renderMovies(movies) {
    grid.replaceChildren();
    const fragment = document.createDocumentFragment();
    movies.forEach(function (movie) {
      fragment.appendChild(createCard(movie));
    });
    grid.appendChild(fragment);
  }

  function createWishlistItem(entry) {
    const id = String(entry.movie.id);
    const li = document.createElement("li");
    li.className = "wishlist-item";
    li.dataset.movieId = id;

    const imgUrl = posterUrl(entry.movie.poster_path);
    if (imgUrl) {
      const img = document.createElement("img");
      img.className = "wishlist-item-poster";
      img.src = imgUrl;
      img.alt = entry.movie.title;
      img.loading = "lazy";
      li.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "wishlist-item-poster no-poster";
      placeholder.textContent = "No poster";
      li.appendChild(placeholder);
    }

    const details = document.createElement("div");
    details.className = "wishlist-item-details";

    const title = document.createElement("span");
    title.className = "wishlist-item-title";
    title.textContent = entry.movie.title;

    const stars = document.createElement("div");
    stars.className = "stars";
    stars.setAttribute("role", "radiogroup");
    stars.setAttribute("aria-label", "Rating for " + entry.movie.title);

    for (let value = 1; value <= 5; value++) {
      const star = document.createElement("button");
      star.type = "button";
      star.className = "star" + (value <= entry.rating ? " active" : "");
      star.dataset.value = String(value);
      star.setAttribute("role", "radio");
      star.setAttribute("aria-checked", value <= entry.rating ? "true" : "false");
      star.setAttribute("aria-label", value + " star" + (value === 1 ? "" : "s"));
      star.textContent = "★";
      stars.appendChild(star);
    }

    details.appendChild(title);
    details.appendChild(stars);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "wishlist-remove";
    remove.setAttribute("aria-label", "Remove " + entry.movie.title + " from wishlist");
    remove.textContent = "✕";

    li.appendChild(details);
    li.appendChild(remove);
    return li;
  }

  function renderWishlist() {
    wishlistList.replaceChildren();
    const hasItems = wishlist.size > 0;
    wishlistEmpty.hidden = hasItems;

    const fragment = document.createDocumentFragment();
    wishlist.forEach(function (entry) {
      fragment.appendChild(createWishlistItem(entry));
    });
    wishlistList.appendChild(fragment);
  }

  wishlistList.addEventListener("click", function (event) {
    const item = event.target.closest(".wishlist-item");
    if (!item) return;
    const movieId = item.dataset.movieId;

    if (event.target.classList.contains("star")) {
      setRating(movieId, Number(event.target.dataset.value));
    } else if (event.target.classList.contains("wishlist-remove")) {
      const entry = wishlist.get(movieId);
      if (entry) {
        wishlist.delete(movieId);
        renderWishlist();
        updateCardState(movieId);
      }
    }
  });

  async function searchMovies(query) {
    const url =
      API_BASE +
      "/search/movie?api_key=" +
      encodeURIComponent(TMDB_API_KEY) +
      "&query=" +
      encodeURIComponent(query);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("TMDb API error: " + response.status);
    }
    const data = await response.json();
    return data.results || [];
  }

  renderWishlist();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const query = input.value.trim();
    if (!query) return;

    if (!TMDB_API_KEY) {
      setStatus(
        "Missing API key: paste your TMDb API key into config.js and reload.",
        true
      );
      return;
    }

    const button = form.querySelector("button");
    button.disabled = true;
    setStatus("Searching…");
    grid.replaceChildren();

    try {
      const movies = await searchMovies(query);
      if (movies.length === 0) {
        setStatus('No results found for "' + query + '".');
      } else {
        clearStatus();
        renderMovies(movies);
      }
    } catch (err) {
      console.error(err);
      setStatus(
        "Something went wrong while searching. Please try again.",
        true
      );
    } finally {
      button.disabled = false;
    }
  });
})();