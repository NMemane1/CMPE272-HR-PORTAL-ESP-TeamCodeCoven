# HR Portal – Test Cases (Shilpa)

Legend: H = High, M = Medium, L = Low

---

## 1. Auth

| ID   | Title                      | Steps                                      | Expected Result                                 | Priority |
|------|----------------------------|--------------------------------------------|-------------------------------------------------|----------|
| TC-A01 | Login success           | POST /api/auth/login with valid creds      | 200, body has userId, name, role, token        | H        |
| TC-A02 | Login fail (bad password) | POST /api/auth/login with wrong password | 401 Unauthorized                               | H        |
| TC-A03 | Get current user        | Login, then GET /api/auth/me with token    | 200, returns current user info                 | H        |
| TC-A04 | Auth me without token   | GET /api/auth/me without Authorization     | 401 Unauthorized                               | H        |

---

## 2. Employees

| ID   | Title                                      | Role      | Steps                                                     | Expected Result                                             | Priority |
|------|--------------------------------------------|-----------|-----------------------------------------------------------|-------------------------------------------------------------|----------|
| TC-E01 | Admin can list all employees            | HR_ADMIN  | Login as HR_ADMIN, GET /api/employees                    | 200, list of employees                                     | H        |
| TC-E02 | Employee cannot list all employees      | EMPLOYEE  | Login as EMPLOYEE, GET /api/employees                    | 403 Forbidden                                              | H        |
| TC-E03 | Employee can view own profile           | EMPLOYEE  | Login as EMPLOYEE (id=X), GET /api/employees/X           | 200, returns their own data                                | H        |
| TC-E04 | Employee cannot view others' profile    | EMPLOYEE  | Login as EMPLOYEE (id=X), GET /api/employees/Y (Y≠X)     | 403 Forbidden                                              | H        |
| TC-E05 | Admin can create employee               | HR_ADMIN  | Login as HR_ADMIN, POST /api/employees with valid body   | 200/201, new employee created with id + ACTIVE status      | H        |

---

## 3. Payroll (examples)

| ID   | Title                                      | Role      | Steps                                                            | Expected Result                                      | Priority |
|------|--------------------------------------------|-----------|------------------------------------------------------------------|------------------------------------------------------|----------|
| TC-P01 | Employee can view own payroll           | EMPLOYEE  | Login as EMPLOYEE id=X, GET /api/employees/X/payroll            | 200, list of payroll records                         | H        |
| TC-P02 | Employee cannot view others' payroll    | EMPLOYEE  | Login as EMPLOYEE id=X, GET /api/employees/Y/payroll            | 403 Forbidden                                        | H        |
| TC-P03 | Manager can view team payroll           | MANAGER   | Login as MANAGER, GET payroll for employee in their team        | 200                                                  | M        |
| TC-P04 | Employee blocked from global payroll    | EMPLOYEE  | Login as EMPLOYEE, GET /api/payroll?month=2024-10&department=HR | 403 Forbidden                                        | H        |

---

## 4. Performance

| ID   | Title                                  | Role      | Steps                                                            | Expected Result                                      | Priority |
|------|----------------------------------------|-----------|------------------------------------------------------------------|------------------------------------------------------|----------|
| TC-PR01 | Employee sees own performance      | EMPLOYEE  | Login as EMPLOYEE, GET /api/employees/X/performance             | 200, list of reviews for X                           | M        |
| TC-PR02 | Employee cannot see others' perf   | EMPLOYEE  | Login as EMPLOYEE, GET /api/employees/Y/performance (Y≠X)       | 403 Forbidden                                        | H        |
| TC-PR03 | Manager creates performance review | MANAGER   | Login as MANAGER, POST /api/employees/X/performance             | 200/201, review created                              | M        |
| TC-PR04 | Employee cannot create review      | EMPLOYEE  | Login as EMPLOYEE, POST /api/employees/X/performance            | 403 Forbidden                                        | H        |