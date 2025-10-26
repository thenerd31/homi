# Auto-Scan & Session Management Guide

## What's New

Your phone camera now **automatically captures** images every 3 seconds and aggregates all scan data into a complete JSON object ready for listing creation!

---

## How It Works

### Dual-Timer System

The scanner runs **TWO separate timers** for optimal performance:

**Timer 1: Real-Time YOLO Detection (Every 500ms)**
- Runs YOLO on video frames continuously
- Shows instant AR bounding boxes on objects
- Updates amenities and room type in real-time
- Provides smooth, responsive feedback
- Does NOT store images (just detections)

**Timer 2: Photo Capture (Every 3 seconds)**
- Captures high-quality photos separately
- Stores as base64 images in session
- Shows white flash effect on screen
- Updates "Photos" counter
- These are the images sent to listing creation

**Result:** You get smooth real-time detection (2fps) + clean photo captures every 3 seconds!

### 3. Session Aggregation

As you scan, the backend collects:
- ✅ All unique amenities detected
- ✅ Object counts (bed: 3, chair: 8, etc.)
- ✅ Room breakdown (bedroom: 2, kitchen: 1, bathroom: 1)
- ✅ Property type inference (Entire house, Apartment, etc.)
- ✅ Images with metadata

---

## Usage Flow

### Start Scanning

1. Open: `https://YOUR_IP:8000/camera_scan.html`
2. Tap **"Start Scanning"**
3. Point camera at rooms
4. Walk through property slowly
5. Camera auto-captures every 3 seconds

### Stop & Finalize

6. Tap **"Stop"** when done
7. Backend finalizes session
8. Alert shows summary
9. **Full JSON** in browser console

---

## Output JSON Structure

When you press Stop, you get a complete JSON object:

```json
{
  "session_id": "abc-123-def-456",
  "created_at": "2025-01-26T10:30:00",
  "finalized_at": "2025-01-26T10:32:15",

  "summary": {
    "total_frames_processed": 44,
    "images_captured": 4,
    "property_type": "Entire apartment",
    "bedrooms": 2,
    "bathrooms": 2,
    "has_kitchen": true,
    "has_living_room": true
  },

  "amenities": [
    "bedroom",
    "sleeping area",
    "full kitchen",
    "modern appliances",
    "seating",
    "TV",
    "entertainment",
    "bathroom",
    "dining area",
    "well-decorated"
  ],

  "objects_detected": {
    "chair": 12,
    "bed": 3,
    "tv": 2,
    "couch": 2,
    "dining table": 1,
    "refrigerator": 1,
    "oven": 1,
    "toilet": 2,
    "potted plant": 5
  },

  "room_breakdown": {
    "bedroom": 6,
    "living_room": 8,
    "kitchen": 4,
    "bathroom": 4,
    "dining_room": 3
  },

  "images": [
    {
      "frame_number": 10,
      "timestamp": "2025-01-26T10:30:30",
      "room_type": "bedroom",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "frame_number": 20,
      "timestamp": "2025-01-26T10:31:00",
      "room_type": "kitchen",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "frame_number": 30,
      "timestamp": "2025-01-26T10:31:30",
      "room_type": "living_room",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "frame_number": 40,
      "timestamp": "2025-01-26T10:32:00",
      "room_type": "bathroom",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],

  "all_frames": [
    // Last 20 frames with full detection data
    {
      "frame_number": 44,
      "timestamp": "2025-01-26T10:32:12",
      "detection": {
        "objects": [...],
        "amenities": [...],
        "room_type": "bathroom",
        "stats": {...}
      }
    }
  ]
}
```

---

## API Endpoints

### REST Endpoints (Alternative to WebSocket)

**Get Session Data:**
```bash
GET /api/scan/session/{session_id}

Response:
{
  "success": true,
  "data": {
    "session_id": "...",
    "frame_count": 25,
    "amenities": ["bedroom", "kitchen", ...],
    "room_detections": {"bedroom": 3, "kitchen": 2},
    "images_captured": 2
  }
}
```

