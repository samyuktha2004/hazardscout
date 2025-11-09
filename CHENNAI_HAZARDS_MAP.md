# Chennai Airport to Perungudi - Test Hazards Map

## Route Overview
**From:** Chennai International Airport (12.9941°N, 80.1709°E)  
**To:** Perungudi Industrial Estate (12.9612°N, 80.2429°E)  
**Total Distance:** ~7.5 km  
**Primary Routes:** GST Road → Inner Ring Road → OMR (Old Mahabalipuram Road)

## Hazard Distribution (18 Total Hazards)

### Zone 1: Airport Exit Area (0-1 km)
1. **Pothole** - GST Road Airport Exit (12.9895, 80.1698)
   - Severity: HIGH | Source: Your Car | Distance: 200m
   
2. **Road Work** - Airport Cargo Terminal Road (12.9850, 80.1750)
   - Severity: MEDIUM | Source: V2X | Distance: 600m

### Zone 2: Meenambakkam (1-2 km)
3. **Debris** - GST Road near Meenambakkam (12.9820, 80.1820)
   - Severity: HIGH | Source: Network | Distance: 1.2km
   
4. **Speed Bump** - Meenambakkam Main Road (12.9795, 80.1890)
   - Severity: LOW | Source: Network | Distance: 1.5km

### Zone 3: Pallavaram Junction (2-3 km)
5. **Uneven Surface** - Pallavaram Inner Ring Road Junction (12.9750, 80.1950)
   - Severity: MEDIUM | Source: Your Car | Distance: 2.0km
   
6. **Flooding** - Chromepet Main Road (12.9720, 80.2020)
   - Severity: HIGH | Source: V2X | Distance: 2.5km

7. **Flooding** - Palavanthangal Service Road (12.9780, 80.2050) [Alternate Route]
   - Severity: MEDIUM | Source: Network | Distance: 2.8km

### Zone 4: Chromepet (3-4 km)
8. **Pothole** - Chromepet GST Road (12.9690, 80.2100)
   - Severity: MEDIUM | Source: Network | Distance: 3.2km
   
9. **Road Work** - Chromepet Railway Overbridge (12.9660, 80.2150)
   - Severity: HIGH | Source: V2X | Distance: 3.8km

### Zone 5: Tambaram Area (4-5 km)
10. **Debris** - East Tambaram Road (12.9640, 80.2180)
    - Severity: MEDIUM | Source: Your Car | Distance: 4.2km
    
11. **Speed Bump** - Tambaram-Mudichur Road (12.9625, 80.2230)
    - Severity: LOW | Source: Network | Distance: 4.8km

12. **Uneven Surface** - Madipakkam Main Road Junction (12.9650, 80.2250) [Alternate Route]
    - Severity: HIGH | Source: Your Car | Distance: 5.0km

### Zone 6: Velachery Junction (5-6 km)
13. **Uneven Surface** - Inner Ring Road Velachery Junction (12.9610, 80.2280)
    - Severity: HIGH | Source: V2X | Distance: 5.5km
    
14. **Pothole** - Velachery Main Road (12.9600, 80.2320)
    - Severity: MEDIUM | Source: Your Car | Distance: 6.0km

### Zone 7: OMR Corridor to Perungudi (6-7.5 km)
15. **Pothole** - Thoraipakkam Junction OMR (12.9620, 80.2350) [Alternate Route]
    - Severity: HIGH | Source: V2X | Distance: 6.5km

16. **Road Work** - OMR Velachery Bypass (12.9595, 80.2370)
    - Severity: MEDIUM | Source: Network | Distance: 6.8km
    
17. **Debris** - OMR Service Road Perungudi (12.9605, 80.2400)
    - Severity: LOW | Source: Network | Distance: 7.2km
    
18. **Speed Bump** - Perungudi Industrial Estate (12.9612, 80.2429)
    - Severity: LOW | Source: V2X | Distance: 7.5km

## Hazard Type Distribution
- **Potholes:** 5 hazards (1 high, 3 medium, 1 high)
- **Road Work:** 3 hazards (1 high, 2 medium)
- **Debris:** 3 hazards (1 high, 1 medium, 1 low)
- **Uneven Surface:** 3 hazards (3 high, 1 medium)
- **Speed Bumps:** 3 hazards (all low)
- **Flooding:** 2 hazards (1 high, 1 medium)

## Severity Distribution
- **HIGH:** 8 hazards (44%)
- **MEDIUM:** 7 hazards (39%)
- **LOW:** 3 hazards (17%)

## Source Distribution
- **V2X (Infrastructure):** 6 hazards - Square markers
- **Your Car (Detected):** 6 hazards - Circle markers  
- **Network Cars:** 6 hazards - Triangle markers

## Testing the Live Navigation

1. **Set Destination:** Perungudi Industrial Estate in Safety Scout screen
2. **Tap "Go":** Activates full-screen Live Navigation Map
3. **Expected Behavior:**
   - Route displays in VW Blue (#0070E1)
   - All 18 hazards appear as shape/color-coded markers
   - Proximity alerts trigger when within 500m-1km of hazards
   - Alert overlays show hazard type, severity, distance
   - Top bar shows current street name and hazard count
   - Bottom bar displays ETA and distance remaining

## Proximity Alert Testing Zones

As you navigate (or simulate movement), expect alerts at:
- **Zone 1 (0-1km):** Immediate alerts for airport exit hazards
- **Zone 3 (2-3km):** Multiple alerts at Pallavaram junction (including flooding)
- **Zone 4 (3-4km):** Critical road work alert at railway overbridge
- **Zone 6 (5-6km):** Multiple hazards converging at Velachery junction
- **Zone 7 (6-7.5km):** Final approach alerts near destination

## Auto-Resolution Settings
- **Default Time:** 24 hours for most hazards
- **Quick Resolution:** 12 hours for debris
- **Extended:** 48 hours for road work
- **Flooding:** 18 hours
- **Confirmations Needed:** 3 "gone" reports to resolve manually

## Notes for Simulation
- Hazards are distributed along the most common routes
- Multiple routing options will show different hazard sets
- Heavy concentration at known traffic junctions (Pallavaram, Velachery)
- Industrial areas (Chromepet, Perungudi) have more infrastructure hazards
- Flood-prone areas (Pallavaram, Palavanthangal) marked appropriately
