# Quick Start: Testing Hazard Resolution Workflow

## 🚀 Getting Started in 5 Minutes

### Step 1: Launch the App
1. Open the Hazard Scout application
2. Log in (if not already logged in)
3. You'll see the Dashboard with sample hazards pre-loaded

### Step 2: View Active Hazards
1. Look for the **red/amber hazard banner** on the Dashboard
   - Shows the nearest high-priority hazard
   - Displays confirmation count (👍) and time detected
   
2. Tap the banner OR navigate to **Scout** tab (🛡️ icon)
   - See the live hazard map with colored markers
   - Red = High severity, Amber = Medium, Blue = Low
   - Pulsing markers = Resolving status

### Step 3: Interact with a Hazard

1. **Tap any hazard marker** on the map
   - Detailed card pops up from bottom
   - Shows full hazard information

2. **Review Hazard Details**:
   ```
   🚗 Pothole - HIGH - ACTIVE
   Connaught Place, Ring Road
   300m ahead • 2 hours ago
   
   Statistics:
   Detected: 3x | Confirmed: 5 | Reported Gone: 1
   ```

3. **Take Action**:
   - Tap **"Still There" ✓** if you see the hazard
   - Tap **"Hazard Gone" ✗** if it's been fixed
   - See toast notification confirming your action

### Step 4: Watch Resolution Progress

1. **Find a "Resolving" Hazard**:
   - Look for amber clock icon (⏰)
   - Or press "Hazard Gone" on an active hazard 3 times (from different browsers/incognito)

2. **View Progress Bar**:
   ```
   ⏰ Pending Resolution
   ▓▓▓▓▓░░░░░ 2/3 reports
   Auto-resolves in 18h 23m without confirmation
   ```

3. **Complete Resolution**:
   - Get 3 "gone" reports, OR
   - Wait for auto-resolve timer to expire
   - Hazard moves to "Recently Resolved" section

### Step 5: Test Cooldown Protection

1. Confirm a hazard: Tap **"Still There"**
2. Try confirming again immediately
3. See toast: "You've already confirmed this hazard recently"
4. Wait 1 hour OR open in new incognito window to bypass

### Step 6: Configure Settings

1. Tap ⚙️ **Settings** icon on Scout screen
2. Scroll to **"Hazard Resolution"** section
3. Try different configurations:
   - Toggle **Auto-Resolution** off/on
   - Change **Auto-Resolve After** (6h → 72h)
   - Adjust **Reports to Resolve** (1 → 10)
   - Toggle **Show Resolved Hazards**

## 🧪 Test Scenarios

### Scenario A: Quick Hazard Resolution
**Goal**: Resolve a hazard with user reports

1. Open Scout screen
2. Select any hazard (e.g., "Pothole")
3. Report "Hazard Gone" from 3 different browsers/devices:
   - Browser 1: Normal window
   - Browser 2: Incognito window
   - Browser 3: Different browser
4. ✅ **Expected**: Hazard resolves immediately, moves to resolved list

### Scenario B: Hazard Extension
**Goal**: Keep a hazard active with confirmations

1. Go to Settings → Hazard Resolution
2. Set **Auto-Resolve After** to 6 hours
3. Find an active hazard
4. Confirm **"Still There"**
5. Wait 7 hours (or manually change `lastConfirmedAt` in localStorage)
6. Confirm **"Still There"** again
7. ✅ **Expected**: Hazard stays active, timer extends by 12 hours

### Scenario C: Time-Based Auto-Resolution
**Goal**: Let a hazard auto-resolve from time

1. Create a new hazard (or use existing)
2. Go to Settings → Set **Auto-Resolve After** to 6 hours
3. Wait 6 hours (or manually change timestamps in localStorage)
4. Refresh the page
5. ✅ **Expected**: Hazard status changes to "Resolving"
6. Report "Gone" once more
7. ✅ **Expected**: Hazard resolves completely

### Scenario D: Competing Reports
**Goal**: Test still-there vs. gone conflict

1. Select a hazard
2. Incognito Window 1: Report **"Still There"**
3. Incognito Window 2: Report **"Hazard Gone"**
4. Incognito Window 3: Report **"Still There"**
5. ✅ **Expected**: Hazard stays active (confirmations extend lifetime)

### Scenario E: Dashboard Integration
**Goal**: Verify dashboard shows nearest hazard

