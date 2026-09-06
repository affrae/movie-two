# 🎬 Movie Wishlist

A simple, beautiful single-page application for discovering and saving your favorite movies. Built with plain HTML, CSS, and JavaScript - no frameworks, no build step!

## Features

- 🔍 **Search Movies**: Find movies using The Movie Database (TMDb) API
- 📝 **Wishlist**: Save your favorite movies to a personal wishlist
- 💾 **Persistent Storage**: Your wishlist is saved in localStorage
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern CSS with gradients and flexbox/grid
- **Vanilla JavaScript** - No frameworks, pure JavaScript
- **TMDb API** - Movie data and search
- **localStorage** - Browser-based persistence

## Getting Started

### Prerequisites

- A free API key from [The Movie Database](https://www.themoviedb.org/settings/api)

### Installation

1. Clone or download this project
2. Get your TMDb API key
3. Add your API key to the app:

   **Option 1 - Edit `app.js`:**
   ```javascript
   this.tmdbApiKey = 'YOUR_API_KEY';
   ```

   **Option 2 - Use localStorage:**
   - Open browser console
   - Run: `localStorage.setItem('tmdb_api_key', 'YOUR_API_KEY');`

### Usage

1. Open `index.html` in a web browser
2. Search for movies using the search bar
3. Click "Add to Wishlist" to save movies
4. View your saved movies in the wishlist section
5. Remove movies from your wishlist when done

## Project Structure

```
movie-wishlist/
├── index.html      # Main HTML file
├── styles.css      # All styling
├── app.js          # Main JavaScript logic
├── README.md       # This file
└── .gitignore     # Git ignore rules
```

## API Reference

### TMDb API Endpoints Used

- **Search Movies**: `GET https://api.themoviedb.org/3/search/movie`
- **Movie Details**: `GET https://api.themoviedb.org/3/movie/{movie_id}`

### API Key Configuration

The app stores your API key in localStorage for convenience. This keeps your key out of the codebase.

## Browser Compatibility

Works in all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Demo

This is a demo project showcasing vanilla JavaScript development. No build tools, no bundlers - just pure, clean code.

---

Built with ❤️ by Daniel Figucio
