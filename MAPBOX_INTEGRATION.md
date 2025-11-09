# Mapbox Live Map Integration Guide

## Overview
The Hazard Scout app now features interactive Mapbox GL maps integrated into both the Dashboard widget and the full-screen Safety Scout hub.

## Features Implemented

### 1. Custom Map Marker Icons (`/components/MapMarkerIcons.tsx`)

**Critical Hazard Marker (Tier 1/V2X)**
- Bold red diamond shape with exclamation mark
- Pulsing animation for high visibility
- Used for high-severity hazards requiring immediate attention

**High Hazard Marker (Tier 2/Pothole)**
- Orange hexagon with pothole graphic
- Distinct warning pattern inside
- Used for medium-severity hazards

**V2X/Official Marker**
- VW Blue pin-shaped marker
- Shield symbol indicating authenticated V2X data
- Shows official VW Car2X network hazards

**Medium Hazard Marker**
- Blue circle with warning triangle
- Used for low-severity alerts

**Vehicle Marker**
- VW Blue circle with directional arrow
- Pulsing animation showing active location
- White border for contrast against dark map

### 2. Dashboard Map Widget

**Location:** Dashboard Screen → "Live Hazard Map" Card

**Features:**
- Compact map view showing nearby hazards (up to 5)
- Non-interactive (disabled scrolling/zooming for clean widget experience)
- Vehicle position at center
- Real-time hazard count display
- **Fully clickable card** navigates to Safety Scout hub

**Implementation:**
```tsx
<MapboxMap 
  hazards={hazards.slice(0, 5)} 
  viewMode="widget"
  className="w-full h-full"
/>
```

### 3. Full-Screen Safety Scout Map

**Location:** Safety Scout Screen → Top 2/3 of screen

**Features:**
- Full interactive map with dark theme (`mapbox://styles/mapbox/dark-v11`)
- 3D tilt (45° pitch) for enhanced depth perception
- Shows all active hazards within 10km radius
- Interactive marker system
- Navigation controls (zoom, rotate)
- Real-time vehicle position updates

**Marker Interactivity:**
- **Tap any hazard marker** → Opens info card overlay at bottom
- Info card shows:
  - Hazard type and severity
  - Distance from vehicle
  - Last reported time
  - Source (Scout Network, VW Car2X, etc.)
  - Detection/confirmation statistics
  - Resolution progress (if resolving)
  
**Resolution Actions:**
- "Still There" button (green) - Confirms hazard, extends alert
- "Hazard Gone" button (red) - Reports resolution, requires 3 reports to resolve
- Cooldown protection (1 hour between confirmations)

**Map Legend:**
- Top-left overlay showing marker color meanings
- Critical (red), High (orange), V2X Official (blue)

### 4. Mapbox Configuration

**Token Setup:**
The app uses a placeholder Mapbox token. To enable real maps:

1. Sign up at [mapbox.com](https://www.mapbox.com)
2. Get your access token from your account
3. Replace the placeholder in `/components/MapboxMap.tsx`:
```tsx
const MAPBOX_TOKEN = 'YOUR_ACTUAL_MAPBOX_TOKEN_HERE';
```

**Fallback Mode:**
When Mapbox isn't available (no token or network issues), the app automatically shows a static fallback map:
- Grid pattern background
- Simulated road network
- Positioned hazard markers
- Distance circle indicators
- Fully functional marker interactions

### 5. Map Styling

**Dark Theme Consistency:**
- Map style: `mapbox://styles/mapbox/dark-v11`
- Matches VW Connect dark/neutral design system
- VW Blue (#0070E1) accent for vehicle marker
- High-contrast markers for visibility

**Responsive Design:**
- Widget mode: Smaller markers (w-4 h-4), static view
- Fullscreen mode: Larger markers (w-8 h-8), interactive
- Touch-optimized for mobile gestures
- Smooth transitions and animations

### 6. Data Integration

**Hazard Data Flow:**
```
HazardService → Active Hazards → MapboxMap → Markers + Interactions
```

**Each hazard includes:**
- Geographic coordinates (latitude/longitude)
- Severity level (high/medium/low)
- Source type (network/v2x/your-car/user-report)
- Status (active/resolving/resolved)
- Confirmation counts
- Distance from user

### 7. Performance Optimizations

- **Widget mode:** Shows max 5 hazards for fast rendering
- **Fullscreen mode:** Shows all active hazards with efficient marker management
- Markers recreated on hazard updates using refs
- Disabled interactions in widget mode reduces overhead
- Fallback to static map when needed

## Usage Examples

### Dashboard Widget Click Flow:
1. User sees "Live Hazard Map" card with mini-map
2. Taps anywhere on the card
3. Navigates to Safety Scout screen
4. Full interactive map loads with all hazards

### Hazard Marker Interaction:
1. User sees red pulsing marker on map
2. Taps the marker
3. Info card slides up from bottom
4. Shows "Pothole - 300m ahead - High Severity"
5. User taps "Hazard Gone" button
6. Toast confirms: "Report submitted. 2 more needed to resolve."
7. Card updates to show progress

### Map Navigation:
- **Pinch:** Zoom in/out
- **Drag:** Pan around map
- **Two-finger rotate:** Change bearing
- **Tap markers:** View hazard details
- **Legend:** Reference marker meanings

## Testing the Integration

### 1. Visual Test
- Dashboard shows mini-map with 3-5 hazard markers
- Safety Scout shows full map with all markers
- Markers use correct colors/shapes per severity
- Vehicle marker visible at center

### 2. Interaction Test
- Click dashboard map widget → Navigates to Safety Scout ✓
- Tap hazard marker → Info card appears ✓
- "Hazard Gone" button → Updates count ✓
- Close info card (×) → Card dismisses ✓

### 3. Data Test
- Add new hazard → Appears on map immediately
- Report hazard gone 3x → Marker disappears
- Confirm still there → Extends hazard lifetime

## Files Modified/Created

**New Files:**
- `/components/MapMarkerIcons.tsx` - SVG marker components
- `/components/MapboxMap.tsx` - Main Mapbox integration
- `/MAPBOX_INTEGRATION.md` - This guide

**Modified Files:**
- `/components/DashboardScreen.tsx` - Added map widget with MapboxMap
- `/components/SafetyScoutScreen.tsx` - Replaced placeholder with MapboxMap

## Design Compliance

✅ VW Connect dark/neutral theme maintained
✅ VW Blue (#0070E1) primary accent used consistently
✅ Inter font family preserved  
✅ High-contrast markers for accessibility
✅ Mobile-first responsive design
✅ Touch-optimized interactions
✅ Smooth animations and transitions

## Next Steps (Optional Enhancements)

1. **Real-time vehicle movement:** Integrate GPS to update vehicle position
2. **Route integration:** Show suggested routes avoiding hazards
3. **Cluster markers:** Group nearby hazards at low zoom levels
4. **Custom map styles:** Create VW-branded Mapbox style
5. **Offline maps:** Cache map tiles for offline use
6. **3D buildings:** Enable 3D building layer for urban navigation
7. **Traffic layer:** Overlay real-time traffic data

## Support

For Mapbox-specific questions, see:
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js)
- [React Integration Guide](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)

For Hazard Scout app questions, refer to:
- `/HAZARD_RESOLUTION_GUIDE.md` - Resolution workflow
- `/NOTIFICATIONS_GUIDE.md` - Push notification system
- `/QUICK_START_TESTING.md` - Testing scenarios
