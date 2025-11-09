# Hazard Resolution Workflow Guide

## Overview

The Hazard Scout system implements a comprehensive hazard resolution workflow that combines **user confirmation** and **time-based auto-resolution** to maintain an accurate, living hazard map. This ensures that hazards don't vanish prematurely while also preventing stale alerts from cluttering the map.

## Key Features

### 1. **User Confirmation System**
Users can actively verify hazards through two actions:

#### ✅ "Still There" Confirmation
- **Purpose**: Extends the hazard's active lifetime
- **Effect**: 
  - Increases confirmation count
  - Updates `lastConfirmedAt` timestamp
  - Resets status from `resolving` back to `active`
  - Extends auto-resolution deadline by configured hours (default: 12 hours)
- **Cooldown**: Users can confirm once per hour per hazard
- **Use Case**: Driver passes by and sees the hazard still exists

#### ❌ "Hazard Gone" Report
- **Purpose**: Marks hazard for resolution
- **Effect**:
  - Increases `reportedGoneCount`
  - Changes status to `resolving`
  - When threshold is reached (default: 3 reports), hazard is resolved
- **Cooldown**: Users can report once per hour per hazard
- **Use Case**: Driver passes by and notices the hazard has been fixed or removed

### 2. **Time-Based Auto-Resolution**

Hazards automatically resolve based on time without new confirmations:

#### Default Thresholds
- **Standard Hazards**: 24 hours without confirmation
- **Road Work**: 48 hours (more persistent)
- **Critical Hazards**: 12 hours (faster cleanup)

#### Resolution Logic
```
If (time since last confirmation > auto-resolve threshold) AND 
   (user "gone" reports >= required confirmations):
   → Resolve hazard
```

#### Status Progression
1. **Active** - Recently detected or confirmed
2. **Resolving** - Time threshold exceeded or receiving "gone" reports
3. **Resolved** - Confirmed gone or time expired with sufficient reports

### 3. **Hazard Data Structure**

Each hazard tracks:

```typescript
{
  id: string;
  type: string; // "Pothole", "Road Work", "Debris", etc.
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'resolving' | 'resolved';
  
  // Timestamps
  firstDetectedAt: number;      // Initial detection
  lastConfirmedAt: number;      // Last "still there" or sensor detection
  lastUpdatedAt: number;        // Any update
  
  // User validation
  confirmationCount: number;    // "Still there" count
  reportedGoneCount: number;    // "Gone" report count
  confirmations: UserConfirmation[]; // Full history
  
  // Detection tracking
  detectionCount: number;       // Sensor re-detections
  source: 'network' | 'v2x' | 'your-car' | 'user-report';
  
  // Resolution config
  autoResolveAfterHours: number;
  requireConfirmationsForResolution: number;
}
```

## User Interface

### Safety Scout Screen

#### Interactive Hazard Cards
- **Active Hazards**: Green border, full details
- **Resolving Hazards**: Amber border with clock icon, shows progress
- **Resolved Hazards**: Grayed out in separate section

#### Confirmation Buttons
Each hazard card displays:
```
┌─────────────────────────────────────┐
│  🚗 Pothole - HIGH                  │
│  Connaught Place • 300m ahead       │
│  👍 5  👎 1  • 2 hours ago         │
│                                     │
│  ┌─────────┐  ┌──────────────┐    │
│  │ ✓ Still │  │  ✗ Hazard    │    │
│  │  There  │  │    Gone      │    │
│  └─────────┘  └──────────────┘    │
└─────────────────────────────────────┘
```

#### Resolution Progress (for resolving hazards)
```
⏰ Pending Resolution
▓▓▓▓▓░░░░░ 2/3 reports
Auto-resolves in 18h 23m without confirmation
```

### Dashboard Screen

Shows nearest high-priority hazard with:
- Confirmation count visualization
- Real-time status (Active/Resolving)
- Time since first detection
- Quick navigation to map view

### Settings Screen

#### Hazard Resolution Configuration
Users can customize:

1. **Auto-Resolution Toggle**
   - Enable/disable time-based resolution
   - Default: Enabled

2. **Auto-Resolve After**
   - 6 hours - Very Fast
   - 12 hours - Fast
   - **24 hours - Recommended** ✓
   - 48 hours - Conservative
   - 72 hours - Very Conservative

3. **Reports to Resolve**
   - 1 report - Quick
   - 2 reports - Fast
   - **3 reports - Recommended** ✓
   - 5 reports - Strict
   - 10 reports - Very Strict

4. **Show Resolved Hazards**
   - Toggle visibility of recently resolved hazards
   - Default: Off

## Resolution Scenarios

### Scenario 1: Quick Fix
```
1. Pothole detected at 9:00 AM
2. User A reports "gone" at 9:30 AM
3. User B reports "gone" at 10:00 AM
4. User C reports "gone" at 10:30 AM
→ Hazard resolved at 10:30 AM (3 reports threshold met)
```