**Finalize Session:**
```bash
POST /api/scan/finalize/{session_id}

Response:
{
  "success": true,
  "data": {
    // Full JSON object as shown above
  }
}
```

### WebSocket Protocol

**Start Session:**
```javascript
ws.send(JSON.stringify({ type: 'frame', image: 'data:image/jpeg;base64,...' }))
// Automatically creates session on first connection
```

**Finalize:**
```javascript
ws.send(JSON.stringify({ type: 'finalize' }))
// Returns complete JSON via WebSocket
```

---

## Using with Listing Creation

### Option 1: Direct from Browser Console

```javascript
// After scan completes, finalResults is available
console.log(JSON.stringify(finalResults, null, 2));

// Copy JSON and POST to listing endpoint
fetch('/api/create-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        ...finalResults,
        location: "Santa Monica, CA",
        user_id: "user-123"
    })
});
```

### Option 2: Automatic Flow

Update `handleFinalResults()` in camera_scan.html:

```javascript
function handleFinalResults(results) {
    console.log('Final scan results:', results);

    // Automatically create listing
    fetch('/api/create-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            scan_data: results,
            location: document.getElementById('location-input').value,
            user_id: getCurrentUserId()
        })
    })
    .then(res => res.json())
    .then(listing => {
        alert(`Listing created! ID: ${listing.id}`);
        window.location.href = `/listing/${listing.id}`;
    });
}
```

---

## Pricing Integration

The JSON output is perfect for your pricing service:

```javascript
// Extract data for pricing
const pricingData = {
    location: "Santa Monica, CA",
    property_type: results.summary.property_type,
    bedrooms: results.summary.bedrooms,
    bathrooms: results.summary.bathrooms,
    amenities: results.amenities  // All detected amenities!
};

// Call pricing service
const pricing = await fetch('/api/pricing/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pricingData)
}).then(r => r.json());

console.log(`Suggested price: $${pricing.suggested_price}/night`);
```

---

## Testing

### 1. Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --ssl-keyfile=certs/key.pem --ssl-certfile=certs/cert.pem
```

### 2. Open on Phone
```
https://YOUR_IP:8000/camera_scan.html
```

### 3. Scan Property
- Tap "Start Scanning"
- Walk through rooms
- Camera captures every 3 seconds
- Watch real-time detection

### 4. Finalize
- Tap "Stop"
- Check alert for summary
- Open browser console (Safari: Settings → Advanced → Web Inspector)
- See full JSON: `console.log(finalResults)`

### 5. Verify Data
Check that JSON includes:
- ✅ All amenities from all rooms
- ✅ Room counts (bedrooms, bathrooms)
- ✅ Property type inference
- ✅ 4+ base64 images
- ✅ Object counts

---

## Image Data Format

Images are stored as **data URIs**:
```
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

You can:
- Display in `<img>` tag: `<img src="${image.image}">`
- Upload to storage: Extract base64, decode, upload to S3/Supabase
- Keep as-is in database (if storage allows)

**Size:** Each image ~50-100KB base64 = ~37-75KB decoded

---

## Production Considerations

### Storage

**For production, consider:**
1. Upload images to Supabase Storage during scan
2. Store URLs instead of base64
3. Or: Store base64 but limit to 5 images max

### Session Cleanup

Sessions are cleaned up after:
- ✅ Finalize endpoint called
- ✅ WebSocket disconnected
- ⏰ Consider adding TTL (auto-delete after 1 hour)

### Rate Limiting

Add rate limits for:
- WebSocket connections
- Finalize endpoint
- Image uploads

---

## Summary

You now have a **complete property scanning system** that:
1. ✅ Auto-captures every 3 seconds
2. ✅ Stores images every 10 frames
3. ✅ Aggregates all amenities
4. ✅ Counts rooms automatically
5. ✅ Infers property type
6. ✅ Outputs complete JSON with images
7. ✅ Ready for listing creation

**Next step:** Create your listing endpoint that accepts this JSON! 🚀
