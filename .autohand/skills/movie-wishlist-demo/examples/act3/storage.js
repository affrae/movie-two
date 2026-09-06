// storage.js — generalised localStorage CRUD module
//
// Loaded as a classic (non-module) script so the app works from a file:// URL.
// It exposes createCrud on the global scope (window) for app.js to use.
//
// Usage:
//   const wishlist = createCrud("movie-wishlist", []);
//   wishlist.get();          // read all
//   wishlist.set([...]);     // write all
//   wishlist.clear();        // delete all
//
//   const prefs = createCrud("app:preferences", { theme: "dark" });
//   prefs.get();             // { theme: "dark" }
//   prefs.set({ theme: "light" });

/**
 * Create a CRUD interface backed by localStorage.
 *
 * @param {string} key - Storage key. Use a namespaced prefix (e.g. "myapp:settings").
 * @param {*} [defaultValue=null] - Value returned by get() when the key is absent or corrupted.
 * @returns {{ get: () => *, set: (value: *) => void, clear: () => void, has: () => boolean }}
 */
function createCrud(key, defaultValue = null) {
  return {
    /**
     * Read the stored value.
     * @returns {*} The parsed value, or `defaultValue` if absent/corrupted.
     */
    get() {
      try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : defaultValue;
      } catch (e) {
        console.error(`[storage] Failed to read "${key}"`, e);
        return defaultValue;
      }
    },

    /**
     * Write a value (serialised as JSON).
     * @param {*} value - Must be JSON-serialisable.
     */
    set(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`[storage] Failed to write "${key}"`, e);
      }
    },

    /**
     * Remove the key from localStorage.
     */
    clear() {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`[storage] Failed to clear "${key}"`, e);
      }
    },

    /**
     * Check whether the key exists in localStorage.
     * @returns {boolean}
     */
    has() {
      try {
        return localStorage.getItem(key) !== null;
      } catch (e) {
        console.error(`[storage] Failed to check "${key}"`, e);
        return false;
      }
    },
  };
}

// Expose on the global scope so app.js (a classic script) can use it.
window.createCrud = createCrud;
