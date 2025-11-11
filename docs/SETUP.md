# Local Development Setup

## Prerequisites

- Node.js 18+
- NPM or Yarn

## Installation

```bash
npm install
npm run dev
# Visit http://localhost:5173
```

## Environment Setup

Create `.env` file in project root:

```bash
# Required for maps
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Optional - for Google Maps fallback
VITE_GOOGLE_MAPS_API_KEY=your_google_key
```

Get tokens:

- Mapbox: https://account.mapbox.com/access-tokens/
- Google Maps: https://console.cloud.google.com

## Configuration

- `AUTO_RESOLVE_HOURS`: Hazard auto-resolution time (default: 24)
- `CONFIRMATIONS_NEEDED`: Reports needed to mark resolved (default: 3)

See `DEPLOYMENT.md` for production deployment.
