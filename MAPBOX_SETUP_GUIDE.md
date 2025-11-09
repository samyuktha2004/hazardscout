# Mapbox Real-Time Map Integration Setup Guide

## Overview

Your Hazard Scout application now includes real-time Mapbox integration with the following features:
- **Live hazard mapping** with accurate GPS coordinates
- **Turn-by-turn navigation** to hazards  
- **Proximity warnings** when approaching hazards (within 500m)
- **Real-time user location tracking** with geolocation
- **Interactive hazard markers** with click-to-view details
- **Route visualization** showing navigation paths
- **Animated markers** for nearby hazards (pulse effect)

## Quick Start: Add Your Mapbox Token

### Step 1: Get Your Mapbox Access Token

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account (or log in if you have one)
3. Navigate to "Access tokens" page
4. Copy your **Default public token** (starts with `pk.`)
   - OR create a new token with these scopes:
     - `styles:read`
     - `fonts:read`  
     - `datasets:read`
     - `vision:read` (optional, for navigation features)

### Step 2: Add Token to Your Application

Open `/components/MapboxMap.tsx` and replace the placeholder:

```typescript
// BEFORE (Line 14):
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

// AFTER:
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNseHh4eHh4In0.xxxxxxxxxxxxx';
```

**Important:** Replace `'pk.eyJ...'` with your actual token from Step 1.

### Step 3: Test the Integration

1. Reload your application
2. Navigate to the "Scout" (Safety Scout) tab
3. You should now see:
   - Real Mapbox dark theme map
   - Your current location (blue vehicle marker)
   - Hazard markers on the map
   - Navigation controls in the top-right corner
   - Geolocation button to center on your position

## Features Breakdown

### 1. Real-Time Hazard Display

Hazards are displayed on the map with color-coded markers:
- 🔴 **Red**: High severity hazards
- 🟠 **Amber**: Medium severity hazards
- 🔵 **Blue**: Low severity hazards
- ⏰ **Pulsing**: Hazards within 500m of your location

### 2. Navigation System

**To navigate to a hazard:**
1. Click on any hazard marker on the map
2. Review the hazard details in the popup card
3. Click the blue "Navigate to Hazard" button
4. A blue route line will appear showing your path
5. Follow the route to reach the hazard location

**Navigation features:**
- Real-time route calculation using Mapbox Directions API
- Turn-by-turn driving directions
- Dynamic route updates as you move
- Distance and ETA information

### 3. Proximity Warnings

The system automatically warns you when approaching hazards:
- **Within 500 meters**: Toast notification appears
- Shows hazard type and distance
- "View" button to see hazard details
- Marker pulses on the map
- Warnings clear after moving 1000m away

### 4. Interactive Map Controls

**Available controls:**
- **Navigation Controls** (top-right): Zoom in/out, rotate, tilt
- **Geolocation Button**: Center map on your current location
- **Map interactions**: Pan, zoom, rotate (pinch gestures on mobile)
- **3D tilt view**: 50° pitch for better spatial awareness

### 5. User Location Tracking

- Automatically requests geolocation permission
- Real-time position updates using `watchPosition`
- Blue vehicle marker shows your location
- Map centers on your position when available
- Fallback to default location (Delhi) if geolocation unavailable

## Fallback Mode

If you don't add a Mapbox token, the system automatically falls back to a **simulated static map**:
- Grid-based visualization
- Circular positioning of hazards
- No navigation features
- Limited interactivity

**To see the real-time features, you MUST add your Mapbox token!**

## Map Customization

### Change Map Style

In `/components/MapboxMap.tsx`, line 221:

```typescript
// Current: Dark theme
style: 'mapbox://styles/mapbox/dark-v11',

// Options:
// Light theme
style: 'mapbox://styles/mapbox/light-v11',

// Streets
style: 'mapbox://styles/mapbox/streets-v12',

// Satellite
style: 'mapbox://styles/mapbox/satellite-streets-v12',

// Navigation (optimized for turn-by-turn)
style: 'mapbox://styles/mapbox/navigation-day-v1',
```

### Adjust Map Pitch and Zoom

```typescript
// Line 223-224
zoom: 14,           // Default zoom level (1-22)
pitch: 50,          // 3D tilt angle (0-60 degrees)
bearing: 0,         // Rotation (0-360 degrees)
```

### Configure Proximity Warning Distance

In the `checkProximity` function (line 117):

