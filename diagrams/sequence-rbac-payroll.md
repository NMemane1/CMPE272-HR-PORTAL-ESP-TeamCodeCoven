# Sequence – RBAC Example (Manager viewing team payroll)

1. Manager logs in and receives a token with role = MANAGER.
2. Frontend/Postman calls `GET /api/employees/{id}/payroll` for a team member.
3. Backend validates the token and extracts:
   - userId (manager)
   - role = MANAGER
4. Backend checks that the requested employee `{id}` is in the manager's team.
   - If yes → returns payroll data.
   - If no → returns 403 Forbidden.
5. Tester verifies:
   - Payroll visible for own team.
   - 403 for employees outside the team.
