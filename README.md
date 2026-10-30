# NULLEVIA — Museum of Things That Never Existed

> *"Discover what reality forgot."*

NULLEVIA is an extraordinary, immersive digital museum showcasing artifacts, impossible inventions, lost civilizations, mysterious creatures, objects from alternate realities, and archives from imaginary futures.

---

## Architecture

- **Frontend**: Lightweight static site (HTML5, CSS3, Vanilla JavaScript, Three.js) deployed to **Render Static Sites**.
- **Backend**: Node.js & Express REST API with Helmet security headers, CORS protection, and input validation, deployed to **Render Web Services**.
- **Database**: Serverless PostgreSQL hosted on **Neon** free tier, accessed with SSL and parameterized queries.

---

## Project Structure

```
Nullevia/
├── frontend/             # Render Static Site
│   ├── index.html        # Museum Entrance & Featured Specimen
│   ├── exhibitions.html  # The Six Collections
│   ├── artifact.html     # Specimen Record Showcase
│   ├── discover.html     # Search & Filter Archive
│   ├── mysteries.html    # Hidden Archive Trails
│   ├── submit.html       # Public Contribution Terminal
│   ├── about.html        # Museum Lore & Institutional Statement
│   ├── css/
│   │   └── style.css     # Design System & Atmospheric Aesthetics
│   ├── js/
│   │   ├── config.js     # Centralized Environment API Configuration
│   │   ├── api.js        # Resilience API Client & Cold-Start Poller
│   │   └── main.js       # Dynamic UI Logic & Graceful Fallbacks
│   └── assets/           # Media & Textures
│
├── backend/              # Render Web Service
│   ├── server.js         # Express App Entrypoint
│   ├── database/
│   │   ├── db.js         # PostgreSQL Pool (Neon SSL)
│   │   └── schema.sql    # Relational Database Schema & Seed Data
│   ├── package.json      # Dependencies & Scripts
│   └── .env.example      # Environment Variable Template
│
├── .gitignore
└── README.md
```

---

## Local Development Quickstart

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and supply your Neon DATABASE_URL (optional for initial mock testing)
node server.js
```
The backend starts on `http://localhost:5000`. Test with:
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Setup
Serve the `frontend/` folder with any static file server:
```bash
# Using Python
python -m http.server 3000 --directory frontend

# Or using npx serve
npx serve frontend -p 3000
```
Open `http://localhost:3000` in your browser.
