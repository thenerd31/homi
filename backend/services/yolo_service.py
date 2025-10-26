"""
Lean YOLO Service for Real-Time Object Detection
Optimized for phone camera streaming and pricing amenity extraction
"""

from ultralytics import YOLO
import cv2
import numpy as np
from typing import Dict, Any, List, Set
from collections import Counter
import os
import uuid
from datetime import datetime


class YOLOService:
    def __init__(self, model_path: str = "yolov8n.pt"):
        """
        Initialize YOLO model for fast real-time detection

        Args:
            model_path: "yolov8n.pt" (nano - fastest, recommended)
        """
        try:
            self.model = YOLO(model_path)
            self.confidence_threshold = float(os.getenv("YOLO_CONFIDENCE", "0.45"))

            # Map COCO objects → pricing amenities
            self.amenity_map = {
                # Furniture
                "bed": ["bedroom", "sleeping area"],
                "couch": ["living room", "seating area"],
                "chair": ["seating"],
                "dining table": ["dining area"],

                # Kitchen
                "refrigerator": ["full kitchen", "modern appliances"],
                "oven": ["full kitchen", "cooking facilities"],
                "microwave": ["kitchen appliances"],
                "sink": ["kitchen"],

                # Electronics
                "tv": ["TV", "entertainment"],
                "laptop": ["workspace", "work-from-home ready"],

                # Bathroom
                "toilet": ["bathroom"],

                # Decor & Quality Indicators
                "potted plant": ["plants", "well-decorated"],
                "vase": ["tasteful decor"],
                "book": ["reading materials", "thoughtful decor"],
                "wine glass": ["glassware", "entertainment-ready"],

                # Outdoor
                "bench": ["outdoor seating"],
                "umbrella": ["patio/deck"],
                "bicycle": ["bike storage"],
                "car": ["parking"],
            }

            # Room detection rules
            self.room_indicators = {
                "bedroom": ["bed"],
                "bathroom": ["toilet", "sink"],
                "kitchen": ["refrigerator", "oven", "microwave"],
                "living_room": ["couch", "tv"],
                "dining_room": ["dining table", "chair"],
            }

            # Session storage for aggregating scan data
            self.sessions = {}

            print(f"✅ YOLO service initialized with {model_path}")

        except Exception as e:
            print(f"❌ Error initializing YOLO: {e}")
            raise

    def create_session(self, session_id: str = None) -> str:
        """Create a new scanning session"""
        if not session_id:
            session_id = str(uuid.uuid4())

        self.sessions[session_id] = {
            "session_id": session_id,
            "created_at": datetime.now().isoformat(),
            "frames": [],
            "all_amenities": set(),
            "all_objects": [],
            "room_detections": Counter(),
            "frame_count": 0,
            "images": []  # Store images every 10 frames
        }

        return session_id

    def add_frame_to_session(
        self,
        session_id: str,
        detection_result: Dict[str, Any],
        image_base64: str = None,
        store_image: bool = False
    ):
        """Add frame detection to session"""
        if session_id not in self.sessions:
            return

        session = self.sessions[session_id]
        session["frame_count"] += 1

        # Store frame data (lightweight - just detection results)
        session["frames"].append({
            "frame_number": session["frame_count"],
            "timestamp": datetime.now().isoformat(),
            "detection": detection_result
        })

        # Aggregate amenities
        if detection_result.get("amenities"):
            session["all_amenities"].update(detection_result["amenities"])

        # Aggregate objects
        if detection_result.get("objects"):
            for obj in detection_result["objects"]:
                session["all_objects"].append(obj["class"])

        # Track room detections
        room_type = detection_result.get("room_type")
        if room_type and room_type != "general_space":
            session["room_detections"][room_type] += 1

        # Store image ONLY when explicitly flagged (every 3 seconds from client)
        if store_image and image_base64:
            session["images"].append({
                "frame_number": session["frame_count"],
                "timestamp": datetime.now().isoformat(),
                "image": image_base64,
                "room_type": room_type,
                "objects_detected": len(detection_result.get("objects", []))
            })
            print(f"📸 Photo captured! Total images: {len(session['images'])}")

    def finalize_session(self, session_id: str) -> Dict[str, Any]:
        """Get final aggregated results for session"""
        if session_id not in self.sessions:
            return {"error": "Session not found"}

        session = self.sessions[session_id]

        # Count unique objects
        object_counts = Counter(session["all_objects"])

        # Determine property type from room counts
        bedrooms = session["room_detections"].get("bedroom", 0)
        bathrooms = session["room_detections"].get("bathroom", 0)
        has_kitchen = session["room_detections"].get("kitchen", 0) > 0
        has_living_room = session["room_detections"].get("living_room", 0) > 0

        if bedrooms >= 3 and bathrooms >= 2:
            property_type = "Entire house"
        elif bedrooms >= 2:
            property_type = "Entire apartment"
        elif bedrooms == 1 and has_kitchen:
            property_type = "Studio apartment"
        elif bedrooms == 1:
            property_type = "Private room"
        else:
            property_type = "Property"

        # Build final result
        result = {
            "session_id": session_id,
            "created_at": session["created_at"],
            "finalized_at": datetime.now().isoformat(),
            "summary": {
                "total_frames_processed": session["frame_count"],
                "images_captured": len(session["images"]),
                "property_type": property_type,
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "has_kitchen": has_kitchen,
                "has_living_room": has_living_room
            },
            "amenities": sorted(list(session["all_amenities"])),
            "objects_detected": dict(object_counts.most_common(20)),
            "room_breakdown": dict(session["room_detections"]),
            "images": session["images"],
            "all_frames": session["frames"][-20:]  # Last 20 frames for reference
        }

        return result

    def get_session(self, session_id: str) -> Dict[str, Any]:
        """Get current session data"""
        if session_id not in self.sessions:
            return {"error": "Session not found"}

        session = self.sessions[session_id]
        return {
            "session_id": session_id,
            "frame_count": session["frame_count"],
            "amenities": list(session["all_amenities"]),
            "room_detections": dict(session["room_detections"]),
            "images_captured": len(session["images"])
        }

    def delete_session(self, session_id: str):
        """Clean up session data"""
        if session_id in self.sessions:
            del self.sessions[session_id]

    async def detect_realtime(
        self,
        image_bytes: bytes
    ) -> Dict[str, Any]:
        """
        Fast real-time detection for streaming video frames

        Returns:
            {
                "objects": [{"class": "bed", "confidence": 0.92, "bbox": [x1,y1,x2,y2]}, ...],
                "amenities": ["bedroom", "seating", ...],
                "room_type": "bedroom",
                "guidance": "Good! Move to kitchen",
                "stats": {"total_objects": 5, "confidence_avg": 0.85}
            }
        """
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return self._error_response("Invalid image data")

            # Run YOLO detection
            results = self.model(image, conf=self.confidence_threshold, verbose=False)[0]

            # Extract detections
            objects = []
            detected_classes = []

            for box in results.boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = results.names[cls_id]

                # Bounding box coordinates
                x1, y1, x2, y2 = [int(coord) for coord in box.xyxy[0].tolist()]

                objects.append({
                    "class": class_name,
                    "confidence": round(confidence, 2),
                    "bbox": [x1, y1, x2, y2]
                })

                detected_classes.append(class_name)

            # Extract amenities for pricing
            amenities = self._extract_amenities(detected_classes)

            # Infer room type
            room_type = self._infer_room_type(set(detected_classes))

            # Generate user guidance
            guidance = self._generate_guidance(room_type, len(objects))

            # Stats
            avg_conf = sum(obj["confidence"] for obj in objects) / len(objects) if objects else 0

            return {
                "success": True,
                "objects": objects,
                "amenities": sorted(list(set(amenities))),
                "room_type": room_type,
                "guidance": guidance,
                "stats": {
                    "total_objects": len(objects),
                    "unique_objects": len(set(detected_classes)),
                    "confidence_avg": round(avg_conf, 2)
                }
            }

        except Exception as e:
            return self._error_response(str(e))

    def _extract_amenities(self, detected_classes: List[str]) -> List[str]:
        """
        Convert detected COCO objects to listing amenities
        """
        amenities = []

        for obj_class in detected_classes:
            if obj_class in self.amenity_map:
                amenities.extend(self.amenity_map[obj_class])

        # Count-based amenities
        class_counts = Counter(detected_classes)

        if class_counts["bed"] >= 2:
            amenities.append("multiple bedrooms")

        if class_counts["chair"] >= 4:
            amenities.append("dining area (seats 4+)")

        # Combination amenities
        if "couch" in detected_classes and "tv" in detected_classes:
            amenities.append("entertainment center")

        if "desk" in detected_classes and "chair" in detected_classes:
            amenities.append("home office")

        return amenities

    def _infer_room_type(self, detected_classes: Set[str]) -> str:
        """
        Infer room type from detected objects
        """
        room_scores = {}

        for room_type, indicators in self.room_indicators.items():
            matches = sum(1 for obj in indicators if obj in detected_classes)
            if matches > 0:
                room_scores[room_type] = matches

        if room_scores:
            return max(room_scores, key=room_scores.get)

        return "general_space"

    def _generate_guidance(self, room_type: str, object_count: int) -> str:
        """
        Generate real-time guidance for user
        """
        if object_count == 0:
            return "⚠️ No objects detected - move closer or improve lighting"
        elif object_count < 3:
            return "🔄 Keep scanning - need more detail"
        elif room_type == "general_space":
            return "📸 Keep moving - scanning property"
        else:
            return f"✅ Good! {room_type.replace('_', ' ').title()} captured"

    def _error_response(self, error_msg: str) -> Dict[str, Any]:
        """
        Return error response structure
        """
        return {
            "success": False,
            "error": error_msg,
            "objects": [],
            "amenities": [],
            "room_type": "unknown",
            "guidance": "Error occurred",
            "stats": {"total_objects": 0}
        }
