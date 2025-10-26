# 🕶️ VIBE Property Scanner - Snap Spectacles Lens

AI-powered property scanning lens for Snap Spectacles with real-time object detection and AR overlays.

## Overview

This Lens Studio project enables Snap Spectacles to:
1. **Auto-capture** property photos every 2 seconds
2. **Detect objects** using YOLOv8 via backend API
3. **Display AR overlays** showing detected amenities in real-time

Perfect for real estate agents, property managers, and Airbnb hosts to quickly document properties hands-free.

## Features

### 🎯 Core Features
- ✅ **Auto-capture** - Automatic photo capture every 2s
- ✅ **Real-time detection** - YOLO object detection via backend
- ✅ **AR bounding boxes** - 3D boxes around detected objects
- ✅ **Text labels** - Floating labels with object name + confidence
- ✅ **Session management** - Track entire scanning session
- ✅ **Progress UI** - Real-time capture count and amenities

### 🎨 AR Visualization
- **Color-coded boxes**:
  - 🟢 Green: High confidence (>70%)
  - 🟡 Yellow: Medium confidence (50-70%)
  - 🟠 Orange: Low confidence (<50%)
- **Auto-fade**: Overlays fade out after 3 seconds
- **Billboard text**: Labels always face camera

### 📊 Detection Capabilities
Detects **80+ object types** including:
- Furniture: couch, bed, chair, dining table
- Appliances: refrigerator, oven, TV, microwave
- Amenities: pool, hot tub, fireplace (future)
- Decor: plants, art, vases

Maps to **50+ Airbnb amenities**:
- "Full kitchen", "Comfortable seating", "Entertainment center", etc.

## Quick Start

### 1. Prerequisites
- Lens Studio 5.x+
- Snap Spectacles (2024)
- Backend server running (see main README)
- Same WiFi network for Spectacles and computer

### 2. Setup
See **[SETUP.md](./SETUP.md)** for complete step-by-step instructions.

**Quick version:**
1. Get your local IP address
2. Update `Config.ts` with your IP
3. Import all scripts into Lens Studio
4. Configure scene hierarchy
5. Build and deploy to Spectacles

### 3. Test
1. Start backend: `uvicorn main:app --reload --host 0.0.0.0`
2. Deploy lens to Spectacles
3. Point at property rooms
4. Watch AR overlays appear!

## Architecture

### Flow Diagram
```
Spectacles Camera
    ↓ (every 2s)
CameraCapture.ts → Capture frame → Convert to base64
    ↓
NetworkManager.ts → HTTP POST to backend
    ↓
Backend YOLO Detection
    ↓
NetworkManager.ts → Receive detections
    ↓
AROverlayRenderer.ts → Render 3D boxes + labels
    ↓
UIManager.ts → Update UI (counts, amenities)
```

### Scripts

| Script | Purpose |
|--------|---------|
| **Config.ts** | Configuration (backend URL, intervals, thresholds) |
| **CameraCapture.ts** | Auto-capture frames from camera every 2s |
| **NetworkManager.ts** | HTTP communication with backend API |
| **SessionManager.ts** | Orchestrate scanning session lifecycle |
| **AROverlayRenderer.ts** | Render 3D bounding boxes and text labels |
| **UIManager.ts** | Display UI elements (progress, status, errors) |

### Backend API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check backend connection |
| `/api/spectacles/scan-session` | POST | Start new scan session |
| `/api/spectacles/detect` | POST | Send image for YOLO detection |
| `/api/spectacles/finalize` | POST | Finalize and get full analysis |

## Configuration

Edit `Config.ts` to customize:

```typescript
// Backend connection
BACKEND_BASE_URL = "http://YOUR_IP:8000"

// Capture settings
CAPTURE_INTERVAL_MS = 2000  // milliseconds
JPEG_QUALITY = 85            // 0-100
MAX_IMAGE_WIDTH = 1280       // pixels

// AR overlay settings
MIN_CONFIDENCE_DISPLAY = 0.50  // Only show if confidence >50%
OVERLAY_LIFETIME_MS = 3000     // Fade after 3 seconds
AR_DEPTH = 1.5                 // meters from camera

// Debug
DEBUG = true  // Enable console logging
```

## Usage Tips

### For Best Results
1. **Scan slowly** - Give YOLO time to process
2. **Point directly** - Aim at objects for better detection
3. **Good lighting** - YOLO works better in bright spaces
4. **Vary angles** - Capture different views of each room
5. **Wait for feedback** - Check AR overlays appear before moving on

### Interpreting AR Overlays
- **Box color** = Confidence level (green = high, orange = low)
- **Text label** = Object name + confidence percentage
- **Box size** = Approximate object size in view
- **Fade out** = Old detection (new one coming)

## Troubleshooting

### Connection Issues
- **"❌ Connection Failed"**
  - Check IP address in Config.ts
  - Verify same WiFi network
  - Test: Open `http://YOUR_IP:8000/health` in phone browser

### No Detections
- **No AR overlays appearing**
  - Lower `MIN_CONFIDENCE_DISPLAY` in Config.ts
  - Point at clearer objects (furniture works best)
  - Improve lighting

### Performance Issues
- **Slow/laggy**
  - Increase `CAPTURE_INTERVAL_MS` to 3000ms
  - Lower `JPEG_QUALITY` to 70
  - Reduce `MAX_IMAGE_WIDTH` to 960

See **[SETUP.md](./SETUP.md)** for full troubleshooting guide.

## Development

### Testing in Simulator
1. Open Lens Studio
2. Click Preview
3. Check console for logs:
   ```
   [VIBE] NetworkManager initialized
   [VIBE] ✅ Backend connection successful!
   [VIBE] Session started: session-id
   [VIBE] Capturing frame 1...
   [VIBE] Detected 4 objects, room: living_room
   ```

### Adding Custom Logic
- **Modify detection threshold**: Edit `Config.MIN_CONFIDENCE_DISPLAY`
- **Change capture rate**: Edit `Config.CAPTURE_INTERVAL_MS`
- **Add new UI elements**: Extend `UIManager.ts`
- **Customize AR overlays**: Modify `AROverlayRenderer.ts`

## Project Structure

```
vibe-property-scanner/
├── README.md                 # This file
├── SETUP.md                  # Detailed setup guide
└── Public/
    └── Scripts/
        ├── Config.ts         # Configuration
        ├── CameraCapture.ts  # Frame capture
        ├── NetworkManager.ts # HTTP requests
        ├── SessionManager.ts # Session lifecycle
        ├── AROverlayRenderer.ts # AR visualization
        └── UIManager.ts      # UI display
```

## Tech Stack

- **Lens Studio 5.x** - AR development platform
- **TypeScript** - Lens scripting language
- **YOLOv8** - Object detection (backend)
- **FastAPI** - Backend API (Python)
- **RemoteServiceModule** - HTTP requests from Spectacles

## Roadmap

### Current Features
- ✅ Auto-capture every 2s
- ✅ Real-time YOLO detection
- ✅ AR bounding boxes
- ✅ Text labels
- ✅ Session management

### Future Enhancements
- 🔲 3D object rendering
- 🔲 Voice commands to start/stop
- 🔲 Haptic feedback on detection
- 🔲 Offline mode with local storage
- 🔲 Multi-property session support

## License

Part of the VIBE platform for CalHacks 2025.

## Support

- **Setup issues**: See [SETUP.md](./SETUP.md)
- **Backend issues**: See main repo README
- **Lens Studio help**: [Lens Studio Docs](https://docs.snap.com/lens-studio)

---

Built with 💙 for hands-free property scanning
