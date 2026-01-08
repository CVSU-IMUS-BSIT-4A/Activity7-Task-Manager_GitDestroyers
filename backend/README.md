# Activity 7 Backend

NestJS API for Project and Task Management.

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

3. Database Migration:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Run the application:
   ```bash
   # development
   npm run start:dev

   # production
   npm run start:prod
   ```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
`http://localhost:3000/api`

## Project Structure

- `src/common`: Global filters, interceptors, and pipes.
- `src/modules`: Business logic modules (Users, Projects, Tasks).
- `src/prisma`: Prisma integration.
