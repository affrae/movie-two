# 🎬 Movie Wishlist — Demo Script

A staged, three-act demo that builds a single-page movie app against the
[TMDb API](https://developers.themoviedb.org/3): search movies by title,
save favorites to a wishlist with star ratings, and persist everything to
localStorage. Plain HTML, CSS, and JavaScript — no frameworks, no backend,
no build step.

The demo is driven by the **`movie-wishlist-demo` skill**
(`.autohand/skills/movie-wishlist-demo/`). Each act ships as a
pre-generated patch, and the skill's `run-demo.sh` driver prints the
mandatory "normally" / "demo shortcut" messages, applies the patch, and
verifies the deliverables in one pass.

## The Three Acts

| Act | What you get |
|-----|--------------|
| **Act I — Search App** | `index.html`, `config.js`, `app.js`, `styles.css` — TMDb search with a poster grid |
| **Act II — Wishlist** | In-memory "My Wishlist" panel with star ratings and remove controls |
| **Act III — Persistence** | `storage.js` — the wishlist and ratings survive page reloads via localStorage |

## Prerequisites

- **Git** — for version control and applying the act patches
- **Autohand** — the agent runtime that loads the demo skill
- **Bash** — for `run-demo.sh`
- **A free TMDb API key** — [get one here](https://www.themoviedb.org/settings/api)

## Setup — Make Sure Everything Is Ready

Run these checks once, before starting Act I. Every step is run from the
project root.

### 1. Git setup

```sh
# Check git is installed
git --version

# On the right branch (should print: main)
git branch --show-current

# Remote configured (should show origin -> your repo)
git remote -v

# Working tree state — should be clean, or only show the expected files
git status
```

If the repo isn't cloned yet:

```sh
git clone https://github.com/affrae/movie-two.git
cd movie-two
```

> **Tip:** the act patches are applied with `git apply`, which works whether
> or not the directory is a git repository — but a clean, tracked repo makes
> it easy to review each act's diff and roll back if needed.

### 2. Autohand setup

The `movie-wishlist-demo` skill is **already installed with this project** —
it lives in the repo at `.autohand/skills/movie-wishlist-demo/`. You don't
need to install anything; you just need to make sure Autohand can see it
and that it's **activated**.

```sh
# Check autohand is available
autohand --version

# Confirm the skill is present (it ships with the repo):
ls .autohand/skills/movie-wishlist-demo/

# All three act patches must be present:
ls .autohand/skills/movie-wishlist-demo/patches/
#   act1.patch  act2.patch  act3.patch

# The driver script must exist and be executable:
ls -l .autohand/skills/movie-wishlist-demo/run-demo.sh
```

**Activate the skill** — in the Autohand session, use the skill tool to
activate it from the project's `.autohand/skills` directory so the agent
loads it:

```
skill activate movie-wishlist-demo
```

> The skill is already installed — you only need to **activate** it, not
> reinstall it. If the `.autohand/skills/movie-wishlist-demo/` directory is
> missing (e.g. the repo was cloned without it), re-clone or restore it
> before continuing — the demo cannot run without it.

### 3. TMDb API key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/settings/api)
2. Request an API key (v3 auth)
3. Keep it handy — you'll paste it into `config.js` at the end of Act I

### 4. Readiness check

Tick every box before starting:

- [ ] `git --version` prints a version (2.x)
- [ ] `git branch --show-current` prints `main`
- [ ] `git remote -v` shows `origin`
- [ ] `git status` shows a clean tree (or only expected files)
- [ ] `.autohand/skills/movie-wishlist-demo/` exists (ships with the repo)
- [ ] `patches/act1.patch`, `patches/act2.patch`, `patches/act3.patch` exist
- [ ] `run-demo.sh` exists and is executable
- [ ] `movie-wishlist-demo` skill is **activated** in the Autohand session
- [ ] TMDb API key obtained

All set? Continue to **The Complete Script** below.

## The Complete Script

Run every step from the project root. **After each act, enter `/clear` to
reset the conversation before continuing with the next act.**

### Act I — Search App

1. **Run Act I** — the driver prints the "normally" and "demo shortcut"
   messages, applies `patches/act1.patch`, and verifies:

   ```sh
   .autohand/skills/movie-wishlist-demo/run-demo.sh act1
   ```

   Or run it through the agent by sending the **Act I trigger prompt** (or
   the shortcut `act1`):

   > Build a single-page web app: a search bar that queries the TMDb API for movies by title, and shows results as a poster grid with title and year. Plain HTML, CSS and JS, no backend, no build step, no storage — just fetch calls straight to TMDb. Use API key TMDB_API_KEY which I'll paste into a config.js you create.

2. **Check the deliverables** — the driver verifies that:
   - `index.html`, `config.js`, `app.js`, `styles.css` exist
   - `config.js` contains the placeholder key `const TMDB_API_KEY = "YOUR_TMDB_API_KEY";`
   - `app.js` is search-only (no wishlist, no `localStorage`)
   - `index.html` loads `config.js` before `app.js`

3. **Add your API key** — paste your TMDb key into `config.js`:

   ```javascript
   const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
   ```

4. **Try it** — open `index.html` in a browser and search for a movie.

> **Next:** enter `/clear` to reset the conversation, then continue with **Act II**.

### Act II — Wishlist

1. **Run Act II** — applies `patches/act2.patch` and verifies:

   ```sh
   .autohand/skills/movie-wishlist-demo/run-demo.sh act2
   ```

   Or run it through the agent by sending the **Act II trigger prompt** (or
   the shortcut `act2`):

   > Extend the movie search app with a wishlist: clicking a movie poster toggles it in and out of a "My Wishlist" panel shown beside the results. Each wishlist item shows a poster thumbnail, title, year, a 1-5 star rating control, and a remove button. Keep everything in memory only — no localStorage, no backend.

2. **Check the deliverables** — the driver verifies that:
   - `index.html` has the `.layout` wrapper and `#wishlist-panel` aside
   - `app.js` has `wishlist`, `toggleWishlist`, `setRating`, `renderWishlist`
   - No `localStorage` anywhere — the wishlist is in memory only

3. **Try it** — reload `index.html`, search, and click a poster to toggle it
   in and out of "My Wishlist". Rate it with the stars and remove it with the
   button.

> **Next:** enter `/clear` to reset the conversation, then continue with **Act III**.

### Act III — Persistence

1. **Run Act III** — applies `patches/act3.patch` and verifies:

   ```sh
   .autohand/skills/movie-wishlist-demo/run-demo.sh act3
   ```

   Or run it through the agent by sending the **Act III trigger prompt** (or
   the shortcut `act3`):

   > Extend the movie wishlist app so the wishlist and its star ratings survive a page reload. Persist the wishlist to localStorage: load it on startup and save it on every add, remove, or rating change. Keep the same four plain files — no backend, no build step.

2. **Check the deliverables** — the driver verifies that:
   - `storage.js` exists and exposes `createCrud` on `window`
   - `app.js` instantiates `wishlistStore = createCrud("movie-wishlist", [])`
   - `loadWishlist()` and `renderWishlist()` run on startup
   - `saveWishlist()` runs on every add, remove, or rating change
   - `index.html` loads `config.js`, then `storage.js`, then `app.js` as
     classic scripts (no `type="module"`)

3. **Try it** — add movies and ratings, then reload the page: the wishlist
   and ratings are restored from localStorage.

> **Done!** Act III is the final act — no `/clear` needed after it.

## Manual Patch Alternative

Instead of `run-demo.sh`, each act's patch can be applied directly with
`git apply` from the project root (the skill still requires the "normally"
and "demo shortcut" messages to be sent first):

```sh
git apply .autohand/skills/movie-wishlist-demo/patches/act1.patch
git apply .autohand/skills/movie-wishlist-demo/patches/act2.patch
git apply .autohand/skills/movie-wishlist-demo/patches/act3.patch
```

## Project Structure

```
movie-wishlist/
├── index.html      # Page shell: search form, poster grid, wishlist panel
├── config.js       # TMDb API key (placeholder — paste your own)
├── app.js          # Search, wishlist, ratings, persistence wiring
├── storage.js      # Generic localStorage CRUD (createCrud) — added in Act III
├── styles.css      # Dark theme, responsive layout
└── README.md       # This demo script
```

## Useful Commands

```sh
.autohand/skills/movie-wishlist-demo/run-demo.sh act1    # Act I only
.autohand/skills/movie-wishlist-demo/run-demo.sh act2    # Act II only
.autohand/skills/movie-wishlist-demo/run-demo.sh act3    # Act III only
.autohand/skills/movie-wishlist-demo/run-demo.sh all     # all three, in order
.autohand/skills/movie-wishlist-demo/run-demo.sh status  # report applied state
.autohand/skills/movie-wishlist-demo/run-demo.sh verify all  # verify all three
```

---

Built with ❤️ by Daniel Figucio