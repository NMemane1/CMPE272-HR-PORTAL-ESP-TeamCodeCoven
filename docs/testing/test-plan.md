# CMPE 272 – HR Portal  
## Test Plan – Shilpa

### 1. Objective
The objective of this test plan is to define the strategy, scope, approach, and responsibilities for testing the HR Portal application.  
Testing covers both backend and frontend functionality, with a strong emphasis on:

- Authentication (`/api/auth/login` and `/api/auth/me`)
- Role-Based Access Control (EMPLOYEE, MANAGER, HR_ADMIN)
- Employee management APIs
- Payroll APIs
- Performance review APIs
- Error handling and security behavior

The tester will validate functionality, verify access control enforcement, and document defects or incomplete features.

---

### 2. Scope

#### **In Scope**
- API testing using Postman  
- Authentication testing (custom login endpoint)  
- RBAC testing across all roles  
- CRUD operations for Employee, Payroll, Performance entities  
- Basic UI navigation testing (once frontend connects to backend)  
- Error-handling verification using Spring Boot's common error format  

#### **Out of Scope**
- Performance/load testing  
- Automated frontend testing (e.g., Cypress)  
- Full penetration/security audit  
- Production-scale integration testing  

---

### 3. Test Types

- **Functional API Tests:**  
  Validate that all endpoints behave as expected with correct inputs and payloads.

- **RBAC / Security Tests:**  
  Ensure EMPLOYEE, MANAGER, HR_ADMIN each have the correct allowed/blocked API behavior.

- **UI Flow Tests:**  
  Validate navigation and visible features based on role (once frontend integrates with backend).

- **Regression Tests:**  
  Re-run all critical test cases after major backend changes or fixes.

---

### 4. Environments

#### **Local Development Environment**
- Backend: `http://localhost:8080` (Spring Boot, branch: `feature/auth-stable`)  
- Base API path: `/api`  
- Database: auto-initialized with default admin user  
  - Email: `nikita.memane@sjsu.edu`  
  - Password: `nrm123`

#### **Staging/AWS Environment (TBD)**
- URL and environment details will be updated once deployed.

---

### 5. Tools

- **Postman** → API validation, RBAC checks  
- **Browser** → UI-level tests (once connected)  
- **draw.io / diagrams.net** → Architecture + sequence diagrams  
- **GitHub** → Documentation, issue tracking, test artifacts  

---

### 6. Entry / Exit Criteria

#### **Entry Criteria**
- Backend is running locally (`./mvnw spring-boot:run`).  
- Test user credentials are available (admin created at startup).  
- Tester has access to the correct backend branch (`feature/auth-stable`).  

#### **Exit Criteria**
- All **High** priority test cases are executed.  
- All **Critical** defects fixed OR documented as known issues.  
- RBAC behavior validated across all roles.  
- Test results documented in `test-cases.md`.

---

### 7. Risks / Assumptions

- **Custom login endpoint `/api/auth/login` currently returns `403 Forbidden`**  
  Spring Security default form login works, but the JSON-based login for APIs is not yet fully wired.  
  This blocks further auth-dependent tests (e.g., `/auth/me`, Employee APIs, Payroll APIs).

- Backend implementation for authentication is still in progress on branch `feature/auth-stable`.

- Frontend integration testing will begin **after** backend auth is functional.

- Test execution is dependent on backend stability and endpoint correctness.

---

### 8. Current Test Execution Status (as of December 3, 2025)

- Backend branch tested: **`feature/auth-stable`**  
- Application boots successfully on port 8080  
- Default admin user created at startup  
  (`nikita.memane@sjsu.edu / nrm123`)

#### Current Results:
- **TC-A01 (Login Success): FAIL – 403 Forbidden**  
- All additional auth-dependent test cases → **BLOCKED**  
- RBAC matrix drafted and ready for validation  
- Test cases drafted for all modules (Employees, Payroll, Performance)

Execution will resume once the authentication endpoint is fixed.

---

### 9. References
- API list & RBAC rules shared by Nikita  
- Repository: CMPE272-HR-PORTAL-ESP-TeamCodeCoven  
- Backend branch under test: `feature/auth-stable`  
- Postman Collection: *HR Portal APIs*
