# Live Navigation Testing Checklist

## Quick Test Steps

### 1. Access the Safety Scout Screen
1. Open the Hazard Scout app
2. Navigate to the "Scout" tab in bottom navigation
3. Verify you see the "Live Hazard Map" screen with map displayed

### 2. Plan a Route
1. **Set Start Location:**
   - Option A: Click "Use Current Location" button (location icon)
   - Option B: Type a location in "Start location" field
   - Wait for autocomplete suggestions
   - Select a suggestion from dropdown

2. **Set Destination:**
   - Type a destination in "Destination" field
   - Wait for autocomplete suggestions
   - Select a suggestion from dropdown

3. **Start Navigation:**
   - Click the blue **"Go"** button
   - Wait for route calculation (should be instant)

### 3. Verify Live Navigation Screen Opens

**Screen Should Display:**
- ✅ Full-screen dark map (Mapbox Dark v11)
- ✅ Blue route line from start to destination
- ✅ Vehicle marker (blue circle with arrow) at current location
- ✅ Destination marker (blue circle at end of route)
- ✅ All hazard markers with correct shapes and colors

**Top Bar Should Show:**
- ✅ "End" button with X icon (top-left)
- ✅ Current street name (center)
- ✅ Destination name
- ✅ Hazard count badge (if hazards on route)

**Bottom Bar Should Show:**
- ✅ ETA (time to arrival)
- ✅ Distance remaining
- ✅ Hazard count on route

**Map Legend (Top-Right):**
- ✅ Critical (Red)
- ✅ High (Amber)
- ✅ Medium (Yellow)

### 4. Test Hazard Markers

**Verify Marker Shapes:**
- ✅ **Squares** = V2X hazards (look for source: 'v2x')
- ✅ **Circles** = Your car hazards (look for source: 'your-car')
- ✅ **Triangles** = Network hazards (look for source: 'network')

**Verify Marker Colors:**
- ✅ **Red** = High severity
- ✅ **Amber** = Medium severity
- ✅ **Yellow** = Low severity

**Special Indicators:**
- ✅ Hazards on route have red pulsing indicator in top-right corner
- ✅ Nearby hazards (< 500m) have pulse animation

### 5. Test Proximity Alerts

**Simulate Approaching a Hazard:**
1. If a hazard exists within 1km of route, you should see:
   - Alert overlay appears at bottom of screen
   - Background color matches hazard severity
   - Shows hazard type, distance, and location
   - Shows severity level and source icon

2. Alert should:
   - ✅ Show only the closest hazard
   - ✅ Update distance in real-time
   - ✅ Disappear when you pass the hazard
   - ✅ Show toast warning when within 500m (first time only)

### 6. Test Real-Time Position Updates

**If GPS is available:**
- ✅ Vehicle marker moves smoothly
- ✅ Map follows your position
- ✅ Current street name updates
- ✅ Distance/ETA updates

**If GPS is not available:**
- ✅ Vehicle stays at start location
- ✅ Map still shows route and hazards
- ✅ Navigation info still visible

### 7. Test End Navigation

1. Click **"End"** button (top-left)
2. Verify:
   - ✅ Returns to Safety Scout screen
   - ✅ Toast message: "Navigation ended"
   - ✅ Map returns to normal view
   - ✅ Navigation info cleared

### 8. Edge Cases to Test

**No Hazards on Route:**
- ✅ Map still displays
- ✅ Route shown in blue
- ✅ No proximity alerts appear
- ✅ Hazard count shows "0"

**Multiple Hazards on Route:**
- ✅ All hazards show red pulsing indicators
- ✅ Count badge shows correct number
- ✅ Proximity alert shows closest one

**Location Permission Denied:**
- ✅ App uses default/entered start location
- ✅ Map still loads
- ✅ Navigation still works (static position)

**No Internet Connection:**
- ✅ Map tiles may fail to load
- ✅ Route calculation will fail
- ✅ Error toast appears

## Common Issues & Solutions

### Map Not Loading
**Problem:** Black screen or no map tiles
**Solution:** 
- Check Mapbox token in `/components/LiveNavigationMapScreen.tsx`
- Verify internet connection
- Check browser console for errors

### Route Not Calculating
**Problem:** "Go" button doesn't start navigation
**Solution:**
- Ensure both start and destination are selected
- Check that Mapbox token is valid
- Verify internet connection
- Check browser console for API errors

### GPS Not Working
**Problem:** Vehicle marker doesn't move
**Solution:**
- Grant location permission in browser
- Enable GPS on device
- Try "Use Current Location" button
- Check if HTTPS is enabled (required for GPS)

### Hazards Not Showing
**Problem:** No hazard markers on map
**Solution:**
- Go back to Scout screen
- Verify hazards exist in hazard list
- Check if hazards are active (not resolved)
- Ensure you're looking at the right area

### Proximity Alert Not Appearing
**Problem:** No alert when approaching hazard
**Solution:**
- Verify hazard is within 1km
- Check that hazard is on your route (red indicator)
- Ensure you haven't already passed it
- Check if you've already been warned (only warns once per hazard)

## Test Data

### Sample Test Routes

**Short Route (for quick testing):**
- Start: "Connaught Place, New Delhi"
- Destination: "India Gate, New Delhi"
- Expected: ~3km, ~10min

**Medium Route (with hazards):**
- Start: "Indira Gandhi Airport, Delhi"
- Destination: "Qutub Minar, Delhi"
- Expected: ~15km, ~30min

**Custom Route:**
- Use your actual current location
- Pick a familiar destination
- Check for hazards you know exist

### Creating Test Hazards

If no hazards exist in your test area:
1. Go to Scout screen
2. Scroll down to hazard list
3. The app has demo hazards pre-loaded
4. Or add custom hazards via HazardService

## Performance Checks

**Map Performance:**
- ✅ Map loads within 2-3 seconds
- ✅ Zoom/pan is smooth (60fps)
- ✅ Markers render without lag
- ✅ Route animates smoothly

**Real-Time Updates:**
- ✅ Position updates every 1-5 seconds
- ✅ No jitter in vehicle movement
- ✅ Street name updates every ~10 seconds
- ✅ Proximity alerts appear instantly

**Memory Usage:**
- ✅ No memory leaks on long navigation
- ✅ Markers properly cleaned up
- ✅ Map resources released on exit

## Browser Compatibility

**Recommended:**
- ✅ Chrome 90+ (best performance)
- ✅ Safari 14+ (iOS/macOS)
- ✅ Edge 90+
- ✅ Firefox 88+

**Mobile:**
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

## Accessibility Checks

- ✅ High contrast in dark mode
- ✅ Large touch targets (44x44px minimum)
- ✅ Clear text labels
- ✅ Color not sole indicator (shapes + colors)

## Success Criteria

All these should work:
- ✅ Navigation starts from Scout screen
- ✅ Full-screen map displays correctly
- ✅ Route shown in VW blue color
- ✅ All hazards visible with correct shapes/colors
- ✅ Hazards on route highlighted with red indicator
- ✅ Proximity alerts appear when approaching hazards
- ✅ Real-time position updates (if GPS available)
- ✅ Navigation info (ETA, distance, hazards) updates
- ✅ End navigation returns to Scout screen
- ✅ No console errors or warnings
- ✅ Smooth performance on target devices

## Reporting Issues

If you find issues:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Take screenshots if applicable
4. Note browser/device info
5. Check if Mapbox token is valid
6. Verify internet connection was stable
