# VIBE Scanner - Quick Start (Minimal Version)

**Goal: Get core functionality working FIRST, then add more UI**

This minimal version:
- ✅ Captures images every 2s
- ✅ Sends to backend for YOLO detection
- ✅ Logs everything to console
- ✅ Shows basic status on ONE text element

---

## Step 1: Add Scene Objects

**In Scene Hierarchy (left panel):**

1. Click **"+" button**
2. Select **"Empty Object"**
3. Rename to **"Managers"**

**Create 3 children under Managers:**
1. With "Managers" selected, click "+"
2. Select **"Empty Child Object"**
3. Create these 3:
   - **CaptureManager**
   - **NetworkManager**
   - **SessionController**

---

## Step 2: Add Scripts to Objects

**CaptureManager:**
1. Select it
2. Inspector → **"Add Component"**
3. Choose **"Script Component"**
4. Script dropdown → **"CameraCapture"**

**NetworkManager:**
1. Select it
2. Add Component → Script Component
3. Script → **"NetworkManager"**

**SessionController:**
1. Select it
2. Add Component → Script Component
3. Script → **"SessionManager"**

---

## Step 3: Add ONE Text Element

**In Scene Hierarchy:**

1. Click **"+" button**
2. Look for and select **"Screen Text"** (might be under "2D" submenu)
3. It gets added to scene
4. Rename it to **"StatusText"**

**Configure it:**
- Select StatusText
- Inspector → Text field: "Initializing..."
- Position: Center or top of screen

---

## Step 4: Wire the Scripts

### CaptureManager:
- Select "CaptureManager"
- Inspector → find `cameraModule` input
- **Asset Browser** (bottom) → drag **"Camera Module"** to input

### NetworkManager:
- Select "NetworkManager"
- Inspector → find `internetModule` input
- Asset Browser → drag **"Internet Module"** to input

### SessionController:
- Select "SessionController"
- Inspector → you'll see several inputs:
  - `cameraCapture`: Drag **CaptureManager** object from Scene Hierarchy
  - `networkManager`: Drag **NetworkManager** object
  - `uiManager`: **Leave empty for now** (we'll add later)
  - `arOverlayRenderer`: **Leave empty for now**

---

## Step 5: Modify SessionManager to Work Without UI

Since uiManager might be undefined, we need to add safety checks.

**Your SessionManager.ts already has checks, so it should work!**

But to be safe, let's test with Logger output only first.

---

## Step 6: Test in Preview

1. **Set Device Type** in Preview panel to **"Spectacles"**
2. Click **"Preview Lens"**
3. **Watch Logger panel (bottom)**

**Expected logs:**
```
[VIBE] CameraCapture initialized
[VIBE] CameraModule ready
[VIBE] NetworkManager initialized
[VIBE] Testing backend connection...
[VIBE] ✅ Backend connected!
[VIBE] SessionManager initialized
[VIBE] Starting scan session...
[VIBE] Session started: session-xyz
[VIBE] Capture timer triggered
[VIBE] Capturing frame 1...
[VIBE] Image captured: 3200x2400
[VIBE] Frame 1 encoded (XXXXX chars)
[VIBE] Sending detection request 1...
[VIBE] Detected 4 objects, room: living_room
```

**If you see this flow, IT'S WORKING!** 🎉

---

## Step 7: Check Backend

**In your backend terminal**, you should see:
```
INFO: POST /api/spectacles/scan-session - 200 OK
INFO: POST /api/spectacles/detect - 200 OK
INFO: POST /api/spectacles/detect - 200 OK
```

---

## Once This Works

**Then we add:**
- All 7 text elements
- UIManager script
- ARRenderer for detections display
- Full UI wiring

**But first, let's prove the core pipeline works!**

---

## Debugging

**If "Backend connection failed":**
```bash
# Test from terminal:
curl http://172.16.224.126:8000/health

# Should return:
{"status":"healthy"}
```

**If Camera Module not found:**
- Go to top menu → **"Project Settings"**
- Look for capabilities/modules section
- May need to enable Camera Module there

**If Internet Module not found:**
- Same as above for Internet Module
- Or it might already be enabled

---

## Next: Add Full UI

Once you see successful captures and detections in Logger, we'll add:
1. UIManager object with UIManager script
2. All 7 text elements
3. Wire everything together
4. ARRenderer for showing detections

**But first - let's get the core working!**

Start with Step 1 and let me know what you see! 🚀
