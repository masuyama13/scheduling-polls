# scheduling-polls

Scheduling polls application repository.

## Structure

- `backend/`: Rails API application
- `frontend/`: React + TypeScript application

## Backend

The backend is developed inside a Dev Container.

### Prerequisites

- Docker Desktop
- Visual Studio Code (VS Code)
- VS Code extension: `Dev Containers`

### Open The Backend

1. Open `backend` folder in VS Code.
2. Run `Dev Containers: Reopen in Container`.
3. Wait for the initial build and `postCreateCommand` to finish.

The Dev Container starts a PostgreSQL container automatically and sets `DB_HOST=postgres`,
so Rails connects to the containerized database instead of a local PostgreSQL server.

### Initial Setup

Inside the Dev Container terminal, run:

```bash
bin/rails db:create
bin/rails db:migrate
```

### Run The App

Inside the Dev Container terminal, run:

```bash
bin/dev
```

If `bin/dev` is not being used yet, you can also run:

```bash
bin/rails server -b 0.0.0.0
```

Then open `http://localhost:3000`.

## Frontend

The frontend uses React, TypeScript, Vite, React Router, and Tailwind CSS.

### Initial Setup

```bash
cd frontend
npm install
```

### Run The App

```bash
cd frontend
npm run dev
```

Then open the URL shown by Vite, usually `http://localhost:5173`.

### Commands

Run these commands inside the `frontend` directory.

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- You do not need a local PostgreSQL installation for day-to-day development.
- Database data is stored in the Docker volume `postgres-data`.
- `backend/config/database.yml` is set up to use the PostgreSQL container when `DB_HOST` is present.
