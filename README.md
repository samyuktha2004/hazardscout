# Hazard Scout - Road Safety Intelligence System

A comprehensive React TypeScript application for road safety monitoring and hazard detection using VW Connect integration.

## Prerequisites

Before running this project, you need to install:

1. **Node.js** (version 18 or later)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── figma/           # Figma-exported components
│   └── *.tsx            # Main application components
├── types/               # TypeScript type definitions
├── styles/              # Global styles and CSS files
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles with Tailwind CSS
```

## Key Features

- **Hazard Detection**: Real-time road hazard monitoring and alerts
- **VW Connect Integration**: Vehicle data and telemetry integration
- **Live Navigation**: Turn-by-turn navigation with hazard awareness
- **Interactive Maps**: Mapbox integration for detailed mapping
- **Safety Scout**: Community-driven hazard reporting
- **Dashboard**: Comprehensive vehicle and safety analytics
- **Responsive Design**: Mobile-first responsive interface

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Mapbox GL JS** for mapping
- **Lucide React** for icons
- **Sonner** for notifications

## Configuration

### API Keys Required

1. **Mapbox Token**: Update `MAPBOX_TOKEN` in `MapboxMap.tsx`
2. **Google Maps API**: Update keys in Google Maps components (if used)

### Environment Setup

The project includes all necessary configuration files:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

## Development Notes

- The application uses a mobile-first responsive design approach
- All components are built with dark mode support
- The project follows modern React patterns with hooks and functional components
- TypeScript is configured for strict type checking
- ESLint is set up for code quality assurance

## Running the Application

Once Node.js is installed and dependencies are installed via `npm install`, start the development server with:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build and Deployment

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.
