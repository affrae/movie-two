---
name: movie-wishlist-demo
description: Staged three-act single-page movie web app (TMDb search, wishlist, localStorage). This skill is staged — only execute the act whose trigger prompt appears verbatim in the user's message, or whose quick shortcut (`act1`, `act2`, `act3`) is given. If no trigger prompt or shortcut is present, do not execute this skill. When multiple triggers are supplied up front, the acts may be chained in one run to cut model round trips. Plain HTML, CSS and JS — no backend, no build step.
---

# Movie Wishlist Demo

> ## Staged Execution — READ THIS FIRST
>
> This skill is staged. Only execute the act whose trigger prompt appears
> verbatim in the user's message, or whose quick shortcut (`act1`, `act2`,
> `act3`) is given. If no trigger prompt or shortcut is present, do not
> execute this skill.
>
> You may read and summarize this skill, but do not create or modify any
> files until a trigger prompt (or quick shortcut) appears in the user's
> message. If no trigger prompt or shortcut is present, do nothing: do not
> build, do not ask which act to build, and do not create or modify any files.
>
> **Chaining:** if the user supplies more than one trigger up front (e.g.
> `act1`, `act2`, `act3` in a single message), execute the acts in order —
> prompting the user to enter `/clear` between each act. Each act still
> follows its own Execute protocol (both messages, then patch, then verify,
> then the `/clear` prompt), but the whole chain completes without waiting
> for anything other than the `/clear` resets.

