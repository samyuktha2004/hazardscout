# Google Maps Integration Setup

This application uses Google Maps JavaScript API to display real-time hazard locations on an interactive map.

## Quick Setup

### 1. Get a Google Maps API Key

1. Visit the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for Maps API, but includes $200 free monthly credit)
4. Enable the following APIs:
   - **Maps JavaScript API** (required)
   - **Marker Library** (included with Maps JavaScript API)
   - **Geometry API** (optional, for distance calculations)
5. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy your API key

### 2. Configure the API Key

Open `/components/GoogleMapComponent.tsx` and find line ~115:

```typescript
const API_KEY = "YOUR_API_KEY_HERE";
```

Replace `YOUR_API_KEY_HERE` with your actual API key:

```typescript
const API_KEY = "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q";
```

The app will automatically detect when you need to set up your API key and show you a helpful setup guide.

### 3. Secure Your API Key (Production)

For production use, add restrictions to your API key:

1. **Application restrictions:**
   - Set HTTP referrers (websites)
   - Add your domain (e.g., `yourdomain.com/*`)

2. **API restrictions:**
   - Restrict key to only "Maps JavaScript API"

### 4. Update Map Center (Optional)

The map is currently centered on San Francisco. To change the location, edit the `centerPosition` in `/components/GoogleMapComponent.tsx`:

```typescript
const centerPosition = { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE };
```

### 5. Customize Hazards (Optional)

Sample hazards are hardcoded in the `hazards` array. In production, replace this with data from your backend:

```typescript
const hazards: Hazard[] = [
  { id: "1", lat: 37.7749, lng: -122.4194, severity: "high", type: "Pothole" },
  // Add more hazards from your API
];
```

## Features

- **Dark Mode Styling**: Custom map styles for dark theme
- **Real-time Markers**: Vehicle position and hazard locations using custom overlays
- **Interactive Hazards**: Click on hazards to view details
- **Route Display**: Blue polyline showing the active route
- **Severity Indicators**: Color-coded markers (red = high, amber = medium)
- **Modern API**: Uses custom overlays instead of deprecated Marker API
- **Automatic Setup Detection**: Shows helpful setup guide when API key is not configured

## Pricing

Google Maps Platform includes a **$200 monthly credit**, which covers:
- ~28,000 map loads per month
- Most development and small production deployments

For high-traffic applications, review [Google Maps Pricing](https://developers.google.com/maps/billing-and-pricing/pricing).

## Troubleshooting

### Map not loading?
1. Check browser console for errors
2. Verify your API key is correct
3. Ensure Maps JavaScript API is enabled in Google Cloud Console
4. Check for quota/billing issues

### "This page can't load Google Maps correctly"?
- Your API key may be restricted or invalid
- Billing may not be enabled on your Google Cloud project

### Markers not appearing?
- Check that hazard coordinates are valid
- Ensure the map zoom level shows the hazard locations
- Verify custom overlay code is executing

## API Documentation

- [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Custom Markers](https://developers.google.com/maps/documentation/javascript/custom-markers)
- [Map Styling](https://developers.google.com/maps/documentation/javascript/styling)
