# 📱 Real-Time Phone Camera Testing Guide

## What You Can Do

Point your phone camera at rooms in your house and see:
- ✅ Real-time bounding boxes on detected objects
- ✅ Live amenity detection (for pricing)
- ✅ Room type inference (bedroom, kitchen, bathroom)
- ✅ User guidance (move closer, good coverage, etc.)

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
source venv/bin/activate  # Or: venv\Scripts\activate on Windows

# Install YOLO model
pip install ultralytics opencv-python

# The yolov8n.pt model will auto-download on first run (~6MB)
```

### Step 2: Start Backend with Network Access

**Important:** Use `--host 0.0.0.0` so your phone can connect!

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
✅ YOLO service initialized with yolov8n.pt
```

### Step 3: Get Your Local IP Address

**On Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for your local IP, something like:
- `192.168.1.100` (home WiFi)
- `10.0.0.50` (corporate network)
- `172.16.x.x` (other local network)

**Example output:**
```
inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
```
Your IP is: **192.168.1.100**

### Step 4: Connect Phone

1. **Make sure phone is on the SAME WiFi** as your computer
2. Open phone browser (Safari on iPhone, Chrome on Android)
3. Go to: `http://YOUR_IP:8000/phone_test.html`
   - Example: `http://192.168.1.100:8000/phone_test.html`
4. Allow camera access when prompted
5. Press **"Start Scanning"**

---

## What You'll See

### On Phone Screen:

```
┌─────────────────────────────────────┐
│  [Live Camera Feed with Overlays]  │
│                                     │
│  ┌──────────┐  ← Green box         │
│  │ bed 92%  │     with label        │
│  └──────────┘                       │
│                                     │
│  🟢 Connected                       │
│  📸 Frame: 45                       │
│  🏠 Room: bedroom                   │
│  🎯 Objects: 5                      │
│  💬 ✅ Good! Bedroom captured       │
│                                     │
│  Detected Amenities:                │
│  bedroom, seating, comfortable      │
│  sleeping, well-decorated           │
│                                     │
│  [Start Scanning]  [Stop]          │
└─────────────────────────────────────┘
```

### In Backend Terminal:

```
📱 Phone connected to WebSocket
✅ YOLO service initialized with yolov8n.pt
📸 Processed 10 frames - Room: bedroom, Objects: 5
📸 Processed 20 frames - Room: kitchen, Objects: 8
📸 Processed 30 frames - Room: living_room, Objects: 12
```

---

## Testing Tips

1. **Good Lighting**: Make sure rooms are well-lit
2. **Steady Hand**: Hold phone steady for 1-2 seconds per room
3. **Full Coverage**: Pan slowly around each room
4. **Multiple Rooms**: Test bedroom → kitchen → living room → bathroom
5. **Watch Amenities**: See how detected objects map to pricing amenities

---

## How It Works

```
Phone Camera (2 fps)
    ↓ WebSocket
Backend YOLO Detection (100-300ms)
    ↓ WebSocket
Phone Displays Bounding Boxes
```

**Frame Flow:**
1. Phone captures video frame
2. Converts to JPEG base64
3. Sends via WebSocket
4. Backend runs YOLOv8 detection
5. Returns: objects, amenities, room type, guidance
6. Phone draws green/yellow boxes on objects
7. Repeat at 2 fps

---

## Detected Objects → Pricing Amenities

| YOLO Detects | Maps To Amenity |
|--------------|-----------------|
| bed | "bedroom", "sleeping area" |
| couch | "living room", "seating" |
| refrigerator | "full kitchen", "modern appliances" |
| tv | "TV", "entertainment" |
| dining table | "dining area" |
| wine glass | "entertainment-ready", "glassware" |
| potted plant | "well-decorated", "plants" |
| bicycle | "bike storage" |
| car | "parking" |

---

## Troubleshooting

### "Could not access camera"
- Allow camera permissions in browser
- Try Safari on iPhone (best support)
- Try Chrome on Android

### "Connection error"
- Check phone and computer are on **same WiFi**
- Verify backend is running with `--host 0.0.0.0`
- Check IP address is correct
- Try `http://192.168.1.100:8000/health` from phone browser

### "No objects detected"
- Ensure good lighting
- Move closer to objects
- Hold steady for 1-2 seconds
- Check backend terminal for errors

### Slow detection
- Normal! CPU takes 200-500ms per frame
- GPU would be 50-100ms (need CUDA setup)
- Current 2 fps is good for scanning

---

## Next Steps: Connect to Pricing

After scanning works, we'll add:

```python
# Aggregate all detected amenities
all_amenities = ["bedroom", "full kitchen", "TV", "entertainment-ready", ...]

# Call pricing service
pricing = await pricing_service.analyze_pricing(
    location="Santa Monica, CA",
    property_type="Entire apartment",
    amenities=all_amenities,
    bedrooms=2,
    bathrooms=2
)

# Show: "Suggested price: $320/night"
```

---

## File Structure

```
backend/
├── services/
│   └── yolo_service.py          # NEW - Lean YOLO service (~150 lines)
├── main.py                       # UPDATED - Added WebSocket endpoint
├── phone_test.html               # NEW - Phone camera test page
└── PHONE_CAMERA_TESTING.md      # This file
```

---

## Performance

- **Latency**: 100-300ms per frame (CPU)
- **Frame rate**: 2 fps (good for scanning)
- **Model size**: 6MB (yolov8n.pt)
- **Detection**: 80 COCO object classes
- **Amenity mapping**: ~20 pricing-relevant categories

---

**Ready to test? Start backend and open on phone!** 📱✨
