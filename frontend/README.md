# Activity 7 Frontend

React + Vite + TypeScript UI for the Task Management System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables:
   Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL` matches your backend URL (default: `http://localhost:3000`).

3. Run the development server:
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173`.

## Features

- **Dashboard**: Overview of overdue and upcoming tasks.
- **Projects**: Manage project portfolios and navigate to project-specific tasks.
- **Tasks**: Filterable view of all tasks across projects.
- **Users**: Team member management.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Axios (API client)
- React Router (navigation)
