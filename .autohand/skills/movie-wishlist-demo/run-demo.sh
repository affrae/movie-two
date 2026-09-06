#!/usr/bin/env bash
#
# run-demo.sh — precached driver for the movie-wishlist-demo skill.
#
# Every act's full protocol (both mandatory messages, the patch, and the
# verification) is pre-scripted here, so running an act requires zero model
# round trips: the driver prints the messages, applies the patch, and checks
# the deliverables in one deterministic pass.
#
# Usage:
#   ./run-demo.sh act1            # run Act I only
#   ./run-demo.sh act2            # run Act II only
#   ./run-demo.sh act3            # run Act III only
#   ./run-demo.sh all             # run Act I + II + III in order
#   ./run-demo.sh status          # verify current state without applying
#
# Run from the project root (the directory that should receive the app files).
# The patches are cumulative: act2 expects act1's files, act3 expects act2's.

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_DIR="$SKILL_DIR/patches"

# --- Messages (exact quoted text from SKILL.md) ---------------------------

normally_act1() {
  cat <<'EOF'
Normally, Act I means hand-writing four files: index.html (the page shell
with the search form, status line, and poster grid), config.js (a placeholder
TMDb API key), app.js (the TMDb search logic, poster rendering, and
status/error handling), and styles.css (the dark theme and responsive poster
grid).
EOF
}

shortcut_act1() {
  cat <<'EOF'
For this demo, I'll speed things up: instead of hand-writing those files,
I'll apply the pre-generated patch patches/act1.patch, which creates all four
files for me.
EOF
}

normally_act2() {
  cat <<'EOF'
Normally, Act II means hand-editing three files: index.html (wrapping the
results and a new "My Wishlist" panel in a two-column layout), app.js (the
in-memory wishlist Map, clickable movie cards, star ratings, and remove
controls), and styles.css (the wishlist panel, star buttons, and responsive
layout). config.js stays untouched.
EOF
}

shortcut_act2() {
  cat <<'EOF'
For this demo, I'll speed things up: instead of hand-editing those files,
I'll apply the pre-generated patch patches/act2.patch, which adds the whole
wishlist for me.
EOF
}

