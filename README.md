# CrossTimely

CrossTimely helps groups find a time that works across time zones.
Compare local times, share proposed event times with participants, and collect and compare their availability—all without an account.

**Live app:** [crosstimely.com](https://crosstimely.com)

## Features

- Compare local times in the World Clock and choose possible event times.
- Create an event poll and share its link with participants.
- Collect availability responses and comments, displayed in each participant’s time zone.
- Optionally protect event editing and deletion with a password.

## Technology

- **Frontend:** React, TypeScript, Vite, React Router, and Tailwind CSS
- **Backend:** Ruby on Rails API
- **Database:** PostgreSQL
- **Production hosting:** Render

## Project structure

- `frontend/` — React web application
- `backend/` — Rails API application and Dev Container configuration

## Local development

### Prerequisites

- Docker Desktop
- Visual Studio Code with the Dev Containers extension
- Node.js and npm

### Start the backend

1. Open the `backend/` folder in Visual Studio Code.
2. Run **Dev Containers: Reopen in Container** and wait for setup to finish.

When you reopen the project in the Dev Container, Docker Compose starts the PostgreSQL service.
The Dev Container sets `DB_HOST=postgres`, which makes Rails connect to that service.
After the container is created, `bin/setup --skip-server` installs Ruby dependencies and prepares the database.
You do not need to install PostgreSQL on your machine.

In the Dev Container terminal, start the Rails API:

```bash
bin/dev
```

The API is available at `http://localhost:3000`.

### Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:3000` as its API by default.
To use another API URL, set `VITE_API_BASE_URL` in a local Vite environment file.

### Frontend commands

Run these commands from `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run format       # Format with Prettier
npm run format:check # Check formatting with Prettier
```
