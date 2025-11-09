# Live Navigation Map Screen Guide

## Overview

The Live Navigation Map Screen is a full-screen, immersive navigation experience that provides real-time hazard detection and proximity alerts during navigation. It's activated from the Safety Scout screen when you plan a route and tap "Go".

## Features

### 1. Full-Screen Navigation Experience
- **Dark Map Theme**: High-contrast dark theme (Mapbox Dark v11) for optimal visibility
- **3D Perspective**: 60-degree pitch for a realistic navigation view
- **Real-time Position**: Vehicle marker follows your actual GPS location
- **Route Display**: VW Blue (#0070E1) route line from start to destination

### 2. Comprehensive Hazard Display
All hazards are displayed with distinct shapes and colors:

**Shapes (by Source):**
- **Square**: V2X Hazards (official Car2X infrastructure alerts)
- **Circle**: Hazards detected by Your Car's sensors
- **Triangle**: Hazards detected by Other Network Cars

**Colors (by Severity):**
- **Red**: Critical/High severity hazards
- **Amber**: Medium severity hazards
- **Yellow**: Low severity hazards

**Special Indicators:**
- Hazards on your planned route show a red pulsing indicator
- Hazards within 500m show pulse animation
- All active hazards in the area are visible (5-10km radius)

### 3. Real-Time Proximity Alerts
When you approach a hazard (within 500m-1km):
- **Alert Overlay**: Full-width banner appears at bottom of screen
- **Severity Color**: Background matches hazard severity (red/amber/yellow)
- **Information Displayed**:
  - Hazard type (e.g., "ALERT: POTHOLE")
  - Distance ahead (e.g., "300m ahead")
  - Location name
  - Severity level
  - Source icon (V2X/Your Car/Network)

### 4. Navigation Controls & Info

**Top Bar:**
- **End Navigation Button**: Tap "X" to stop navigation and return to map
- **Current Street**: Shows your current street name
- **Destination**: Displays where you're navigating to
- **Hazard Count**: Badge showing number of hazards on route

**Bottom Bar:**
- **ETA**: Estimated time to arrival
- **Distance**: Total distance remaining
- **Hazard Count**: Number of hazards along your route

**Map Legend (Top Right):**
- Critical (Red square)
- High (Amber square)
- Medium (Yellow square)

## How to Use

### Starting Live Navigation

1. Open the **Safety Scout** screen (Scout tab in bottom navigation)
2. In the map search panel at the top:
   - **Start Location**: Tap "Use Current Location" or search for a location
   - **Destination**: Enter or search for your destination
3. Tap the **"Go"** button
4. The Live Navigation Map Screen will launch automatically

### During Navigation

1. **Follow Your Route**: The blue line shows your planned path
2. **Watch for Hazard Alerts**: 
   - Hazards on route have red pulsing indicators
   - Proximity alerts appear automatically when approaching hazards
3. **Monitor Your Progress**:
   - Check ETA and distance in bottom bar
   - Current street name updates in real-time
4. **Real-time Updates**:
   - Your vehicle position updates continuously
   - New hazards detected by the network appear immediately

### Ending Navigation

- Tap the **"End"** button (top-left with X icon)
- Returns you to the Safety Scout screen
- Navigation toast notification confirms navigation ended

## Technical Details

### Proximity Alert System
- **500m Trigger**: Alert overlay appears when within 500m of a hazard
- **1km Detection**: Hazards within 1km are tracked for upcoming alerts
- **Prioritization**: Shows closest, highest-severity hazard first
- **Smart Warnings**: Each hazard triggers only once per approach

### Route Hazard Detection
- **100m Buffer**: Hazards within 100m of route line are marked as "on route"
- **Live Updates**: Route re-calculates if you deviate significantly
- **Hazard Filtering**: Only active hazards are shown; resolved hazards are hidden

### Real-Time Location Updates
- **GPS Tracking**: Uses device GPS with high accuracy mode
- **Position Updates**: 1-5 second intervals for smooth movement
- **Map Following**: Map automatically follows your position
- **Street Name Updates**: Reverse geocoding updates every 10 seconds

## Integration with Hazard System

The Live Navigation screen integrates with the Hazard Scout ecosystem:
- **Active Hazards Only**: Shows hazards with status 'active' or 'resolving'
- **Network Sharing**: All drivers' hazards are visible in real-time
- **Source Tracking**: Distinguishes V2X, your car, and network sources
- **Severity Levels**: Respects high/medium/low severity classifications

## Best Practices

1. **Enable Location Services**: Ensure GPS is enabled for accurate positioning
2. **Network Connection**: Requires internet for map tiles and geocoding
3. **Valid Mapbox Token**: Make sure your Mapbox token is configured
4. **Battery Consideration**: GPS tracking uses battery; charge during long trips
5. **Safe Driving**: Glance at alerts; don't interact with phone while moving

## Map Token Setup

The Live Navigation screen requires a valid Mapbox token:
1. Get your token at: https://account.mapbox.com/access-tokens/
2. Update `MAPBOX_TOKEN` in `/components/LiveNavigationMapScreen.tsx`
3. Token is already configured in current implementation

## Troubleshooting

**Map doesn't load:**
- Check internet connection
- Verify Mapbox token is valid
- Check browser console for errors

**Location not updating:**
- Enable location services in browser
- Grant location permission when prompted
- Check if GPS is available on device

**Hazards not showing:**
- Ensure hazards exist in the area
- Check if hazards are active (not resolved)
- Verify you're on the Scout screen tab

**Route not calculating:**
- Verify both start and destination are selected
- Check internet connection for Mapbox API
- Ensure locations are accessible by road

## Future Enhancements

Potential future features:
- Voice navigation prompts
- Turn-by-turn directions
- Traffic layer integration
- Alternative route suggestions
- Hazard avoidance routing
- Offline map caching
- Multi-waypoint routing
- Share ETA with contacts
