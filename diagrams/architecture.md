# Architecture Diagram – Notes

- Frontend: React app
  - Calls backend using `VITE_API_BASE_URL` (e.g., http://localhost:8080/api in dev)

- Backend: Spring Boot app (branch `feature/auth-stable`)
  - Exposes REST APIs under `/api/...`
  - Key modules:
    - `/api/auth/login`, `/api/auth/me`
    - `/api/employees` (CRUD)
    - `/api/payroll` (CRUD)
    - `/api/performance` (CRUD)
  - Uses Spring Security for authentication and role identification
    (EMPLOYEE, MANAGER, HR_ADMIN)

- Database: H2/MySQL (depending on config)
  - Stores:
    - users
    - employees
    - payroll_records
    - performance_reviews

## Main Flow (Login + API Flow)

1. User opens the frontend and enters email/password.
2. Frontend sends `POST /api/auth/login` with a JSON body containing credentials.
3. Backend validates the user against the `users` table using Spring Security.
4. On success, backend returns user details (name, email, role) and establishes an authenticated session.
5. Frontend uses this authenticated session for all further `/api/...` calls
   (employees, payroll, performance).
6. For `GET /api/auth/me`, the backend returns the currently logged-in user’s identity and role.


                 ┌────────────────────┐
                 │     Frontend       │
                 │   React (Vite)     │
                 └─────────┬──────────┘
                           │  REST API Calls
                           ▼
        ┌────────────────────────────────────────┐
        │             Backend API                │
        │           Spring Boot App              │
        │────────────────────────────────────────│
        │  • /api/auth/login                     │
        │  • /api/auth/me                        │
        │  • /api/employees (CRUD)               │
        │  • /api/payroll (CRUD)                 │
        │  • /api/performance (CRUD)             │
        └───────────────┬────────────────────────┘
                        │  JPA / Hibernate
                        ▼
             ┌──────────────────────────┐
             │        Database           │
             │     MySQL / H2 (Dev)     │
             │  • users                 │
             │  • employees             │
             │  • payroll_records       │
             │  • performance_reviews   │
             └──────────────────────────┘

   This diagram illustrates the 3-tier architecture used in the HR Portal: React frontend, Spring Boot backend, and MySQL/H2 database.
