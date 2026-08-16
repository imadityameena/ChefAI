# Recipe Generator

Full-stack AI recipe app with pantry management, meal planning, shopping lists, and user authentication.

## Monorepo Structure

```text
Reciepe-Generator/
  backend/   Express API + PostgreSQL + Gemini integration
  frontend/  React + Vite client app
```

## Features

- User authentication (signup/login)
- AI-powered recipe generation
- Pantry inventory management
- Meal planner
- Shopping list management
- Saved recipes and recipe details

## Tech Stack

- Frontend: React, Vite, Axios, React Router, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, PostgreSQL (`pg`), JWT, bcrypt
- AI: Google Gemini (`@google/genai`)

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database (local or hosted)
- Gemini API key

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Note: `frontend/src/services/api.js` falls back to `http://localhost:8000/api` when `VITE_API_URL` is not set. In local development, set `VITE_API_URL` to match your backend port.

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Run database migration

From `backend/`:

```bash
node migrate.js
```

### 3. Start backend

From `backend/`:

```bash
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 4. Start frontend

From `frontend/`:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Available Scripts

### Backend (`backend/package.json`)

- `npm start` -> run server with Node
- `npm run dev` -> run server with Nodemon

### Frontend (`frontend/package.json`)

- `npm run dev` -> start Vite dev server
- `npm run build` -> production build
- `npm run preview` -> preview production build
- `npm run lint` -> run ESLint

## API Base Path

All API routes are mounted under:

`/api`

Examples:

- `/api/auth`
- `/api/users`
- `/api/pantry`
- `/api/recipes`
- `/api/meal-plans`
- `/api/shopping-list`

## Deployment Notes

- Backend includes `backend/render.yaml` configured for Render.
- Frontend includes `frontend/vercel.json` configured for Vercel SPA rewrites.

## Health Endpoints

- `GET /` -> basic API message
- `GET /api` -> API health/status response
