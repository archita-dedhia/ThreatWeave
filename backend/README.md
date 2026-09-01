# ThreatWeave Backend

Express.js backend API server for ThreatWeave Security Operations Center.

## Features

- RESTful API endpoints
- Security event processing
- Threat detection logic
- CORS support for frontend communication
- Health check endpoint

## Prerequisites

- Node.js (v16 or higher)
- npm

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file with your configuration:
   ```bash
   cp .env.example .env.local
   ```

3. Set environment variables in `.env.local`:
   ```
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   GEMINI_API_KEY=your_api_key
   ```

## Development

Start the development server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Production

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api` - Welcome message

## Project Structure

```
src/
├── index.ts       # Main server entry point
└── routes/        # API route handlers (to be added)
```
