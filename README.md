# Activity 7: Task Management System

This is a monorepo containing the backend and frontend for the Activity 7 Task Management System.

## Project Structure

- `backend/`: NestJS + Prisma + SQLite API.
- `frontend/`: React + Vite + TypeScript UI.
- `docs/`: API documentation and Postman collections.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation & Run

#### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. `npx prisma migrate dev --name init`
5. `npm run start:dev`
6. Swagger UI: `http://localhost:3000/api`

#### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. UI: `http://localhost:5173`

## Security
See [SECURITY.md](./SECURITY.md) for security guidelines.
