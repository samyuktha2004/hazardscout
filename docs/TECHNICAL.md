# Technical Implementation

## Architecture

- React 18 + TypeScript
- Vite for build system
- Mapbox GL for mapping
- Local storage for data persistence

## Key Components

- `HazardService`: Core hazard management
- `MapboxMap`: Map rendering and interaction
- `LiveNavigation`: Turn-by-turn navigation
- `NotificationService`: Alert system

## Data Flow

```
User Action → Component → Service → State Update → UI Update
```

## Integration Points

1. Map Services (Mapbox/Google)
2. Geolocation API
3. Push Notifications
4. Local Storage

## Performance Considerations

- Marker clustering for many hazards
- Efficient proximity checking
- Optimized re-renders
- Map tile caching
