# WasteWise AI

**Turn Waste Data Into Sustainable Decisions.**

WasteWise AI is a software-only sustainability SaaS platform for colleges, municipalities, residential communities, offices, and organizations. It analyzes historical waste data, forecasts future generation, estimates environmental impact, detects hotspots, and recommends high-impact actions. It does not use IoT, sensors, Arduino, ESP32, MQTT, GPS, or hardware APIs.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Recharts, React Router, Axios, Lucide React
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod, multer, csv-parser
- ML service: FastAPI, NumPy, Pandas, Scikit-learn-ready baseline logic

## Architecture

User -> React frontend -> Express REST API -> PostgreSQL via Prisma  
Express also calls the FastAPI ML service for forecasting, anomaly detection, scoring, and recommendations.

## Features

- Landing page with SDG 11, SDG 12, SDG 13 alignment
- JWT auth with Admin, Analyst, and Viewer roles
- Demo Mode with six months of synthetic waste records
- Dashboard KPIs, trends, composition, location, recycling, CO2, and forecast charts
- Waste CRUD and CSV preview/import validation
- Dataset management and data quality indicators
- AI analytics: forecasts, model metrics, drivers, hotspot detection
- Environmental impact engine with configurable factors
- Sustainability score, recommendation engine, collection planning
- What-If Sustainability Simulator
- Report generation endpoint with frontend report view

## Setup

```bash
npm.cmd install
npm.cmd install --workspaces
copy .env.example server\.env
copy .env.example client\.env
```

Create PostgreSQL database `wastewise_ai`, then run:

```bash
npm.cmd run prisma:generate --workspace server
npm.cmd run prisma:migrate --workspace server
npm.cmd run seed --workspace server
```

Run the services:

```bash
npm.cmd run dev:server
npm.cmd run dev:client
cd ml-service
py -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000/api`  
ML service: `http://localhost:8000`

## Demo Login

- Admin: `admin@wastewise.ai` / `Password123!`
- Analyst: `analyst@wastewise.ai` / `Password123!`
- Viewer: `viewer@wastewise.ai` / `Password123!`

## Dataset Format

```csv
date,location,category,quantityKg,source,disposalMethod
2026-01-01,Campus A,Organic,120,College,Composting
2026-01-01,Campus A,Plastic,45,College,Recycling
```

## API Summary

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/waste`
- `GET /api/dashboard/summary`
- `POST /api/datasets/upload`, `GET /api/datasets`, `DELETE /api/datasets/:id`
- `GET /api/analytics/overview`
- `POST /api/forecast`, `GET /api/forecast`
- `GET /api/environment/impact`
- `GET /api/recommendations`
- `POST /api/simulator`
- `GET/POST /api/reports`

## Testing

```bash
npm.cmd test
cd ml-service
.venv\Scripts\pytest
```

## Notes

Emission factors, calorific values, and avoided CO2 values are configurable estimates, not scientific claims. Demo data is synthetic and intended for product demonstration. Future improvements include persistent report PDF rendering, richer Prisma-backed repositories, and advanced model retraining jobs.
