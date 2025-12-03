# RBAC Matrix – HR Portal

Roles:
- EMPLOYEE
- MANAGER
- HR_ADMIN

## Auth

| Endpoint          | EMPLOYEE | MANAGER | HR_ADMIN | Notes   |
|-------------------|----------|---------|----------|--------|
| POST /api/auth/login | ✅ Public | ✅ Public | ✅ Public | No auth required |
| GET /api/auth/me      | ✅       | ✅      | ✅       | Must be logged in |

## Employees

| Endpoint                      | EMPLOYEE                               | MANAGER                        | HR_ADMIN         |
|-------------------------------|----------------------------------------|--------------------------------|------------------|
| GET /api/employees           | ❌                                      | ✅ (all)                       | ✅ (all)         |
| GET /api/employees/{id}      | ✅ (self only)                          | ✅ (any)                       | ✅ (any)         |
| POST /api/employees          | ❌                                      | ❌                              | ✅               |
| PUT /api/employees/{id}      | ✅ (self – basic fields only)          | ✅ (any employee)              | ✅ (any)         |
| DELETE /api/employees/{id}   | ❌                                      | ❌                              | ✅               |

## Payroll

| Endpoint                                   | EMPLOYEE                  | MANAGER                           | HR_ADMIN       |
|--------------------------------------------|---------------------------|-----------------------------------|----------------|
| GET /api/employees/{id}/payroll           | ✅ (self)                 | ✅ (team members)                 | ✅ (any)       |
| POST /api/employees/{id}/payroll          | ❌                        | ❌                                | ✅             |
| GET /api/payroll?month=..&department=..   | ❌ (blocked)              | ✅ (their department only)        | ✅ (all)       |

## Performance

| Endpoint                                            | EMPLOYEE       | MANAGER           | HR_ADMIN      |
|-----------------------------------------------------|----------------|-------------------|---------------|
| GET /api/employees/{id}/performance                 | ✅ (self)       | ✅ (any)           | ✅ (any)      |
| POST /api/employees/{id}/performance                | ❌             | ✅                 | ✅            |
| PUT /api/employees/{id}/performance/{reviewId}      | ❌             | ✅                 | ✅            |