This skill builds a self-contained, single-page movie app against the
[TMDb API](https://developers.themoviedb.org/3). The app is plain files — `index.html`, `styles.css`, `config.js`, `app.js`, plus a generic `storage.js` persistence module added in Act III — with no framework, no
backend, and no build step. Everything is a direct `fetch` call to TMDb from the browser.

The build happens in three acts so each feature can be delivered and verified before the next is layered on top:

1. **Act I** — search-only app (poster grid).
2. **Act II** — in-memory wishlist with star ratings.
3. **Act III** — localStorage persistence for the wishlist and ratings.

Each act should be triggered only when given the prompt listed as its trigger prompt, or its quick shortcut (`act1`, `act2`, or `act3`). And then only execute that act’s tasks - no others.

Do not move on to Act I until you receive ACT I’S Trigger Prompt (or the shortcut `act1`)

## How This Demo Works

Normally, building this app means writing the code by hand: creating the HTML
shell, the search logic, the wishlist handlers, the styles — one file at a
time, act by act. That is the real engineering workflow this skill models.

For this demo, however, the code is delivered as **pre-generated patches**
instead of hand-written files. Each act ships with a patch file in this
skill's `patches/` directory that contains the exact code changes for that
act. When you execute an act, you apply its patch to the project root rather
than writing the files from scratch.

The patches are cumulative: Act I creates the four app files, Act II extends
them with the wishlist, Act III adds the generic `storage.js` persistence
layer and wires the wishlist through it. Applying them in order produces the
complete app.

## How to Execute an Act — MANDATORY

Every act follows the same five-step protocol. Do not skip steps 1 and 2:

1. **Send the "normally" message.** Before touching any files, send the
   user the act's **"What I'd normally do"** message — the exact quoted
   text in the act's *Execute* section. It explains, in plain language,
   which files you would create or edit by hand and what the key changes
   would be. This is the real engineering work the demo is modeling — the
   user needs to hear it.
2. **Send the "demo shortcut" message.** Then send the act's **"Demo
   shortcut"** message — the exact quoted text in the act's *Execute*
   section. It states that for demo purposes you will not hand-write those
   changes; instead you will apply the act's pre-generated patch to save
   time. Name the patch file.
3. **Apply the patch.** Only after both messages have been sent, run the
   `git apply` command shown in the act.
4. **Verify.** Check the act's deliverables as described in its "Verify"
   section and report the result.
5. **Prompt `/clear`.** After every act except the last, prompt the user
   to enter `/clear` to reset the conversation before the next act. Do not
   start the next act until the user has entered `/clear`.

**Hard rule — never patch silently.** If you have not sent both messages
to the user, stop and send them first. Do not apply a patch, do not run
`git apply`, and do not edit any files until the user has seen both
messages.

**Speed-up — one turn per act.** The two mandatory messages do not need
separate turns. Send both in a single response (the "normally" message
followed by the "demo shortcut" message), then apply the patch in the same
turn. This satisfies the hard rule — the user sees both messages before
the patch — while cutting each act to a single model turn. When chaining
acts, batch the verification too: apply all patches, then run one combined
verification pass and report once at the end — but still prompt the user
to enter `/clear` between acts.

### How to Apply a Patch

Each act's patch lives at `patches/actN.patch` relative to this skill
directory (`.autohand/skills/movie-wishlist-demo/patches/actN.patch`).

Apply it with `git apply` from the project root:

```sh
git apply .autohand/skills/movie-wishlist-demo/patches/act1.patch
```

`git apply` works whether or not the project is a git repository. If the
patch fails to apply cleanly (e.g. the files already exist with different
content), stop and report the conflict instead of forcing it.

After applying, verify the expected files exist and match the act's
deliverables described below.

### Chaining Acts (Fast Mode)

When the user supplies multiple triggers up front (e.g. `act1`, `act2`,
`act3` in one message), run the acts back-to-back in a single continuous
execution:

1. **Send both messages for Act I** (normally + demo shortcut), then apply
   `act1.patch`.
2. **Prompt `/clear`** — tell the user to enter `/clear` to reset the
   conversation, then continue with Act II.
3. **Send both messages for Act II**, then apply `act2.patch`.
4. **Prompt `/clear`** — tell the user to enter `/clear`, then continue
   with Act III.
5. **Send both messages for Act III**, then apply `act3.patch`.
6. **Verify once at the end** — run a single combined check covering all
   three acts' deliverables and report the final result.

The patches are cumulative, so applying them in order in one run produces
the complete app. Each act's two messages are still sent before its patch
(the hard rule is never violated), and the only user input between acts is
`/clear`. This reduces the demo from ~12 round trips to **3** (one per act,
plus the `/clear` resets).

### Precached Verify (Zero Round Trips)

For the fastest possible verification, each act's verify checks are
pre-scripted in `run-demo.sh` (in this skill directory). The `verify`
subcommand runs the exact same checks as the act's "Verify" section in one
deterministic pass — **no model reasoning, no planning, no round trips**:

```sh
# From the project root:
.autohand/skills/movie-wishlist-demo/run-demo.sh verify act1    # verify Act I only
.autohand/skills/movie-wishlist-demo/run-demo.sh verify act2    # verify Act II only
.autohand/skills/movie-wishlist-demo/run-demo.sh verify act3    # verify Act III only
.autohand/skills/movie-wishlist-demo/run-demo.sh verify all     # verify all three
```

The verify checks are state-specific (e.g. "no localStorage" is only true
right after Act I, before Act III layers it on), so `verify all` runs all
three checks against the current state — use it only after all three acts
are applied. For a single act, use `verify actN` right after applying that
act's patch.

### Precached Driver (Zero Round Trips)

For the fastest possible demo, the entire protocol is pre-scripted in
`run-demo.sh` (in this skill directory). It prints both mandatory messages,
applies the patch, and verifies the deliverables in one deterministic pass —
**no model reasoning, no planning, no round trips during the demo itself.**

```sh
# From the project root:
.autohand/skills/movie-wishlist-demo/run-demo.sh act1    # Act I only
.autohand/skills/movie-wishlist-demo/run-demo.sh act2    # Act II only
.autohand/skills/movie-wishlist-demo/run-demo.sh act3    # Act III only
.autohand/skills/movie-wishlist-demo/run-demo.sh all     # all three, in order
.autohand/skills/movie-wishlist-demo/run-demo.sh status  # report applied state
```

The driver is idempotent: re-running an already-applied act skips the patch
and verify (the per-act verify checks are state-specific — e.g. "no
localStorage" is only true right after Act I). It is also exposed as the
`movie_demo_act` meta-tool (`act1`/`act2`/`act3`/`all`/`status`), so the
agent can run it directly with zero model round trips.

The driver's messages are the exact quoted text from each act's *Execute*
section, so the hard rule (both messages before the patch) is preserved —
the messages are printed to the user before the patch is applied.

Between acts, still prompt the user to enter `/clear` — the driver runs
each act in one pass, but the conversation reset happens between driver
invocations.

## Act I — Search App

### Trigger Prompt

Respond to this prompt by building the app described below:

> Build a single-page web app: a search bar that queries the TMDb API for movies by title, and shows results as a poster grid with title and year. Plain HTML, CSS and JS, no backend, no build step, no storage — just fetch calls straight to TMDb. Use API key TMDB_API_KEY which I'll paste into a config.js you create.

**Quick shortcut:** the phrase `act1` also triggers this act.

### What This Act Normally Does

Normally, I would write four files by hand:

| File | Purpose |
|------|---------|
| `index.html` | Page shell: header, search form, status line, poster grid. Loads `config.js` **before** `app.js`. |
| `config.js` | Holds `const TMDB_API_KEY = "..."` with a placeholder value and a comment telling the user where to get a key. |
| `app.js` | All app logic: search form handler, TMDb fetch, poster grid rendering, status/error messaging. |
| `styles.css` | Dark theme styling: responsive poster grid, search form, status/error states. |

The hand-written code would include:

- `config.js` with a placeholder API key (never a real key — the user pastes their own).
- `index.html` with a `<form id="search-form">`, a `<p id="status">` (`role="status"`, `aria-live="polite"`), a `<ul id="poster-grid">`, and script tags loading `config.js` then `app.js`.
- `app.js` as an IIFE with `"use strict"`: `API_BASE` and `POSTER_BASE` constants, `searchMovies(query)` building the TMDb search URL and throwing on `!response.ok`, submit handler with empty-query bail, missing-key error, button disable/enable in `finally`, and a `DocumentFragment`-based poster grid with lazy-loaded images, "No poster available" placeholders, title, and validated year.
- `styles.css` with CSS custom properties, a responsive `.poster-grid` (`repeat(auto-fill, minmax(160px, 1fr))`), `aspect-ratio: 2 / 3` posters, `.status.error`, and a ≤480px mobile media query.

### Execute

1. **Send the "normally" message.** Before touching any files, send the
   user this message:

   > Normally, Act I means hand-writing four files: `index.html` (the page
   > shell with the search form, status line, and poster grid), `config.js`
   > (a placeholder TMDb API key), `app.js` (the TMDb search logic, poster
   > rendering, and status/error handling), and `styles.css` (the dark
   > theme and responsive poster grid).

2. **Send the "demo shortcut" message.** Then send the user this message:

   > For this demo, I'll speed things up: instead of hand-writing those
   > files, I'll apply the pre-generated patch `patches/act1.patch`, which
   > creates all four files for me.

3. **Apply the patch:**

```sh
git apply .autohand/skills/movie-wishlist-demo/patches/act1.patch
```

4. **Verify** the deliverables below and report the result.
5. **Prompt `/clear`.** Tell the user to enter `/clear` to reset the
   conversation before Act II.

### Verify

- All four files exist in the project root.
- `config.js` contains `const TMDB_API_KEY = "YOUR_TMDB_API_KEY";` (placeholder).
- `app.js` is search-only: no wishlist, no `localStorage`.
- `index.html` loads `config.js` before `app.js`.

6. Do not move on to Act II until you receive ACT II’S Trigger Prompt (or the shortcut `act2`)

## Act II — Wishlist

### Trigger Prompt

Respond to this prompt by extending the app built in Act I:

> Extend the movie search app with a wishlist: clicking a movie poster toggles it in and out of a "My Wishlist" panel shown beside the results. Each wishlist item shows a poster thumbnail, title, year, a 1-5 star rating control, and a remove button. Keep everything in memory only — no localStorage, no backend.

**Quick shortcut:** the phrase `act2` also triggers this act.

### What This Act Normally Does

Normally, I would extend the three files by hand (no new files):

| File | Change |
|------|--------|
| `index.html` | Wrap results + a new wishlist `<aside>` in a two-column `.layout` container. |
| `app.js` | In-memory wishlist `Map`, clickable cards, `renderWishlist()`, star rating + remove handlers. |
| `styles.css` | Wishlist panel, star buttons, "in wishlist" card accent, responsive two-column layout. |
| `config.js` | Unchanged. |

The hand-written changes would include:

- `index.html`: a `<div class="layout">` wrapping the results `<section>` and a new `<aside id="wishlist-panel">` with an `<h2>` ("My Wishlist"), a `<p id="wishlist-empty">` empty-state, and a `<ul id="wishlist-list">`.
- `app.js`: `const wishlist = new Map()` (key = movie id, value = `{ movie, rating }`), `toggleWishlist(movie)`, `setRating(movieId, rating)`, clickable cards with `li.dataset.movieId` and `in-wishlist`/`aria-pressed` state via `updateCardState()`, and `renderWishlist()` building items with title, star rating (`.active` when `value <= rating`), and a "Remove" button. In memory only — no `localStorage`.
- `styles.css`: `.layout` two-column grid (`1fr 320px`), `.movie-card` cursor/hover with `.in-wishlist` accent, sticky `.wishlist-panel`, `.wishlist-item` styling, `.star` styling, `.wishlist-remove`, and single-column layout in the ≤480px media query.

### Execute

1. **Send the "normally" message.** Before touching any files, send the
   user this message:

   > Normally, Act II means hand-editing three files: `index.html`
   > (wrapping the results and a new "My Wishlist" panel in a two-column
   > layout), `app.js` (the in-memory wishlist Map, clickable movie cards,
   > star ratings, and remove controls), and `styles.css` (the wishlist
   > panel, star buttons, and responsive layout). `config.js` stays
   > untouched.

2. **Send the "demo shortcut" message.** Then send the user this message:

   > For this demo, I'll speed things up: instead of hand-editing those
   > files, I'll apply the pre-generated patch `patches/act2.patch`, which
   > adds the whole wishlist for me.

3. **Apply the patch:**

```sh
git apply .autohand/skills/movie-wishlist-demo/patches/act2.patch
```

4. **Verify** the deliverables below and report the result.
5. **Prompt `/clear`.** Tell the user to enter `/clear` to reset the
   conversation before Act III.

### Verify

- `index.html` has the `.layout` wrapper and `#wishlist-panel` aside.
- `app.js` has `wishlist`, `toggleWishlist`, `setRating`, `renderWishlist`.
- No `localStorage` anywhere — the wishlist is in memory only.

6. Do not move on to Act III until you receive ACT III’S Trigger Prompt (or the shortcut `act3`)

## Act III — Persistence

### Trigger Prompt

Respond to this prompt by extending the app built in Act II:

> Extend the movie wishlist app so the wishlist and its star ratings survive a page reload. Persist the wishlist to localStorage: load it on startup and save it on every add, remove, or rating change. Keep the same four plain files — no backend, no build step.

**Quick shortcut:** the phrase `act3` also triggers this act.

### What This Act Normally Does

Normally, I would add a generic localStorage persistence layer and wire the app through it:

| File | Change |
|------|--------|
| `storage.js` | **New file** — the generalised `createCrud(key, defaultValue)` factory (get/set/clear/has) that encapsulates all `localStorage` access with `try...catch` and safe defaults. Loaded as a classic (non-module) script; exposes `createCrud` on `window`. |
| `app.js` | Stays a classic (non-module) script: uses the global `createCrud` from `storage.js` (loaded first), instantiates `wishlistStore = createCrud("movie-wishlist", [])`, hydrates on init, persists on every mutation. |
| `index.html` | Loads `storage.js` between `config.js` and `app.js` as a classic `<script>` tag (no `type="module"`). |
| `styles.css` | Unchanged. |
| `config.js` | Unchanged. |

The hand-written changes would include:

- Copying the generic `storage.js` module (from the `localstorage-persistence` skill) into the project root.
- `app.js` stays a classic script: `const wishlistStore = createCrud("movie-wishlist", []);` using the global `createCrud` provided by `storage.js` (loaded first).
- `loadWishlist()`: read via `wishlistStore.get()`, validate it is an array, and per-entry validate `entry.movie.id` before `wishlist.set(id, { movie, rating: Number(entry.rating) || 0 })`. Corrupt or missing data must not crash the app.
- `saveWishlist()`: serialize the Map entries to `{ movie, rating }` and write via `wishlistStore.set(entries)`.
- Hydrate on startup: `loadWishlist(); renderWishlist();` before wiring the submit handler.
- Persist on every mutation: `saveWishlist()` in `toggleWishlist()`, `setRating()`, and the remove handler.

### Execute

1. **Send the "normally" message.** Before touching any files, send the
   user this message:

   > Normally, Act III means adding a generic localStorage persistence
   > layer: copying a reusable `storage.js` module (a `createCrud`
   > factory) into the project, then wiring `app.js` through it — hydrate
   > the wishlist on startup and save on every add, remove, or rating
   > change. `storage.js` is loaded as a classic script before `app.js`
   > (so the app works from a `file://` URL). `styles.css` and `config.js` stay the same.

2. **Send the "demo shortcut" message.** Then send the user this message:

   > For this demo, I'll speed things up: instead of hand-writing the
   > storage layer and rewiring the app, I'll apply the pre-generated
   > patch `patches/act3.patch`, which adds `storage.js` and wires the
   > wishlist through it for me.

3. **Apply the patch:**

```sh
git apply .autohand/skills/movie-wishlist-demo/patches/act3.patch
```

4. **Verify** the deliverables below and report the result.

### Verify

- `storage.js` exists in the project root and exposes `createCrud` on `window`.
- `app.js` instantiates `wishlistStore = createCrud("movie-wishlist", [])` using the global `createCrud`.
- `loadWishlist()` and `renderWishlist()` are called on startup.
- `saveWishlist()` is called in `toggleWishlist()`, `setRating()`, and the remove handler.
- `index.html` loads `config.js`, then `storage.js`, then `app.js` as classic `<script>` tags (no `type="module"`).
- Reloading the page restores the wishlist and ratings.

## Patches

Each act ships as a cumulative patch in this skill directory:

| Act | Patch | Contents |
|-----|-------|----------|
| Act I — Search App | `patches/act1.patch` | Creates `index.html`, `config.js`, `app.js`, `styles.css` (search only, no wishlist). |
| Act II — Wishlist | `patches/act2.patch` | Extends the same files with the in-memory wishlist, star ratings, and remove controls. |
| Act III — Persistence | `patches/act3.patch` | Adds generic `storage.js` (`createCrud` on `window`) and wires `app.js` through it as a classic script (load on init, save on every mutation). |

Apply them in order with `git apply` from the project root. Each patch is
self-contained and cumulative: applying Act I then Act II then Act III
produces the complete app.

## Constraints

* **No backend, no build step** — the app is static files opened directly or served by any static server.
* **No framework** — vanilla DOM APIs only (`document.createElement`,
  `replaceChildren`, `addEventListener`).
* **No real API keys** — always a placeholder in `config.js`.
* **Keep the API key out of `app.js`** — it must only ever live in `config.js`.
* **Act I and Act II are in-memory only** — no `localStorage` until Act III.
* **Act III persists via the generic `storage.js` layer** — the wishlist and ratings survive reloads; corrupt or missing data falls back to an empty wishlist. All `localStorage` access stays encapsulated in `storage.js` (`createCrud`).
* **Send both messages before you patch** — before applying any patch, you
  MUST send the user the act's "normally" message and "demo shortcut"
  message from its *Execute* section. Never apply a patch silently.
* **Apply patches, don't hand-write** — for this demo, deliver each act by
  applying its patch with `git apply`. Do not rewrite the files from scratch.
* **Match the existing style** — if the project already has these files,
  follow the repo's existing patterns rather than blindly overwriting.