normally_act3() {
  cat <<'EOF'
Normally, Act III means adding a generic localStorage persistence layer:
copying a reusable storage.js module (a createCrud factory) into the project,
then wiring app.js through it — hydrate the wishlist on startup and save on
every add, remove, or rating change. storage.js is loaded as a classic script
before app.js (so the app works from a file:// URL). styles.css and config.js
stay the same.
EOF
}

shortcut_act3() {
  cat <<'EOF'
For this demo, I'll speed things up: instead of hand-writing the storage
layer and rewiring the app, I'll apply the pre-generated patch
patches/act3.patch, which adds storage.js and wires the wishlist through it
for me.
EOF
}

# --- Verification ----------------------------------------------------------

verify_act1() {
  local ok=0
  for f in index.html config.js app.js styles.css; do
    [ -f "$f" ] || { echo "  FAIL: $f missing"; ok=1; }
  done
  grep -q 'const TMDB_API_KEY = "YOUR_TMDB_API_KEY";' config.js 2>/dev/null \
    || { echo "  FAIL: config.js placeholder key missing"; ok=1; }
  grep -q 'localStorage' app.js 2>/dev/null \
    && { echo "  FAIL: app.js must not use localStorage in Act I"; ok=1; }
  grep -q 'wishlist' app.js 2>/dev/null \
    && { echo "  FAIL: app.js must be search-only in Act I"; ok=1; }
  grep -q 'config.js' index.html 2>/dev/null \
    || { echo "  FAIL: index.html must load config.js"; ok=1; }
  return "$ok"
}

verify_act2() {
  local ok=0
  grep -q 'class="layout"' index.html 2>/dev/null \
    || { echo "  FAIL: index.html missing .layout wrapper"; ok=1; }
  grep -q 'id="wishlist-panel"' index.html 2>/dev/null \
    || { echo "  FAIL: index.html missing #wishlist-panel"; ok=1; }
  for sym in wishlist toggleWishlist setRating renderWishlist; do
    grep -q "$sym" app.js 2>/dev/null \
      || { echo "  FAIL: app.js missing $sym"; ok=1; }
  done
  grep -q 'localStorage' app.js 2>/dev/null \
    && { echo "  FAIL: app.js must not use localStorage in Act II"; ok=1; }
  return "$ok"
}

verify_act3() {
  local ok=0
  [ -f storage.js ] || { echo "  FAIL: storage.js missing"; ok=1; }
  grep -q 'createCrud' storage.js 2>/dev/null \
    || { echo "  FAIL: storage.js missing createCrud"; ok=1; }
  grep -q 'createCrud' app.js 2>/dev/null \
    || { echo "  FAIL: app.js missing createCrud import"; ok=1; }
  for sym in loadWishlist saveWishlist; do
    grep -q "$sym" app.js 2>/dev/null \
      || { echo "  FAIL: app.js missing $sym"; ok=1; }
  done
  # Act III keeps classic (non-module) scripts so the app works from file://
  # URLs: storage.js must load before app.js.
  local storage_line app_line
  storage_line="$(grep -n 'storage.js' index.html 2>/dev/null | head -1 | cut -d: -f1)"
  app_line="$(grep -n 'app.js' index.html 2>/dev/null | head -1 | cut -d: -f1)"
  if [ -z "$storage_line" ] || [ -z "$app_line" ] || [ "$storage_line" -ge "$app_line" ]; then
    echo "  FAIL: index.html must load storage.js before app.js"; ok=1
  fi
  return "$ok"
}

# --- Applied detection (distinctive artifact per act) ----------------------
# Used for idempotency and status. Unlike verify_actN (which checks the act's
# deliverables as of that act's state), these check whether the act's patch
# has been applied at all — they stay true even after later acts layer on.

applied_act1() {
  [ -f index.html ] && [ -f config.js ] && [ -f app.js ] && [ -f styles.css ]
}

applied_act2() {
  grep -q 'id="wishlist-panel"' index.html 2>/dev/null
}

applied_act3() {
  [ -f storage.js ]
}

# --- Act runners -----------------------------------------------------------

run_act() {
  local act="$1"
  local patch="$PATCH_DIR/$act.patch"
  [ -f "$patch" ] || { echo "ERROR: patch not found: $patch" >&2; exit 1; }

  echo "=== $act ==="
  echo
  echo "--- What I'd normally do ---"
  "normally_$act"
  echo
  echo "--- Demo shortcut ---"
  "shortcut_$act"
  echo

  # Idempotent: if the act's patch is already applied, skip the apply and the
  # per-act verify (the verify checks are state-specific — e.g. "no
  # localStorage" is only true right after act1, before act3 layers it on).
  if "applied_$act" >/dev/null 2>&1; then
    echo "--- Already applied — skipping patch and verify ---"
    echo
    return 0
  fi

  echo "--- Applying $act.patch ---"
  git apply "$patch"
  echo "Applied."
  echo
  echo "--- Verify ---"
  if "verify_$act"; then
    echo "  OK: $act deliverables verified."
  else
    echo "  VERIFY FAILED for $act — see failures above." >&2
    exit 1
  fi
  echo
}

status_all() {
  echo "=== Current state ==="
  for f in index.html config.js app.js styles.css storage.js; do
    if [ -f "$f" ]; then echo "  present: $f"; else echo "  absent:  $f"; fi
  done
  echo
  echo "--- Applied status ---"
  for act in act1 act2 act3; do
    if "applied_$act" >/dev/null 2>&1; then
      echo "  $act: applied"
    else
      echo "  $act: not applied"
    fi
  done
}

# --- Dispatch --------------------------------------------------------------

case "${1:-}" in
  verify)
    shift
    case "${1:-}" in
      act1|act2|act3)
        if "verify_$1"; then
          echo "OK: $1 deliverables verified."
        else
          echo "VERIFY FAILED for $1 — see failures above." >&2
          exit 1
        fi
        ;;
      all)
        verify_act1 && verify_act2 && verify_act3 \
          && echo "OK: all three acts verified." \
          || { echo "VERIFY FAILED — see failures above." >&2; exit 1; }
        ;;
      *)
        echo "Usage: $0 verify {act1|act2|act3|all}" >&2
        exit 1
        ;;
    esac
    ;;
  act1|act2|act3)
    run_act "$1"
    ;;
  all)
    run_act act1
    run_act act2
    run_act act3
    ;;
  status)
    status_all
    ;;
  *)
    echo "Usage: $0 {act1|act2|act3|all|status|verify [act1|act2|act3|all]}" >&2
    exit 1
    ;;
esac