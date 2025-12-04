# Sequence – Login Flow (Intended)

Actors:
- User (browser / Postman)
- Frontend SPA (optional for Postman)
- Backend (Spring Boot)
- Database

Steps:
1. User enters email + password.
2. Frontend/Postman sends `POST /api/auth/login` with JSON body `{ email, password }`.
3. Backend:
   - Looks up user in `users` table by email.
   - Verifies password hash.
   - If valid, generates token and determines role (EMPLOYEE / MANAGER / HR_ADMIN).
4. Backend responds with JSON: `{ userId, name, email, role, token }`.
5. Frontend/Postman stores the `token`.
6. For subsequent API calls (e.g., `/api/employees`), client sends header `Authorization: Bearer <token>`.

Note: At the time of writing, step 3–4 via `/api/auth/login` are returning 403 due to Spring Security configuration, and only Spring's default HTML login works. This is logged as a known issue.
