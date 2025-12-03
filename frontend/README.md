# Frontend Module

This folder will contain the UI for the HR Portal.

## Responsibilities
- Login, dashboard, and employee views
- API integration with backend
- UI for performance, payroll, and profile pages

## Tech Stack (Tentative)
- React (Vite)
- Tailwind CSS

## TODO
- [ ] Initialize frontend project
- [ ] Create layout
- [ ] Add pages
- [ ] Connect API

This app handles:

* Login & role-based routing (EMPLOYEE / MANAGER / HR_ADMIN)
* Employee dashboards
* Team, payroll, and performance views
* Admin employee management UI
* Integration with the backend /api/... endpoints

## Environment Configuration 
The frontend uses Vite environment variables (must start with VITE_).
- Files:
  * frontend/.env — local development
  * frontend/.env.production — production (Docker/AWS)

## Running locally
Create .env for development
```
cp .env.example .env
```

Now open .env in your editor and make sure it has something like this for mock-based dev setup. Set VITE_USE_MOCK=false in your .env to run against a real backend:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true
```
Now run
```
npm run dev
```

## Create .env.production for builds / Docker
```
cp .env.production.example .env.production
```
Then edit .env.production so it points to your real backend:
```
VITE_API_BASE_URL=http://<your-backend-host>:8080
VITE_USE_MOCK=false
```

## Docker Usage
Build the image.
From /frontend:
```
docker build -t hr-portal-frontend .
```
Run the image locally
```
docker run -p 3000:3000 hr-portal-frontend
```

Then open:
```
http://localhost:3000
```

