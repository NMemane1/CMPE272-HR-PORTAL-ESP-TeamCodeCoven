# Sequence Diagram – Role-Based Access (Manager Accessing Payroll)

Actors:
- Manager (User)
- Frontend (React / Postman)
- Backend (Spring Boot)
- Database

Steps:
1. Manager logs in using `POST /api/auth/login` and is authenticated successfully.
2. Backend identifies the user as `role = MANAGER` and establishes an authenticated session.
3. Manager wants to view a team member’s payroll and triggers a request from the frontend/Postman:
   - `GET /api/payroll/{employeeId}`
4. Frontend/Postman sends the request using the existing authenticated session.
5. Backend receives the request and:
   - Resolves the current logged-in user from the session.
   - Reads the manager’s `userId` and `role = MANAGER`.
6. Backend looks up:
   - The requested `employeeId` in the `employees` table.
   - The relationship between the manager and that employee (manager_id / team mapping).
7. Decision:
   - If the employee belongs to the manager’s team → proceed.
   - Otherwise → deny access.
8. If access is allowed:
   - Backend queries `payroll_records` for the given `employeeId`.
   - Returns `200 OK` with the payroll data in JSON.
9. If access is denied:
   - Backend returns `403 Forbidden` with an appropriate error message.
10. Manager (via frontend/Postman) verifies:
    - Team member payroll visible when authorized.
    - Access blocked (403) for employees outside their team.

**Sequence Diagram – Login Flow**

User              Frontend              Backend (Spring Boot)            Database
 │                   │                           │                          │
 │  Enter credentials│                           │                          │
 │──────────────────>│                           │                          │
 │                   │  POST /api/auth/login     │                          │
 │                   │──────────────────────────>│                          │
 │                   │                           │  Lookup user by email    │
 │                   │                           │─────────────────────────>│
 │                   │                           │                          │
 │                   │                           │  Validate password       │
 │                   │                           │<─────────────────────────│
 │                   │                           │  Build response (role)   │
 │                   │   200 OK + user info      │                          │
 │                   │<──────────────────────────│                          │
 │   Authenticated   │                           │                          │
 │<──────────────────│                           │                          │
 │                   │  Subsequent API requests  │                          │
 │──────────────────>│──────────────────────────>│                          │
 │                   │                           │  Query data              │
 │                   │                           │─────────────────────────>│
 │                   │      JSON response        │                          │
 │                   │<──────────────────────────│                          │


**ASCII Sequence Diagram – RBAC Flow**

 User (Manager)        Frontend/Postman          Backend              Database
     │                        │                   │                      │
     │ Login (credentials)    │                   │                      │
     │───────────────────────>│                   │                      │
     │                        │ POST /auth/login  │                      │
     │                        │──────────────────>│                      │
     │                        │                   │ Validate user/role   │
     │                        │                   │─────────────────────>│
     │                        │                   │<─────────────────────│
     │                        │ 200 OK (MANAGER)  │                      │
     │                        │<──────────────────│                      │
     │                        │                   │                      │
     │   GET /payroll/{id}    │                   │                      │
     │───────────────────────>│──────────────────>│                      │
     │                        │                   │ Check manager-team   │
     │                        │                   │ relationship          │
     │                        │                   │─────────────────────>│
     │                        │                   │<─────────────────────│
     │                        │                   │  Authorized?         │
     │                        │                   │   YES → fetch data   │
     │                        │                   │   NO  → return 403   │
     │                        │                   │──────────────────────│
     │                        │  JSON response    │                      │
     │                        │<──────────────────│                      │


**Login Flow**

     sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Enter email/password
    F->>B: POST /api/auth/login
    B->>D: Query user by email
    D-->>B: User + Password Hash
    B->>B: Validate password
    B-->>F: 200 OK + Role
    F-->>U: Load dashboard

**RBAC Flow**

sequenceDiagram
    participant M as Manager
    participant F as Frontend/Postman
    participant B as Backend
    participant D as Database

    M->>F: Login
    F->>B: POST /auth/login
    B->>D: Validate user
    D-->>B: User + Role=Manager
    B-->>F: 200 OK

    M->>F: GET /payroll/{id}
    F->>B: Request with session
    B->>D: Check employee team relationship
    D-->>B: Result
    alt Allowed
        B-->>F: 200 OK + payroll data
    else Not allowed
        B-->>F: 403 Forbidden
    end


