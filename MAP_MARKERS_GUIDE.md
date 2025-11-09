# Map Marker System Guide

## Overview
The Hazard Scout map uses a comprehensive marker system where **shapes represent hazard sources** and **colors represent severity levels**.

## Marker Shapes by Source

### 🟦 Square Markers - V2X Hazards
Represents hazards received from Vehicle-to-Everything (V2X) infrastructure:
- Traffic management systems
- Smart road infrastructure
- Official accident reports
- Traffic jam alerts

**Source Type:** `v2x`

### 🔵 Circle Markers - Your Car Hazards
Represents hazards detected directly by your vehicle's sensors:
- On-board AI detection
- Suspension impact sensors
- Camera and radar systems

**Source Type:** `your-car`

### 🔺 Triangle Markers - Network Hazards
Represents hazards detected by other vehicles in the VW Connect network:
- Crowd-sourced hazard reports
- Network vehicle detections
- Community-validated hazards

**Source Type:** `network`

## Marker Colors by Severity

### 🔴 Red - High Severity
**Color Code:** `#DC2626` (Red)
- Critical road conditions requiring immediate attention
- Examples: Stalled vehicles, major accidents, large potholes, significant debris
- Includes animated pulse effect for highest priority

**Severity Level:** `high`

### 🟠 Amber/Orange - Medium Severity
**Color Code:** `#F59E0B` (Amber)
- Moderate road hazards requiring caution
- Examples: Minor potholes, road roughness, small debris, speed bumps
- Standard marker appearance

**Severity Level:** `medium`

### 🟡 Yellow - Low Severity
**Color Code:** `#EAB308` (Yellow)
- Minor road issues to be aware of
- Examples: Very minor irregularities, informational alerts
- Minimal visual prominence

**Severity Level:** `low`

### ⚪ Grey - Resolving Status
**Color Code:** `#94A3B8` (Grey, Faded)
- Hazards in the process of being resolved
- Indicates the hazard may no longer be present
- Shown with reduced opacity (60%)

**Status:** `resolving`

## Complete Marker Matrix

| Source / Severity | High (Red) | Medium (Amber) | Low (Yellow) | Resolving (Grey) |
|-------------------|------------|----------------|--------------|------------------|
| **V2X (Square)** | Red Square | Amber Square | Yellow Square | Grey Square (faded) |
| **Your Car (Circle)** | Red Circle | Amber Circle | Yellow Circle | Grey Circle (faded) |
| **Network (Triangle)** | Red Triangle | Amber Triangle | Yellow Triangle | Grey Triangle (faded) |

## Special Marker: Your Vehicle
- **Shape:** Blue circle with directional arrow
- **Color:** VW Blue (`#0070E1`)
- **Features:** Pulse animation, direction indicator
- Always shown at the center of the map in widget view

## Usage in Code

```typescript
import { getMarkerIcon } from './MapMarkerIcons';

// Get the appropriate marker component
const MarkerComponent = getMarkerIcon(
  hazard.severity,  // 'high' | 'medium' | 'low'
  hazard.source,    // 'v2x' | 'your-car' | 'network'
  hazard.status     // 'active' | 'resolving' | 'resolved' (optional)
);

// Render the marker
<MarkerComponent className="w-8 h-8" />
```

## Animation Effects

### High Severity Markers
- Animated pulse effect
- Expands from base size to larger size
- Fades from 50% opacity to 0%
- Duration: 1.5 seconds
- Continuous loop

### All Other Markers
- Static appearance
- No animation (to reduce visual clutter)

## Accessibility Considerations

1. **Color + Shape:** Using both shape and color ensures accessibility for users with color vision deficiencies
2. **High Contrast:** All markers use high-contrast borders for visibility
3. **Size Differentiation:** Widget mode uses smaller markers (w-4 h-4), fullscreen uses larger markers (w-8 h-8)

## Examples

### V2X High Severity (Red Square)
Accident reported by traffic infrastructure - highest priority, animated pulse

### Your Car Medium Severity (Amber Circle)
Pothole detected by your vehicle's suspension sensors - moderate priority

### Network Low Severity (Yellow Triangle)
Minor road roughness reported by another VW Connect vehicle - low priority

### Resolving Hazard (Grey, Faded)
Hazard that has been marked as potentially resolved - low visual prominence

## Implementation Files

- **Marker Icons:** `/components/MapMarkerIcons.tsx`
- **Map Integration:** `/components/MapboxMap.tsx`
- **Hazard Data:** `/components/HazardService.ts`

## Visual Design Principles

1. **Clarity:** Each marker type is instantly recognizable by shape
2. **Priority:** Color coding ensures critical hazards stand out
3. **Consistency:** Same shape/color logic applies across all map views
4. **Performance:** Efficient SVG rendering with minimal DOM elements
5. **Branding:** Maintains VW Connect's professional dark theme aesthetic
