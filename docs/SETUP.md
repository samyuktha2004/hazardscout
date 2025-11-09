# Hazard Scout Setup Guide

## Prerequisites

- Node.js 18+
- NPM or Yarn

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Map Services:

   ### Mapbox Setup

   1. Get token from [Mapbox](https://account.mapbox.com/access-tokens/)
   2. Add to `.env`:
      ```
      VITE_MAPBOX_TOKEN=your_token_here
      ```

   ### Google Maps (Optional)

   1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
   2. Add to `.env`:
      ```
      VITE_GOOGLE_MAPS_API_KEY=your_key_here
      ```

3. Start Development:
   ```bash
   npm run dev
   ```

## Configuration Options

- `AUTO_RESOLVE_HOURS`: Time before hazards auto-resolve (default: 24)
- `CONFIRMATIONS_NEEDED`: Reports needed to resolve hazard (default: 3)
- `MAP_DEFAULT_CENTER`: Default map center coordinates
- `MAP_DEFAULT_ZOOM`: Default zoom level
