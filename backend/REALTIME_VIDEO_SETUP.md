# Real-Time Video Scanning Setup Guide

## Why HTTPS is Required

Modern browsers (Safari, Chrome) require **HTTPS** for `getUserMedia()` camera access for security reasons. This prevents malicious websites from secretly accessing your camera.

---

## Quick Setup (5 minutes)

### Step 1: Generate Self-Signed Certificate

```bash
cd backend
chmod +x setup_https.sh
./setup_https.sh
```

This creates:
- `certs/cert.pem` - SSL certificate
- `certs/key.pem` - Private key

### Step 2: Start Backend with HTTPS

```bash
cd backend
source venv/bin/activate

# Run with HTTPS
uvicorn main:app --reload --host 0.0.0.0 \
  --ssl-keyfile=certs/key.pem \
  --ssl-certfile=certs/cert.pem
```

You should see:
```
INFO:     Uvicorn running on https://0.0.0.0:8000
✅ YOLO service initialized with yolov8n.pt
```

### Step 3: Get Your Local IP

```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Example: `192.168.1.100`

### Step 4: Open on Phone

1. Make sure phone is on **same WiFi** as computer
2. Open phone browser (Safari/Chrome)
3. Go to: `https://192.168.1.100:8000/camera_scan.html` (use your IP)
4. **You'll see a security warning** - this is normal for self-signed certificates!

**On iPhone Safari:**
- Tap "Show Details"
- Tap "visit this website"
- Tap "Visit Website" again

**On Android Chrome:**
- Tap "Advanced"
- Tap "Proceed to 192.168.1.100 (unsafe)"

5. Allow camera access when prompted
6. Tap "Start Scanning"
7. **Point camera at rooms and watch real-time detection!**

---

## What You'll See

The page has a **clean design** matching your frontend:
- White panels with subtle borders
- No emojis
- Real-time bounding boxes on detected objects
- Live amenity detection
- Room type inference
- Confidence scores

**UI Elements:**
- Top panel: Connection status, frame count, objects, room type
- Bottom panel: Detected amenities (appears when objects found)
- Canvas overlay: Green/yellow/orange bounding boxes on objects
- Controls: Start/Stop buttons

---

## How It Works

```
Phone Camera (2 fps)
    ↓ HTTPS WebSocket
Backend YOLO (100-300ms)
    ↓ WebSocket Response
Phone Canvas Overlay
```

**Flow:**
1. Camera captures video frame (2fps)
2. Converts to JPEG base64
3. Sends via WebSocket over HTTPS
4. Backend runs YOLO detection
5. Returns: objects, bounding boxes, amenities, room type
6. Phone draws colored boxes on detected objects
7. Updates amenities list
8. Repeat

---

## Testing Tips

1. **Good Lighting**: Make sure rooms are well-lit
2. **Steady Hand**: Hold phone steady for 1-2 seconds per area
3. **Full Coverage**: Pan slowly around each room
4. **Multiple Rooms**: Test bedroom → kitchen → living room → bathroom
5. **Watch Amenities**: See real-time amenity detection for pricing

---

## Detection Examples

| You Point At | YOLO Detects | Amenities Added |
|--------------|--------------|-----------------|
| Bedroom with bed | bed, chair | "bedroom", "sleeping area", "seating" |
| Kitchen | refrigerator, oven, microwave | "full kitchen", "modern appliances", "cooking facilities" |
| Living room | couch, tv, chair | "living room", "seating", "TV", "entertainment" |
| Dining area | dining table, chair (x4) | "dining area", "dining area (seats 4+)" |
| Outdoor | bench, bicycle | "outdoor seating", "bike storage" |
| Nice decor | potted plant, vase, book | "well-decorated", "tasteful decor", "reading materials" |

---

## Troubleshooting

### "Camera Access Required" error
- Allow camera permissions in browser
- Make sure you're using **HTTPS** (not HTTP)
- Try Safari on iPhone (best support)

### "Connection error"
- Check phone and computer are on **same WiFi**
- Verify backend is running with HTTPS
- Check IP address is correct
- Try `https://192.168.1.100:8000/health` from phone browser

### "Certificate not trusted" won't let you proceed
- On iPhone: Settings → General → About → Certificate Trust Settings → Enable
- On Android: Just tap "Advanced" → "Proceed anyway"

### Slow/choppy video
- Normal! CPU processing takes 200-500ms per frame
- Currently running at 2 fps (every 500ms)
- For faster: Get GPU setup or reduce frame rate further

### No objects detected
- Ensure good lighting
- Move closer to objects
- Hold steady for 1-2 seconds
- Check backend terminal for errors

---

## File Structure

```
backend/
├── camera_scan.html          # NEW - Clean styled video page
├── phone_test_simple.html    # Photo upload version (HTTP)
├── setup_https.sh            # NEW - Certificate generator
├── certs/                    # NEW - SSL certificates (gitignored)
│   ├── cert.pem
│   └── key.pem
└── services/
    └── yolo_service.py       # Real-time YOLO detection
```

---

## Alternative: ngrok (Cloud Tunnel)

If self-signed certificates are problematic, use **ngrok** for a real HTTPS URL:

```bash
# Install ngrok
brew install ngrok  # Mac
# Or download from https://ngrok.com

# Start backend normally (HTTP)
uvicorn main:app --reload --host 0.0.0.0

# In another terminal, create HTTPS tunnel
ngrok http 8000
```

ngrok gives you a URL like: `https://abc123.ngrok-free.app`

Open on phone: `https://abc123.ngrok-free.app/camera_scan.html`

No certificate warnings! But requires internet connection.

---

## Next Steps: Connect to Pricing

After real-time scanning works, we'll add:

1. **"Finalize Scan" button**
2. Aggregate all detected amenities from scan session
3. Call pricing service with amenities
4. Show suggested price

**Ready to test?** Run `./setup_https.sh` and start scanning!
