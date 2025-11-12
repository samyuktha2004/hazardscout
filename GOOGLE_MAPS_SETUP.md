# Google Maps API Setup Guide

## Required APIs

Your Google Maps API key **AIzaSyDGc_buLD8ptLlbsMeEcLAuqa09nEjFwdE** needs these APIs enabled:

### 1. Maps JavaScript API
- **Required for**: Displaying the map
- **Enable at**: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com

### 2. Geocoding API
- **Required for**: Converting addresses to coordinates (manual navigation input)
- **Enable at**: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com

### 3. Directions API
- **Required for**: Calculating routes and turn-by-turn navigation
- **Enable at**: https://console.cloud.google.com/apis/library/directions-backend.googleapis.com

### 4. Geometry API (Optional but recommended)
- **Required for**: Distance calculations
- Usually enabled by default with Maps JavaScript API

## How to Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for each API listed above
5. Click on the API and click **Enable**

## Testing Your Setup

After enabling the APIs:

1. Open the browser console (F12)
2. Navigate to the Scout page
3. Look for these console messages:
   - "Google Maps API Key present: true" ✅
   - No errors about "API key not authorized" ✅
   - "Calculating directions from..." when you enter a destination ✅
   - "Directions calculated successfully" after routing ✅

## Common Issues

### Map Not Displaying
- **Issue**: Blank gray screen
- **Fix**: Enable Maps JavaScript API

### "Location not found" error
- **Issue**: Cannot search for addresses
- **Fix**: Enable Geocoding API

### No route shown after entering destination
- **Issue**: Blue line not appearing
- **Fix**: Enable Directions API
- **Check console**: Look for "Directions request failed" error

### API Key Restrictions
If you've restricted your API key by domain or IP:
- Add `localhost` and `127.0.0.1` to allowed referrers
- For production, add your deployment URL

## Current Configuration

- **API Key**: AIzaSyDGc_buLD8ptLlbsMeEcLAuqa09nEjFwdE
- **Stored in**: `.env` file as `VITE_GOOGLE_MAPS_API_KEY`
- **Used by**: GoogleMapWrapper component

## Debugging Steps

1. **Check .env file**:
   ```bash
   cat .env
   ```
   Should show: `VITE_GOOGLE_MAPS_API_KEY=AIzaSyDGc_buLD8ptLlbsMeEcLAuqa09nEjFwdE`

2. **Restart dev server** after any .env changes:
   ```bash
   npm run dev
   ```

3. **Open browser console** and check for:
   - API key loaded correctly
   - No 403 or 401 errors
   - Geocoding and Directions responses

## Features Testing Checklist

- [ ] Map displays correctly on Scout page
- [ ] Hazard markers appear on map (colored circles)
- [ ] Clicking hazard starts navigation
- [ ] "Current Location" input shows location (not "Getting location...")
- [ ] Entering address in "Destination" field works
- [ ] Clicking Go button or pressing Enter starts navigation
- [ ] Blue route line appears between start and destination
- [ ] "End Navigation" button returns to normal map view
- [ ] Hazards remain visible during navigation

## Support

If issues persist after enabling all APIs:
1. Check API key billing is enabled (Google requires it even for free tier)
2. Wait 2-5 minutes after enabling APIs for changes to propagate
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check Google Cloud Console for API usage/errors
