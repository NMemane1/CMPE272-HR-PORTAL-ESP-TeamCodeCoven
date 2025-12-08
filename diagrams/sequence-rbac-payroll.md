# Sequence – RBAC Example (Manager viewing team payroll)

1. Manager logs in and receives a token with role = MANAGER.
2. Frontend/Postman calls `GET /api/employees/{id}/payroll` for a team member.
3. Backend validates the `Authorization: Bearer <token>` header and extracts:
   - `userId` (manager)
   - `role = MANAGER`
4. Backend queries the database to check that the requested employee `{id}` belongs to the manager’s team.
   - If yes → loads payroll row(s) for `{id}` and returns payroll data (200 OK).
   - If no → returns `403 Forbidden`.
5. Tester verifies:
   - Payroll is visible for employees in the manager’s team.
   - `403 Forbidden` is returned for employees outside the team.
