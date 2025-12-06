# 1. Infra / DevOps Module

This folder contains infrastructure and deployment documentation for the project.

> Notes  
> - Backend / frontend Dockerfiles are stored in their own service folders.  
> - The main docker-compose.yml lives in the project root dir.  
> - CI/CD uses **GitHub Actions**.


## 2. Prerequisites

- Docker & Docker Compose  
- Git  
- (Optional for deployment) AWS CLI with correct credentials  
- Access to GitHub Actions & AWS ECR/EC2/ECS (depending on deployment)


## 3. Local Development (using docker-compose)

Run these commands :

1. Prepare environment variables (if needed):
   cp .env.example .env
2. Start services:
   docker compose up --build
3. Shut down:
   docker compose down

4. CI/CD with GitHub Actions
   CI/CD is handled by GitHub Actions under the .github/workflows/ directory.

  1. Build

  .Install dependencies

  .Run tests (backend + frontend)

  .Build production artifacts (JAR, frontend build, etc.)

  2. Docker image build & push

  .Build Docker images for:

  .hr-backend

  .hr-frontend

  .Tag and push images to container registry (e.g. AWS ECR)

  3. Deploy

  .Run deployment script (deploy_ecr.sh) on target environment

5. AWS Deployment Notes

  App configuration is provided via environment variables:

  DB connection (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS)

  CORS config (ALLOWED_ORIGINS)


6. Notes
  Dockerfiles stay in service folders.

  docker-compose.yml stays in root for convenience.

