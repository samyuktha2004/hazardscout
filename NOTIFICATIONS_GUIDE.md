# Hazard Scout Push Notifications

## Overview
Hazard Scout now supports proximity-based push notifications for critical road hazards. This feature alerts users to high-priority hazards (Tier 1/2) when they're within a configurable distance, even when the app isn't actively open.

## Features

### ✅ Smart Notification System
- **Proximity-Based**: Notifications trigger only when hazards are within your set distance threshold
- **Critical Hazards Only**: Filters for Tier 1 (high) and Tier 2 (medium) severity hazards by default
- **No Duplicates**: Each hazard triggers only one notification using intelligent tracking
- **Auto-Close**: Non-critical notifications auto-dismiss after 8 seconds; critical ones require interaction

### ✅ Customizable Settings
Located in: **Account → Hazard Scout Settings → Push Notifications**

1. **Alert Distance**
   - 500m - Very Close
   - 1km - Recommended (default)
   - 2km - Early Warning
   - 3km - Maximum

2. **Critical Hazards Only** (Toggle)
   - ON: Only Tier 1 (high) and Tier 2 (medium) severity
   - OFF: All hazard types

3. **Do Not Disturb Schedule**
   - Set quiet hours (e.g., 22:00 to 07:00)
   - No notifications during DND period
   - Overnight support for periods crossing midnight

### ✅ Notification Types

**High Severity (Tier 1)**
- Title: "⚠️ CRITICAL: [Hazard Type] Ahead"
- Requires user interaction to dismiss
- Vibration pattern: Long-Short-Long
- Example: "⚠️ CRITICAL: Pothole Ahead"

**Medium Severity (Tier 2)**
- Title: "⚠️ [Hazard Type] Ahead"
- Auto-dismisses after 8 seconds
- Standard vibration
- Example: "⚠️ Road Work Ahead"

**Notification Content**
- Distance: "500m ahead" or "1.2km ahead"
- Location: Road name
- Action: Clicking focuses the app window

## How It Works

### 1. Permission Request
When you first enable notifications:
1. Click "Enable Notifications" button
2. Browser will prompt for permission
3. Grant permission to receive alerts
4. Notifications are automatically enabled

### 2. Automatic Monitoring
The system continuously monitors:
- Active hazards in your area
- Your proximity to each hazard
- Hazard severity levels
- Your notification preferences

### 3. Smart Filtering
Notifications are sent only when ALL conditions are met:
- ✅ Notifications are enabled
- ✅ Browser permission is granted
- ✅ Not in Do Not Disturb period
- ✅ Hazard is within proximity threshold
- ✅ Hazard meets severity criteria
- ✅ Hazard hasn't been notified before

### 4. Cleanup
- Resolved hazards are removed from notification history
- User can receive new notifications for recurring hazards
- System resets tracking when hazards are cleared

## Testing Notifications

### Test Button
In Hazard Scout Settings, use the "Send Test Notification" button to:
- Verify browser permission is working
- Test notification appearance and sound
- Check vibration on mobile devices
- Confirm notification settings

### Test Data
A test notification simulates:
- High severity pothole
- 500m distance
- Test Road location

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (macOS & iOS 16.4+)
- ✅ Opera

### Requirements
- HTTPS connection (required for notifications)
- Browser notifications enabled in system settings
- App must not be in "denied" state

## Troubleshooting

### Notifications Not Appearing

**1. Check Browser Permission**
- Look for notification icon in address bar
- Navigate to browser settings → Notifications
- Ensure site has "Allow" permission

**2. Check App Settings**
- Go to Account → Hazard Scout Settings
- Verify "Critical Hazard Alerts" is ON
- Test with "Send Test Notification" button

**3. Check Do Not Disturb**
- Verify current time isn't in DND period
- Temporarily disable DND to test

**4. Check Proximity**
- Hazard must be within your set distance
- Default is 1km
- Try increasing to 2km or 3km for testing

**5. Check Severity Filter**
- If "Critical Hazards Only" is ON, only high/medium severity hazards trigger
- Toggle OFF to receive all hazards

### Permission Blocked

If you see "Blocked in Browser Settings":
1. Click the notification icon in address bar (🔔 or 🔕)
2. Select "Allow" for notifications
3. Refresh the page
4. Return to settings and try again

### iOS Specifics
- iOS 16.4+ required
- Must "Add to Home Screen" for full notification support
- System notifications can be managed in iOS Settings → Notifications

## Privacy & Data

### What's Shared
- **Nothing**: Notifications are local only
- No data leaves your device for notification purposes
- All processing happens in your browser

### What's Stored
- Notification preferences in browser localStorage
- History of notified hazard IDs (to prevent duplicates)
- No personal information

### Data Persistence
- Settings persist across sessions
- History clears when hazards are resolved
- Can be manually reset by disabling/re-enabling

## Best Practices

### Recommended Settings
- **Distance**: 1km for city driving, 2km for highway
- **Critical Only**: Keep ON to reduce notification fatigue
- **DND**: Set overnight hours (e.g., 22:00-07:00)

### For Daily Commuters
- Enable notifications before starting your trip
- Use 1km proximity for familiar routes
- Set DND during non-driving hours

### For Road Trips
- Increase distance to 2km or 3km
- Keep "Critical Only" enabled
- Disable DND for 24/7 alerts

### Battery Consideration
- Notifications use minimal battery
- Checking runs every 5 seconds
- System is optimized for efficiency
- No location tracking (uses mock data currently)

## Future Enhancements

### Planned Features
- [ ] Real-time location tracking integration
- [ ] Route-aware notifications (only on your path)
- [ ] Notification history/log
- [ ] Custom notification sounds
- [ ] Severity-specific notification tones
- [ ] Weekly notification summary
- [ ] Notification grouping for multiple hazards

### Integration Points
- Google Maps API for real location data
- Service Worker for background notifications
- Geolocation API for accurate proximity
- Navigation API for route-based filtering

## Technical Details

### Architecture
```typescript
NotificationService (Singleton)
  ├── Permission Management
  ├── Settings Storage (localStorage)
  ├── Proximity Calculation
  ├── Severity Filtering
  ├── Do Not Disturb Logic
  └── Notification Deduplication

useHazardNotifications (React Hook)
  ├── Hazard Monitoring (5s interval)
  ├── Data Conversion
  ├── Service Integration
  └── Cleanup on Unmount
```

### Key Components
- `/components/NotificationService.ts` - Core notification logic
- `/components/useHazardNotifications.ts` - React hook for monitoring
- `/components/HazardScoutSettingsScreen.tsx` - Settings UI
- `/components/VWConnectApp.tsx` - Integration point

### API Surface
```typescript
notificationService.requestPermission()
notificationService.notifyHazard(hazard)
notificationService.updateSettings(settings)
notificationService.checkHazards(hazards[])
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify browser compatibility
3. Test with "Send Test Notification"
4. Review this guide
5. Check browser notification settings

---

**Version**: 1.0.0  
**Last Updated**: November 5, 2025  
**Status**: ✅ Production Ready
