# ThreatWeave Frontend

React 19 + TypeScript/JSX frontend for ThreatWeave Security Operations Center Dashboard.

## Features

- Real-time SOC dashboard
- Threat management and investigation
- Incident tracking
- Log analysis with AI assistance
- Security analytics and reporting
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

3. Set environment variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

## Development

Start the development server:
```bash
npm run dev
```

App will be available at `http://localhost:3000`

## Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # React components
│   ├── common/       # Reusable components
│   └── layout/       # Layout components
├── pages/            # Page components
├── context/          # React Context state management
├── services/         # Business logic
├── data/             # Demo datasets
└── types.ts          # TypeScript type definitions

public/               # Static assets
index.html           # HTML entry point
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Motion** - Animations
- **Google Generative AI** - AI integration
