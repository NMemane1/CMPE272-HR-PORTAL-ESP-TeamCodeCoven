# Architecture Diagram – Notes

- Frontend: React (Vite) app
  - Calls backend using `VITE_API_BASE_URL` (http://localhost:8080 in dev)
- Backend: Spring Boot app (`feature/auth-stable`)
  - Exposes REST APIs under `/api/...`
  - Uses Spring Security for authentication and RBAC
- Database: (H2/MySQL – depending on config)
  - Stores users, employees, payroll, performance reviews

Main flow:
1. User opens frontend and logs in.
2. Frontend sends POST `/api/auth/login` with email/password.
3. Backend validates credentials, issues JWT-like token.
4. Frontend stores token and uses `Authorization: Bearer <token>` for all further `/api/...` calls.
5. Backend checks token + role (EMPLOYEE, MANAGER, HR_ADMIN) before returning data.
