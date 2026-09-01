# ThreatWeave - Security Operations Center Dashboard

A comprehensive Security Operations Center (SOC) dashboard application for real-time threat detection, incident investigation, and security event analysis.

This is a monorepo containing both frontend and backend applications.

## Project Structure

```
threatweave/
├── frontend/          # React frontend application
├── backend/           # Express.js backend API
├── package.json       # Root package.json with scripts
└── README.md          # This file
```

## Features

- **Dashboard**: Real-time overview of security metrics and threat status
- **Threats Management**: Monitor and manage identified threats across your infrastructure
- **Incidents**: Track and manage security incidents with detailed timelines
- **Threat Investigation**: In-depth analysis and investigation of security threats
- **AI-Powered Investigation**: Leverage AI Studio integration for automated threat analysis
- **Log Analysis**: Parse and analyze raw security logs from multiple sources
- **Analytics**: Visualize security trends and metrics with interactive charts
- **Reporting**: Generate comprehensive security reports
- **Settings**: Configure application preferences and security parameters

## Tech Stack

### Frontend
- React 19 + TypeScript/JSX
- Vite 6 build tool
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React icons
- Google Generative AI API

### Backend
- Express.js
- TypeScript
- Node.js

## Prerequisites

- Node.js (v16 or higher)
- npm

## Installation

Install all dependencies:
```bash
npm run install:all
```

Or manually:
```bash
# Root dependencies
npm install

# Frontend dependencies
npm --prefix frontend install

# Backend dependencies
npm --prefix backend install
```

## Running the Application

### Development - Run Both Frontend and Backend

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Frontend Only

```bash
npm run dev:frontend
```

Frontend available at http://localhost:3000

### Backend Only

```bash
npm run dev:backend
```

Backend available at http://localhost:5000

## Configuration

### Frontend Environment Variables

Create `frontend/.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key
```

See `frontend/.env.example` for more options.

### Backend Environment Variables

Create `backend/.env.local`:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

See `backend/.env.example` for more options.

## Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both frontend and backend for production
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only
- `npm run preview` - Preview frontend production build
- `npm run start:backend` - Start backend production server
- `npm run install:all` - Install dependencies for all packages

### Frontend

```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # TypeScript checking
```

### Backend

```bash
cd backend
npm run dev      # Development server
npm run build    # Build TypeScript
npm start        # Start production server
```

## API Documentation

Backend API runs on `http://localhost:5000`

- `GET /api/health` - Health check endpoint
- `GET /api` - Welcome message

Additional endpoints to be added as features are implemented.

## Documentation

- [Frontend README](./frontend/README.md) - Frontend-specific details
- [Backend README](./backend/README.md) - Backend-specific details

## License

Private - All rights reserved