```typescript
// Current: 500 meters warning distance
if (distance < 500 && !warningHazards.has(hazard.id)) {
  // Change 500 to your preferred distance in meters
}
```

## Testing Without Real GPS

If you're testing on a desktop without GPS:

1. The map will center on Delhi, India (default location)
2. Mock hazards are displayed around this location
3. Navigation works but uses default starting point
4. To test with a different location, update `defaultCenter` in `/components/MapboxMap.tsx`:

```typescript
// Line 66
const defaultCenter: [number, number] = [
  -122.4194, // Longitude (San Francisco example)
  37.7749    // Latitude
];
```

## API Usage & Limits

### Mapbox Free Tier Includes:
- **50,000 map loads** per month
- **100,000 geolocation requests** per month
- **Unlimited** free tile requests
- Navigation API included

### Monitor Usage:
- Dashboard: [https://account.mapbox.com/](https://account.mapbox.com/)
- Check "Statistics" section
- Set up billing alerts

## Troubleshooting

### Map Not Loading?

**Check console for errors:**
- `⚠️ Valid Mapbox token required` → Token not added or invalid
- `401 Unauthorized` → Token incorrect or expired
- `403 Forbidden` → Token doesn't have required permissions

**Solutions:**
1. Verify token starts with `pk.`
2. Check token hasn't expired
3. Ensure token has `styles:read` scope
4. Clear browser cache and reload

### Geolocation Not Working?

**Common issues:**
- Browser doesn't have location permission → Check browser settings
- HTTPS required → Geolocation only works on HTTPS (not HTTP)
- Location services disabled → Enable in device settings

**Solution:**
```javascript
// Check permission status
navigator.permissions.query({ name: 'geolocation' })
  .then(result => console.log(result.state));
```

### Navigation Route Not Appearing?

**Possible causes:**
- Invalid coordinates → Check hazard lat/lng values
- API rate limit → Wait a few minutes
- Network error → Check internet connection

**Debug:**
```typescript
// Add console logging in fetchRoute function (line 155)
console.log('Fetching route from', userLocation, 'to', destination);
```

### Markers Not Showing?

**Verify:**
1. Hazards have valid `location.latitude` and `location.longitude`
2. Coordinates are in correct range (lat: -90 to 90, lng: -180 to 180)
3. Map is fully loaded before adding markers

## Advanced Features

### Custom Marker Icons

Edit `/components/MapMarkerIcons.tsx` to customize hazard marker appearance.

### Route Styling

In `/components/MapboxMap.tsx`, line 345:

```typescript
paint: {
  'line-color': '#0070E1',     // Route color (VW Blue)
  'line-width': 5,             // Route thickness
  'line-opacity': 0.8          // Route transparency
}
```

### Multiple Routes

Extend the navigation system to show:
- Fastest route
- Shortest route  
- Alternative routes with traffic

See Mapbox Directions API documentation: [https://docs.mapbox.com/api/navigation/directions/](https://docs.mapbox.com/api/navigation/directions/)

## Security Best Practices

### Production Environment

**DO NOT** commit your token to version control!

Use environment variables:

```bash
# .env file (add to .gitignore)
MAPBOX_TOKEN=pk.your_actual_token_here
```

```typescript
// Access in code
const MAPBOX_TOKEN = import.meta.env.MAPBOX_TOKEN;
```

### Token Restrictions

In Mapbox dashboard, restrict token usage:
1. Add URL restrictions (e.g., only your domain)
2. Set token expiration date
3. Limit API endpoints (only enable what you use)
4. Use separate tokens for dev/staging/production

## Resources

- **Mapbox GL JS Docs**: [https://docs.mapbox.com/mapbox-gl-js/api/](https://docs.mapbox.com/mapbox-gl-js/api/)
- **Directions API**: [https://docs.mapbox.com/api/navigation/directions/](https://docs.mapbox.com/api/navigation/directions/)
- **Geocoding API**: [https://docs.mapbox.com/api/search/geocoding/](https://docs.mapbox.com/api/search/geocoding/)
- **Examples**: [https://docs.mapbox.com/mapbox-gl-js/example/](https://docs.mapbox.com/mapbox-gl-js/example/)

## Support

If you encounter issues:
1. Check this guide first
2. Review browser console for error messages
3. Verify Mapbox account status and API limits
4. Test with the fallback map to isolate issues

---

**Ready to go!** Add your Mapbox token and enjoy real-time hazard tracking with navigation. 🗺️🚗
