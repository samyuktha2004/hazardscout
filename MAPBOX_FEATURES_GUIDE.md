# Hazard Scout - Real-Time Map Features Guide

## 🗺️ What's New

Your Hazard Scout app now includes a comprehensive real-time mapping system with Mapbox integration! Here's everything you can do:

## ✨ Key Features

### 1. **Live Hazard Detection & Mapping**
- Hazards are displayed on a real-time map at their exact GPS coordinates
- Color-coded markers show hazard severity:
  - 🔴 **Red**: High severity (critical hazards)
  - 🟠 **Amber/Orange**: Medium severity 
  - 🔵 **Blue**: Low severity
- Hazards within 500m of your location **pulse** to grab your attention
- Tap any hazard marker to view full details

### 2. **Turn-by-Turn Navigation** 🧭
- Navigate to any hazard with one tap
- Real-time route calculation and visualization
- See distance (km) and estimated time (minutes)
- Blue route line shows your path on the map
- Stop navigation anytime with the "X" button

**How to use:**
1. Tap a hazard marker or select from the list
2. In the detail card, tap the blue **"Navigate to Hazard"** button
3. Follow the blue route line on the map
4. Tap "X" on the navigation banner to cancel

### 3. **Proximity Warnings** ⚠️
- Automatic alerts when you're within 500m of a hazard
- Toast notifications appear at the top of your screen
- Shows hazard type, distance, and location
- "View" button to see full hazard details
- Warnings clear when you move 1km+ away

**Example:**
```
⚠️ Hazard Ahead: Pothole
325m ahead - Main Street & 5th Ave
[View]
```

### 4. **Real-Time Location Tracking** 📍
- Your position updates automatically as you move
- Blue vehicle marker shows where you are
- Map smoothly follows your movements
- Tap the location button (top-right) to recenter

### 5. **Interactive Map Controls**
Located in the top-right corner:
- **+ / -** buttons: Zoom in/out
- **Compass**: Reset map orientation
- **3D Tilt**: Drag to change viewing angle
- **Location**: Center map on your position

### 6. **Hazard Verification** ✅❌
When you view a hazard:
- **"Still There"** - Confirm the hazard exists (extends alert time)
- **"Hazard Gone"** - Report it's cleared (3 reports = resolved)
- Your feedback helps keep the map accurate for all drivers

### 7. **Dark Theme Map** 🌙
- Professional dark theme reduces eye strain
- High contrast markers for visibility
- VW Blue (#0070E1) accent color throughout
- Smooth animations and transitions

## 📱 User Flow

### Viewing Hazards:
```
1. Open app → Tap "Scout" tab
2. See live map with hazard markers
3. Tap any red/amber/blue marker
4. View hazard details in popup card
5. Choose action: Navigate, Verify, or Close
```

### Getting Directions:
```
1. Select a hazard (tap marker or list item)
2. Tap "Navigate to Hazard" button
3. Blue route appears on map
4. Follow route to destination
5. Tap "X" to stop navigation
```

### Responding to Warnings:
```
1. Drive normally with app open
2. Automatic warning when within 500m
3. "Hazard Ahead" toast appears
4. Tap "View" to see details
5. Adjust route if needed
```

## 🔧 Setup Required

**To enable all features, you must add a Mapbox token:**

1. Get free token at [mapbox.com/account](https://account.mapbox.com/)
2. Open `/components/MapboxMap.tsx`
3. Replace `'YOUR_MAPBOX_TOKEN_HERE'` with your actual token
4. Reload app to activate

**Without a token:** The app shows a simulated static map with limited features.

See `MAPBOX_SETUP_GUIDE.md` for detailed instructions.

## 📊 Live Status Indicators

### Legend (Top-Left)
- Shows hazard severity colors
- Displays V2X Official indicator
- Always visible for reference

### Status Badge (Bottom-Center)
- "Monitoring Active" - Hazard detection is on
- Shows count of active hazards nearby
- Green "Live" badge = real-time updates

### Navigation Banner (Top-Center - when active)
- Current destination
- Distance to hazard
- Estimated time
- Stop button

## 🎯 Best Practices

### For Drivers:
1. **Enable location** - Allow GPS access for accurate tracking
2. **Keep app open** - Proximity warnings need active screen
3. **Verify hazards** - Confirm or report as you drive past
4. **Use navigation** - Get directions to check suspicious hazards
5. **Update status** - Report when hazards are cleared

### For Safety:
1. **Don't interact while driving** - Have passengers use the app
2. **Voice navigation** - Listen to directions (coming soon)
3. **Pre-plan routes** - Check map before starting drive
4. **Alert position** - Proximity warnings give time to react
5. **Stay focused** - Map is a tool, not a distraction

## 🔄 Real-Time Updates

- Hazards refresh **every 10 seconds**
- Your location updates **continuously** (watchPosition)
- Proximity checks run **every 10 seconds**
- Navigation routes recalculate on **significant position change**

## 🌐 Network Requirements

- **Internet required** for Mapbox tiles and navigation
- **GPS required** for accurate position
- **Cellular data** - ~5-10 MB per hour of active use
- **Offline mode** - Fallback static map available

## 🎨 Visual Indicators

### Hazard Markers:
- **Solid circles** - Active hazards
- **Pulsing circles** - Hazards within 500m (nearby)
- **Clock icon** - Hazards being resolved (pending)
- **Check icon** - Recently resolved hazards

### Map Elements:
- **Blue vehicle icon** - Your current position
- **Blue route line** - Navigation path
- **Circular radar** - Your detection range

## 💡 Tips & Tricks

1. **Long-press a marker** - Quick preview without opening detail card (planned)
2. **Swipe list item** - Quick actions for hazards (planned)
3. **Filter by severity** - Show only high-priority hazards (in settings)
4. **Route alternatives** - Compare fastest vs. safest route (coming soon)
5. **Voice alerts** - Hands-free hazard warnings (coming soon)

## 🐛 Troubleshooting

### Map not loading?
- Check internet connection
- Verify Mapbox token is added
- Clear browser cache

### Location not working?
- Enable browser location permission
- Check device GPS is enabled
- Allow HTTPS access (required for geolocation)

### Hazards not showing?
- Ensure hazards have valid coordinates
- Check HazardService has data loaded
- Verify map is fully initialized

### Navigation not working?
- Confirm you have location access
- Check Mapbox token has Directions API enabled
- Verify internet connection

## 📈 Future Enhancements

Coming soon:
- **Voice navigation** - Audio turn-by-turn directions
- **Route optimization** - Avoid high-severity hazards
- **Crowd-sourced reporting** - Add new hazards from app
- **Offline maps** - Download areas for no-signal zones
- **Heat maps** - Visualize hazard density
- **Historical data** - See past hazard patterns
- **Traffic integration** - Real-time traffic conditions

## 🔗 Related Documentation

- `MAPBOX_SETUP_GUIDE.md` - Complete setup instructions
- `HAZARD_RESOLUTION_GUIDE.md` - Verification workflow details
- `NOTIFICATIONS_GUIDE.md` - Push notification setup

---

**Drive Safe! 🚗💨** The map updates in real-time to keep you informed of hazards ahead.
