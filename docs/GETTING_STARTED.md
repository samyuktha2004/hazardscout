# Getting Started

## Live MVP

🌍 **https://hazardscout.vercel.app**

## What It Does

- **Live hazard map** with real-time markers
- **Three hazard types**: Self-detect (vehicle), Network (community), V2X (car-to-car)
- **Verification workflow**: Confirm hazards or report them as resolved
- **Navigation**: Route planning with hazard alerts
- **Mobile-first**: Works perfectly on phones and tablets

## For Testing

### See It Work (2 min)

1. Visit https://hazardscout.vercel.app
2. Go to "Scout" tab (bottom)
3. Click any marker (Circle, Triangle, or Square)
4. Click "Still There" to verify
5. Click "Report Gone" to help resolve

### Run Locally (5 min)

```bash
npm install
npm run dev
# Visit http://localhost:5173
```

### Deploy Changes

```bash
git push origin main
# Vercel auto-deploys within 60 seconds
```

## Key Features

| Feature           | Status | Where to See            |
| ----------------- | ------ | ----------------------- |
| Live Map          | ✅     | Scout tab               |
| Pothole Detection | ✅     | Blue circle marker      |
| Network Alerts    | ✅     | Purple triangle marker  |
| V2X Alerts        | ✅     | Blue square marker      |
| Verification      | ✅     | Click any marker        |
| Navigation        | ✅     | Click "Navigate" button |
| Mobile            | ✅     | Use phone browser       |

## File Structure

```
hazardscout/
├── src/
│   ├── components/     # UI components
│   ├── logic/         # Hazard simulation
│   └── types/         # TypeScript types
├── docs/              # Documentation (you are here)
├── dist/              # Production build (auto-generated)
└── package.json       # Dependencies
```

## Common Tasks

**Add Mapbox token for testing:**

1. Create `.env` in root
2. Add: `VITE_MAPBOX_ACCESS_TOKEN=your_token`
3. Restart `npm run dev`

**View source code:**

- Main app: `src/components/VWConnectApp.tsx`
- Map: `src/components/MapboxMap.tsx`
- Hazards: `src/logic/useHazardState.ts`

**Deploy to production:**

```bash
git add .
git commit -m "Your changes"
git push origin main
# Deployed! Check https://vercel.com/dashboard
```

## Next

- **Learn more**: See `DEPLOYMENT.md` for deployment details
- **Understand architecture**: See `TECHNICAL.md`
- **Setup locally**: See `SETUP.md`
- **Need help?**: Check troubleshooting in `DEPLOYMENT.md`

---

**Questions?** Check the docs or the README.md in project root.
