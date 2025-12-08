# CMPE 272 – HR Portal  
## Test Plan 

1. **Objective**
The objective of this test plan is to define the strategy, scope, and methodology for validating the HR Portal backend and UI components.
Testing focuses on:
•	Authentication (/api/auth/login, /api/auth/me)
•	Role identification for EMPLOYEE, MANAGER, HR_ADMIN
•	CRUD operations for Employees, Payroll, Performance
•	Error handling and validation behavior
•	Postman-based automated testing
The goal is to ensure the HR Portal APIs are reliable, accurate, and ready for frontend integration.
 
2. **Scope**
In Scope
•	API testing using Postman
•	Authentication & session validation
•	CRUD testing for Employee, Payroll, Performance modules
•	Error-handling verification (400, 401, 404 scenarios)
•	Basic UI smoke testing once frontend connects
Out of Scope
•	Load/Performance testing
•	Automated UI testing (e.g., Selenium, Cypress)
•	Production security penetration testing
•	Large-scale integration tests
 
3.** Test Types**
•	Functional API Tests
Validate REST API correctness for all CRUD modules.
•	Authentication Tests
Successful login, invalid login, and /auth/me identity checks.
•	Role-Based Behavior Tests
Ensure systems identify Employee, Manager, and Admin roles correctly.
•	Error-Handling Tests
Validate server responses for invalid payloads and missing/incorrect IDs.
•	Regression Tests
Re-run essential tests after backend fixes or feature updates.
 
4. **Environments**
Local Development Environment
•	Backend URL: http://localhost:8080
•	Base API path: /api
•	Database auto-seeded with default users:
o	employee@test.com / password123
o	manager@test.com / password123
o	hradmin@test.com / password123
o	Admin seed: nikita.memane@sjsu.edu / nrm123
Staging / AWS Environment (TBD)
To be updated when deployment is finalized.
 
5. **Tools**
•	Postman – API testing, automation scripts
•	Browser – UI-level smoke testing
•	draw.io / diagrams.net – Architecture & sequence diagrams
•	GitHub – Documentation, test case tracking
 
6. **Entry / Exit Criteria**
**Entry Criteria**
•	Backend is running locally (./mvnw spring-boot:run).
•	Valid test credentials available.
•	Postman collection configured.
**Exit Criteria**
•	All high-priority functional test cases executed.
•	All CRUD modules validated with successful responses.
•	Authentication & identity behavior verified.
•	Test results documented in test-cases.md.
•	Screenshots captured for representative test evidence.
 
7. **Risks / Assumptions**
•	Frontend integration may depend on timing of UI availability.
•	Test data (IDs for employees, payroll records, etc.) must exist for dependent tests.
•	Changes to backend endpoints may require re-testing.
 
8. **Current Test Execution Status (as of December 7, 2025)**
Backend Status
•	Backend branch tested: feature/auth-stable
•	Application boots successfully on port 8080
•	Default admin and test users created at startup
**Test Execution Summary**
•	Authentication Tests: PASS
•	Employees CRUD: PASS
•	Payroll Module: PASS
•	Performance Module: PASS
•	Error Handling Tests: PASS
•	Screenshots of successful operations have been captured for the final report.
Functional tests demonstrate reliability across all major backend modules.
 
9. **References**
•	API specifications & RBAC details shared by backend developer
•	GitHub repository: CMPE272-HR-PORTAL-ESP-TeamCodeCoven
•	Postman Collection: HR Portal APIs
•	Test user credentials provided during development

<img width="468" height="630" alt="image" src="https://github.com/user-attachments/assets/cc7d2d5b-04b6-44c5-a69e-030d0712cc96" />

