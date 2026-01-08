# Security Guidelines

## Environment Variables
- **NEVER** commit `.env` files to version control.
- Use `.env.example` as a template for required environment variables.
- Rotate secrets (like database passwords or JWT secrets) regularly if this were a production app.

## Input Validation
- All backend inputs are validated using `class-validator` and `ValidationPipe`.
- Frontend inputs should be validated before submission to improve UX.

## CORS & Rate Limiting
- CORS is enabled to allow the frontend to communicate with the backend.
- Basic rate limiting is implemented to prevent abuse of API endpoints.

## Database Security
- The SQLite database file (`dev.db`) is ignored by Git to prevent data leakage.
