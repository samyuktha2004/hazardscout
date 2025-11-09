# 🚗 Hazard Scout 
**Hazard Scout** is a high-fidelity prototype for an active road safety and predictive maintenance system, designed specifically for the Volkswagen ecosystem. It transforms a vehicle's sensors into an intelligent network that detects, validates, and resolves road hazards in real-time. It is aimed to be compatible with the **VW Connect app**, or as a standalone app for non-Volkswagen users.


A real-time hazard detection and vehicle-to-vehicle (V2V) communication system for vehicles. Built with React, TypeScript, and Tailwind CSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6)

---

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [V2V Network Communication](#v2v-network-communication)
- [Technologies Used](#technologies-used)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### 🚙 Vehicle Management
- Multi-vehicle dashboard (Electric, Petrol, Diesel)
- Real-time battery/fuel level monitoring
- Vehicle lock/unlock controls
- Remote climate control
- Vehicle status tracking

### 🗺️ Live Hazard Map
- Interactive Mapbox-powered map
- Real-time hazard markers (potholes, debris, speed bumps, cracks)
- Chennai road coverage with actual street names
- GPS-based location tracking
- Navigation to hazard locations

### ⚠️ Safety Scout
- Active hazard monitoring
- User hazard confirmation system
- Community-driven hazard resolution
- Auto-resolution after 24 hours
- Hazard severity indicators (High/Medium/Low)

### 📡 V2V Network Communication
- Real-time Vehicle-to-Vehicle hazard sharing
- 5km broadcast radius
- Automatic hazard map pinning
- Proximity-based filtering
- Network status visualization

### 🎨 User Interface
- Dark/Light mode support
- Fully responsive mobile design
- VW-branded color scheme (#0070E1)
- Accessibility options
- Smooth animations

---

## 📦 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- A modern web browser (Chrome, Edge, Firefox)

---

## 🚀 Installation

### Step 1: Navigate to Project Directory

```bash
cd "c:\IMOBILITHON 5.0\src"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages. **Installation may take 2-5 minutes.**

---

## ▶️ Running the Application

### Method 1: Using npm (Recommended)

```bash
npm run dev
```

### Method 2: Using the batch file

```bash
.\setup-and-run.bat
```

### Expected Output:

```
  VITE v4.5.14  ready in 240 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

### Access the Application:

Open your browser and navigate to:
```
http://localhost:5174
```

---

## 📁 Project Structure

```
c:\IMOBILITHON 5.0\src/
├── src/
│   ├── App.tsx                          # Main app component
│   ├── main.tsx                         # Application entry point
│   ├── components/
│   │   ├── DashboardScreen.tsx         # Home dashboard
│   │   ├── SafetyScoutScreen.tsx       # Hazard monitoring
│   │   ├── VehicleStatusScreen.tsx     # Vehicle details
│   │   ├── AccountScreen.tsx           # User settings
│   │   ├── MapboxMap.tsx               # Interactive map
│   │   ├── BottomNavigation.tsx        # Navigation bar
│   │   ├── V2VNetworkService.ts        # V2V communication
│   │   ├── V2VNetworkVisualization.tsx # Network visualization
│   │   ├── HazardService.ts            # Hazard management
│   │   ├── ThemeProvider.tsx           # Dark/Light mode
│   │   └── ui/                          # Reusable UI components
│   ├── types/
│   │   ├── vehicle.ts                   # TypeScript types
│   │   └── HazardTypes.ts              # Hazard interfaces
│   ├── logic/
│   │   ├── HazardSimulator.ts          # Demo hazard simulation
│   │   └── useHazardState.ts           # Hazard state hook
│   └── styles/
│       └── globals.css                  # Global styles
├── docs/                                 # Documentation
├── .env                                  # Environment variables
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
├── tailwind.config.js                    # Tailwind config
├── vite.config.ts                        # Vite config
└── README.md                             # This file
```

---

## 🎯 Key Features

### 1. Dashboard Screen
- View all your vehicles at a glance
- Quick access to vehicle controls
- Nearest hazard alerts
- Live map widget

### 2. Safety Scout
- Browse active hazards in your area
- Confirm if hazards are still present
- Report resolved hazards
- View hazard details with photos

### 3. Vehicle Status
- Detailed vehicle information
- Battery/Fuel levels
- Mileage tracking
- Lock/unlock controls

### 4. Service & Account
- Service history
- User profile management
- Theme settings (Dark/Light)
- Accessibility options

---

## 📡 V2V Network Communication

### How It Works

1. **Hazard Detection**: When your vehicle detects a hazard (pothole, debris, etc.)
2. **Automatic Broadcasting**: Alert is automatically sent to all nearby vehicles within 5km
3. **Map Pinning**: Hazard is automatically marked on the map for all nearby vehicles
4. **Real-time Updates**: Receive instant notifications about hazards ahead

### V2V Features

- ✅ Real-time WebSocket communication (ready for production server)
- ✅ GPS-based proximity filtering (5km radius)
- ✅ Automatic hazard map marking
- ✅ Haversine distance calculation
- ✅ Vehicle presence detection
- ✅ Network status monitoring

### Chennai Road Coverage

Demo includes hazards on major Chennai roads:
- Anna Salai (Mount Road)
- OMR (Old Mahabalipuram Road)
- ECR (East Coast Road)
- Porur-Poonamallee Road
- GST Road, Guindy

For detailed V2V documentation, see:
- `V2V_NETWORK_README.md` - Developer integration guide
- `V2V_NETWORK_COMPLETE.md` - Complete documentation
- `V2V_QUICK_START.md` - Quick start guide

---

## 🛠️ Technologies Used

### Frontend Framework
- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type safety
- **Vite 4.5.0** - Build tool & dev server

### Styling
- **Tailwind CSS 3.3.6** - Utility-first CSS
- **Radix UI** - Accessible components
- **Lucide Icons** - Icon library

### Mapping
- **Mapbox GL JS** - Interactive maps
- **Geolocation API** - GPS tracking

### State Management
- **React Hooks** - useState, useEffect, useContext
- **Local Storage** - Data persistence

### Networking
- **WebSocket** (ready for integration) - Real-time V2V communication
- **Fetch API** - HTTP requests

---

## ⚙️ Configuration

### Environment Variables

The app includes a demo Mapbox token in `MapboxMap.tsx`. For production:

1. Sign up at [Mapbox](https://mapbox.com)
2. Create a new access token
3. Update the `MAPBOX_TOKEN` constant in `src/components/MapboxMap.tsx`

### V2V Server Setup

For real V2V communication:
1. Setup a WebSocket server (see `V2V_NETWORK_README.md`)
2. Update WebSocket URL in `V2VNetworkService.ts`
3. Deploy the server

---

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is busy, Vite will automatically use 5174 or higher.

```bash
Port 5173 is in use, trying another one...
➜  Local:   http://localhost:5174/
```

### Node Modules Error

If you get dependency errors:

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Map Not Loading

1. Check internet connection (Mapbox requires internet)
2. Verify Mapbox token in `MapboxMap.tsx`
3. Check browser console for errors (F12)

### Build Errors

```bash
# Clear Vite cache and restart
npm run dev -- --force
```

---

## 📱 Mobile View

The app is fully responsive! To view in mobile format:

1. Open browser DevTools (F12)
2. Click device toggle icon (Ctrl + Shift + M)
3. Select device:
   - iPhone 16: 393 × 852 px
   - iPhone 16 Pro: 402 × 874 px
   - iPhone 16 Pro Max: 440 × 956 px

---

## 🎨 Theme Customization

### Changing to Light Mode

1. Open the app
2. Click **Account** tab (bottom navigation)
3. Scroll to **Appearance** section
4. Toggle the **Dark Mode** switch

### VW Brand Colors

The app uses official VW colors:
- Primary Blue: `#0070E1`
- Light Background: `#FDFAF9`
- Dark Background: `#0F172A` (Slate 950)

---

## 📚 Additional Documentation

Detailed documentation can be found in the `docs/` folder:

### Setup Guides
- [Mapbox Setup Guide](docs/MAPBOX_SETUP_GUIDE.md)
- [Quick Start Testing Guide](docs/QUICK_START_TESTING.md)

### Feature Documentation
- [Hazard Resolution Guide](docs/HAZARD_RESOLUTION_GUIDE.md)
- [Live Navigation Implementation](docs/LIVE_NAVIGATION_IMPLEMENTATION.md)
- [Notifications Guide](docs/NOTIFICATIONS_GUIDE.md)
- [Map Markers Guide](docs/MAP_MARKERS_GUIDE.md)

### Technical Documentation
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)
- [Knowledge Base](docs/HAZARD_SCOUT_KNOWLEDGE_BASE.md)

### V2V Network Documentation
- **V2V Network Guide**: `V2V_NETWORK_README.md`
- **V2V Complete Documentation**: `V2V_NETWORK_COMPLETE.md`
- **Quick Start Guide**: `V2V_QUICK_START.md`

---

## 🆘 Support

If you encounter any issues:

1. Check this README for solutions
2. Review the error in browser console (F12)
3. Ensure all dependencies are installed
4. Try restarting the dev server

---

## 🎉 Quick Start Summary

```bash
# 1. Navigate to project
cd "c:\IMOBILITHON 5.0\src"

# 2. Install dependencies (first time only)
npm install

# 3. Run the app
npm run dev

# 4. Open browser
http://localhost:5174
```

**That's it! Your Hazard Scout app is ready! 🚗💨**

---

## 🤝 Contributing

This project was developed for IMOBILITHON 5.0 hackathon.

---

## 👥 Team

Developed for IMOBILITHON 5.0
- GitHub: [samyuktha2004/hazardscout](https://github.com/samyuktha2004/hazardscout)

---

**Built with ❤️ for safer roads**