1. Go to Dashboard
2. Check hazard banner at top
3. Note the hazard shown
4. Resolve that hazard (3 "gone" reports)
5. ✅ **Expected**: Banner updates to show next nearest hazard OR disappears if none

## 🔧 Manual Testing Tools

### Check LocalStorage
Open browser DevTools → Application → LocalStorage:

```javascript
// View all hazards
JSON.parse(localStorage.getItem('hazard-scout-hazards'))

// View settings
JSON.parse(localStorage.getItem('hazard-scout-service-settings'))

// View device ID
localStorage.getItem('hazard-scout-device-id')

// Clear everything (reset)
localStorage.clear()
```

### Manually Trigger Resolution
In browser console:

```javascript
// Import service (if exposed globally)
const service = hazardService;

// Force resolve a hazard
service.manuallyResolveHazard('hazard-id-here');

// Check time until auto-resolve
service.getTimeUntilAutoResolve('hazard-id-here');

// Get resolution progress
service.getResolutionProgress('hazard-id-here');

// Get all active hazards
service.getActiveHazards();
```

### Simulate Time Passing
Edit hazard timestamps in localStorage:

```javascript
// Get hazards
let hazards = JSON.parse(localStorage.getItem('hazard-scout-hazards'));

// Age a hazard by 25 hours
hazards[0].lastConfirmedAt = Date.now() - (25 * 60 * 60 * 1000);

// Save back
localStorage.setItem('hazard-scout-hazards', JSON.stringify(hazards));

// Reload page
location.reload();
```

## ✅ Verification Checklist

After testing, verify these work:

- [ ] Dashboard shows nearest high-priority hazard
- [ ] Scout screen displays all active hazards on map
- [ ] Clicking hazard opens detail card
- [ ] "Still There" button works and shows toast
- [ ] "Hazard Gone" button works and shows progress
- [ ] Can't spam confirmations (1-hour cooldown)
- [ ] Progress bar shows correct reports (X/3)
- [ ] Time countdown displays for resolving hazards
- [ ] Hazards resolve after threshold reports
- [ ] Resolved hazards appear in separate section
- [ ] Settings allow configuration changes
- [ ] Auto-resolution can be toggled off
- [ ] Changed settings persist after refresh
- [ ] Multiple browser windows work independently
- [ ] Statistics display correctly (detection count, confirmations)

## 🐛 Known Limitations

### In Current Implementation:
1. **No Backend**: All data stored in browser localStorage
   - Won't sync across devices
   - Cleared when cache cleared
   
2. **No Real GPS**: Hazard distances are mock values
   - In production, would calculate from actual location
   
3. **Sample Data**: Pre-loaded hazards are fictional
   - Real app would detect hazards via sensors
   
4. **No Photo Upload**: Can't attach images yet
   - Planned for Phase 3
   
5. **No User Auth**: Device ID instead of user ID
   - In production, would use authenticated user accounts

## 🎯 Success Indicators

You'll know it's working when:

✅ Multiple hazards visible on map with different colors/states  
✅ Can interact with any hazard and see immediate feedback  
✅ Confirmation counts increment correctly  
✅ Resolving hazards show progress bars  
✅ Resolved hazards appear in separate grayed-out section  
✅ Dashboard banner updates when hazards change  
✅ Settings modifications affect resolution behavior  
✅ Toast messages appear for all actions  
✅ Can't spam confirmations (cooldown enforced)  
✅ Data persists after page refresh  

## 💡 Pro Tips

1. **Use Incognito Mode**: To simulate multiple users
2. **Check Console**: For debug logs about resolution
3. **Modify Timestamps**: In localStorage to speed up testing
4. **Clear Storage**: To reset and test initialization
5. **Test Mobile**: Responsive design works on small screens
6. **Try Dark/Light Mode**: If theme switcher implemented

## 📞 Need Help?

1. **Check Implementation Summary**: `/IMPLEMENTATION_SUMMARY.md`
2. **Read Full Guide**: `/HAZARD_RESOLUTION_GUIDE.md`
3. **Review Code**: `/components/HazardService.ts` has extensive comments
4. **Check Notifications**: `/NOTIFICATIONS_GUIDE.md` for alert integration

---

**Happy Testing! 🚗💨**

Remember: The goal is a **living, self-maintaining hazard map** that stays accurate through community verification and time-based cleanup. Every confirmation matters! 🛡️
