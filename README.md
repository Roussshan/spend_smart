# SpendSmart — Prototype

Brief intro
--------------

SpendSmart is a small prototype web app to help visualize your spending with mood, location and simple forecast insights. This repository contains a backend (Express + MongoDB) and a frontend (React + Vite). The project is intentionally lightweight for local development and demo purposes.

Repository layout
-----------------

- `spendsmart-backend/` — top-level backend folder with a small server and demo seed data.
  - `backend/` — Express server, models and routes.
    - `server.js` — backend entry point
    - `routes/` — `transactions`, `dangerzones`, `analytics` endpoints
    - `models/` — Mongoose models
    - `seed.js` — demo seed script

- `spendsmart-frontend/` — frontend app using Vite + React
  - `src/` — React components and app code
  - `postcss.config.cjs`, `vite.config.js` — small build configs

Prerequisites
-------------

- Node.js (recommended v18+)
- npm
- MongoDB (Atlas or local). If you use Atlas, whitelist your dev machine IP.

Quick start (development)
-------------------------

1. Clone the repo and change into the workspace root (already done if you have this repo locally):

```powershell
cd d:\WORK\spend
```

2. Backend setup

```powershell
cd spendsmart-backend/backend
npm install
# Create or edit .env to set MONGO_URI (optional, defaults to mongodb://localhost:27017/spendsmart)
# Example .env contents:
# MONGO_URI=mongodb://localhost:27017/spendsmart
# PORT=4000
npm run dev    # starts nodemon server.js
```

Notes: The backend exposes these main routes:

- `GET /ping` — health check
- `GET /api/transactions` — list transactions
- `POST /api/transactions` — create transaction
- `GET /api/danger-zones` — list danger zones
- `POST /api/danger-zones` — create a danger zone
- `GET /api/analytics/forecast` — simple cashflow forecast

3. Frontend setup

```powershell
cd d:\WORK\spend\spendsmart-frontend
npm install
npm run dev    # starts Vite (http://localhost:5173)
```

Frontend config notes
- `vite.config.js` includes an explicit `postcss: {}` to avoid upward PostCSS search in developer machines with broken configs.

Seed data
---------

Run the seed script from the backend folder to populate demo transactions:

```powershell
cd spendsmart-backend/backend
node seed.js
```

Common issues & troubleshooting
-------------------------------

- MongoDB Atlas connection errors: If you see `MongooseServerSelectionError` or IP whitelist errors, either:
  - Add your current IP to the Atlas IP access list, or
  - Use a local MongoDB URI in `.env` (e.g. `mongodb://localhost:27017/spendsmart`).

- Frontend PostCSS errors: `postcss.config.cjs` and `vite.config.js` are present to avoid Vite searching outward for broken configs. If PostCSS errors persist, please paste the full stack trace.

- Vite dev server restarts: If Vite continuously restarts, check for editors or processes touching files and exclude build artifacts from git.

Git and repository notes
------------------------

- This repository was recently pushed to `origin/main`. If you want to clean the repo history from build artifacts, consider adding the following to `.gitignore` and removing the files from the index:

```gitignore
.vite/
node_modules/
dist/
*.log
```

To remove previously committed build artifacts (example):

```powershell
git rm -r --cached spendsmart-frontend/.vite
git commit -m "chore: remove .vite build artifacts from repository"
git push
```

Developer notes (recent quick fixes)
-----------------------------------

- `server.js` was adjusted to use CommonJS `require` to match other backend modules and the existing route files.
- `server.js` temporarily starts the server even if MongoDB connection fails (useful for frontend development). For production, revert to failing fast.
- `spendsmart-frontend/src/components/Dashboard.jsx` was made defensive: default values, safer numeric formatting and guards for missing fields to avoid runtime crashes when API responses are partial.
- `vite.config.js` was added to avoid PostCSS config parsing errors in Vite.

How you can help / next steps
----------------------------

- If you want, I can:
  - Add `.vite` and other generated files to `.gitignore` and remove them from Git history.
  - Inspect and fix the Edit / Delete / View button handlers on the transactions list (frontend + backend endpoints).

Contact
-------

If you want me to make additional changes (clean git history, update `.gitignore`, or fix UI handlers), tell me what to do next and I will apply the changes and push them.