### Scenario 2: Persistent Hazard
```
1. Road work detected at 9:00 AM
2. User A confirms "still there" at 11:00 AM
3. User B confirms "still there" at 3:00 PM
4. User C confirms "still there" at 7:00 PM
→ Hazard remains active, auto-resolve deadline extended each time
```

### Scenario 3: Time-Based Resolution
```
1. Speed bump detected at 9:00 AM
2. No confirmations for 24 hours
3. 1 user reports "gone" at 8:00 AM next day
→ Status changes to "resolving"
→ After 2 more "gone" reports OR time expires: resolved
```

### Scenario 4: Sensor Re-Detection
```
1. Debris detected at 9:00 AM
2. Users report "gone" (2 reports)
3. Vehicle sensor re-detects at 1:00 PM
→ Detection count incremented
→ Status resets to "active"
→ lastConfirmedAt updated
→ Resolution counter reset
```

## Anti-Spam Measures

### Cooldown Periods
- **User Confirmation**: 1 hour per action per hazard
- **Prevents**: Spam clicking, artificial manipulation

### Device Tracking
- Each device gets unique ID stored in localStorage
- Tracks which hazards already confirmed
- Cross-session persistence

### Validation Requirements
- Multiple users needed for resolution
- Time-based verification layer
- Sensor re-detection overrides user reports

## Data Persistence

### LocalStorage
All hazard data persists in browser storage:
```javascript
localStorage.setItem('hazard-scout-hazards', JSON.stringify(hazards));
localStorage.setItem('hazard-scout-service-settings', JSON.stringify(settings));
```

### Retention Policy
- **Active Hazards**: Indefinite (until resolved)
- **Resolving Hazards**: Until resolved
- **Resolved Hazards**: 7 days (configurable)

### Future Backend Integration
The service is designed for easy backend sync:
```typescript
// Upload to server
await api.uploadHazard(hazard);

// Sync from server
const serverHazards = await api.fetchHazards(location);
```

## Benefits

### 1. **Accuracy**
- Multi-user verification prevents false resolutions
- Time-based cleanup removes stale data
- Sensor re-detection provides ground truth

### 2. **User Engagement**
- Drivers feel they're contributing
- Gamification potential (contribution stats)
- Real-time feedback loop

### 3. **Safety**
- Hazards persist long enough for multiple drivers to benefit
- Critical hazards stay visible longer
- False positives eventually cleared

### 4. **Scalability**
- Distributed verification (no central authority needed)
- Self-cleaning system
- Minimal manual moderation required

## API Reference

### HazardService Methods

```typescript
// User Actions
confirmHazardStillThere(hazardId: string): boolean
reportHazardGone(hazardId: string): boolean
hasUserConfirmed(hazardId: string, type: 'still-there' | 'gone'): boolean

// Hazard Management
addHazard(hazardData: HazardData): HazardData
incrementDetectionCount(hazardId: string): void
getHazard(hazardId: string): HazardData | undefined
getActiveHazards(): HazardData[]
getAllHazards(): HazardData[]

// Resolution Tracking
getTimeUntilAutoResolve(hazardId: string): number | null
getResolutionProgress(hazardId: string): ResolutionProgress | null

// Configuration
updateSettings(settings: Partial<HazardServiceSettings>): void
getSettings(): HazardServiceSettings
```

## Monitoring & Analytics

Track these metrics for system health:

- **Average Resolution Time**: How long hazards stay active
- **Confirmation Rate**: % of hazards confirmed by multiple users
- **False Positive Rate**: Hazards quickly reported as gone
- **User Contribution**: Number of confirmations per user
- **Sensor vs User Detection**: Which source is more reliable

## Best Practices

### For Users
1. **Confirm what you see**: If you pass a hazard, take a second to verify
2. **Be honest**: Only report "gone" if you're certain
3. **Check history**: Review resolved hazards to see community impact

### For Developers
1. **Tune thresholds**: Monitor resolution patterns and adjust
2. **A/B test settings**: Different regions may need different configs
3. **Add backend sync**: Eventually move to server-based verification
4. **Implement analytics**: Track user engagement and accuracy metrics

## Future Enhancements

1. **Reputation System**: Weight confirmations by user reliability
2. **ML Prediction**: Predict resolution likelihood based on hazard type
3. **Photo Verification**: Users can upload photos for visual confirmation
4. **Area-Based Tuning**: Different resolution rules for highway vs city
5. **Real-Time Sync**: WebSocket updates for live hazard changes
6. **Community Voting**: Additional vote types (severity adjustment, location correction)

---

**Note**: This system creates a self-maintaining, community-driven hazard map that balances freshness with accuracy. The combination of user validation and time-based cleanup ensures the map stays relevant and trustworthy.
