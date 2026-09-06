// Movie Wishlist — TMDb search app (Act I: search only)
(function () {
  "use strict";

  const API_BASE = "https://api.themoviedb.org/3";
  const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const statusEl = document.getElementById("status");
  const grid = document.getElementById("poster-grid");

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

    return li;
  }

  function renderMovies(movies) {
    grid.replaceChildren();
    const fragment = document.createDocumentFragment();
    movies.forEach(function (movie) {
      fragment.appendChild(createCard(movie));
    });
    grid.appendChild(fragment);
  }

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