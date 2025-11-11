# Deployment Guide

**Status:** ✅ Live at https://hazardscout.vercel.app

## Quick Start (30 seconds)

```bash
# Local development
npm install
npm run dev
# Visit http://localhost:5173

# Production build
npm run build

# Deploy (automatic on git push to main)
git push origin main
```

## Environment Setup

### Create `.env` in project root:

```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**Important:**

- `.env` is in `.gitignore` (won't be committed)
- Never hardcode secrets in source code
- Vercel env vars are configured separately

## Vercel Deployment

### First Time

1. Connect GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add env var: `VITE_MAPBOX_ACCESS_TOKEN`

### Ongoing

- Any push to `main` auto-deploys
- Check deployment status: https://vercel.com/dashboard

## Verification Checklist

| Item      | Check | Details                        |
| --------- | ----- | ------------------------------ |
| Local dev | ✅    | `npm run dev` works            |
| Build     | ✅    | `/dist` folder created         |
| Mapbox    | ✅    | Map renders, markers visible   |
| Env vars  | ✅    | No hardcoded secrets           |
| Mobile    | ✅    | Responsive on all sizes        |
| Live URL  | ✅    | https://hazardscout.vercel.app |

## Core Features Live

✅ **Self-Detect Pothole** (Blue Circle) - Your vehicle detection  
✅ **Network Alert** (Purple Triangle) - Community reports  
✅ **V2X Critical Alert** (Blue Square) - Car2Car network  
✅ **Real-time Map** - Mapbox with all controls  
✅ **Verification Workflow** - Confirm/resolve hazards  
✅ **Mobile Responsive** - Works on all devices

## Build Output

```
dist/
├── index.html           (0.32 kB gzipped)
└── assets/
    ├── index-*.js      (595.61 kB gzipped)
    └── index-*.css     (26.10 kB gzipped)
```

Build time: ~2 minutes  
Performance: Load < 2 seconds

## Next Steps

1. Visit https://hazardscout.vercel.app
2. Test all three hazard triggers
3. Share with stakeholders
4. Gather feedback for next phase

## Troubleshooting

**Map not rendering?**

- Check VITE_MAPBOX_ACCESS_TOKEN is valid
- Clear browser cache
- Check console for errors

**Build failing?**

- Run `npm install` again
- Delete `node_modules` and `.next` (if exists)
- Check TypeScript: `npm run build`

**Deployment not working?**

- Verify GitHub is connected to Vercel
- Check env vars in Vercel settings
- View logs: https://vercel.com/dashboard

---

**Live:** https://hazardscout.vercel.app  
**Repo:** https://github.com/samyuktha2004/hazardscout
