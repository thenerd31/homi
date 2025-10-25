"""
YOLOv8 Service - Comprehensive Property Amenity Detection
Used for: Detecting furniture, amenities, features, and property characteristics
Sponsor: Baseten (ML model deployment)

Detects 80+ COCO classes and maps them to 50+ Airbnb-relevant amenities
"""

from ultralytics import YOLO
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Set
from PIL import Image
import io
import os
import base64
from collections import Counter


class YOLOService:
    def __init__(self, model_path: str = "yolov8n.pt"):
        """
        Initialize YOLO model with comprehensive amenity detection

        Args:
            model_path: Path to YOLO model weights
                - "yolov8n.pt" (nano, fastest - good for demo)
                - "yolov8s.pt" (small)
                - "yolov8m.pt" (medium - recommended for accuracy)
                - "yolov8l.pt" (large, most accurate)
        """
        try:
            self.model = YOLO(model_path)
            self.confidence_threshold = float(os.getenv("YOLO_CONFIDENCE", "0.45"))

            # Comprehensive mappings
            self.amenity_map = self._create_amenity_mapping()
            self.room_indicators = self._create_room_indicators()
            self.luxury_indicators = self._create_luxury_indicators()

        except Exception as e:
            print(f"Error initializing YOLO: {e}")
            raise

    def _create_amenity_mapping(self) -> Dict[str, List[str]]:
        """
        Comprehensive mapping of YOLO COCO objects to listing amenities
        Each detected object can map to multiple amenities
        """
        return {
            # === MAJOR FURNITURE ===
            "bed": ["Bedroom", "Comfortable sleeping", "Furniture"],
            "couch": ["Living room", "Comfortable seating", "Lounge area"],
            "chair": ["Seating", "Dining area"],
            "dining table": ["Dining table", "Dining area", "Eat-in kitchen"],
            "toilet": ["Bathroom", "Private bathroom"],
 
            # === KITCHEN APPLIANCES ===
            "refrigerator": ["Full kitchen", "Refrigerator", "Modern appliances"],
            "oven": ["Full kitchen", "Oven", "Cooking facilities"],
            "microwave": ["Microwave", "Kitchen appliances"],
            "toaster": ["Kitchen appliances", "Breakfast amenities"],
            "sink": ["Kitchen sink", "Bathroom facilities"],

            # === ENTERTAINMENT & TECHNOLOGY ===
            "tv": ["TV", "Smart TV", "Entertainment", "Cable TV"],

            # === DECOR & AMBIANCE ===
            "potted plant": ["Indoor plants", "Greenery", "Thoughtful decor", "Natural light"],
            "vase": ["Tasteful decor", "Elegant furnishings"],
            "clock": ["Furnished", "Home essentials"],
            "book": ["Reading materials", "Bookshelf", "Library", "Relaxation area"],
            "teddy bear": ["Family-friendly", "Kids welcome"],

            # === KITCHENWARE & DINING ===
            "bottle": ["Kitchen essentials", "Drinking glasses"],
            "wine glass": ["Wine glasses", "Glassware", "Entertainment-ready"],
            "cup": ["Coffee mugs", "Kitchenware", "Tea & coffee"],
            "bowl": ["Dishware", "Fully equipped kitchen"],
            "knife": ["Cooking utensils", "Full kitchen"],
            "spoon": ["Cutlery", "Dining essentials"],
            "fork": ["Cutlery", "Dining essentials"],

        }

    def _create_room_indicators(self) -> Dict[str, Dict[str, Any]]:
        """
        Enhanced room detection with primary and secondary indicators
        """
        return {
            "bedroom": {
                "primary": ["bed"],  # Must have
                "secondary": ["chair", "clock", "book", "laptop"],  # Nice to have
                "min_primary": 1,
            },
            "bathroom": {
                "primary": ["toilet", "sink"],
                "min_primary": 1,
            },
            "kitchen": {
                "primary": ["refrigerator", "oven", "microwave", "sink"],
                "secondary": ["dining table", "chair", "toaster", "bottle", "bowl"],
                "min_primary": 2,  # At least 2 kitchen appliances
            },
            "living_room": {
                "primary": ["couch", "tv"],
                "secondary": ["chair", "potted plant", "book"],
                "min_primary": 1,
            },
            "dining_room": {
                "primary": ["dining table", "chair"],
                "secondary": ["wine glass", "vase", "potted plant"],
                "min_primary": 2,
            },
            "home_office": {
                "primary": ["desk", "chair"],
                "secondary": ["book"],
                "min_primary": 2,
            },
        }
    

    def _create_luxury_indicators(self) -> Dict[str, float]:
        """
        Objects that indicate luxury/premium property
        Returns weight for quality scoring
        """
        return {
            "wine glass": 8.0,
            "book": 5.0,
            "potted plant": 6.0,
            "vase": 7.0,
            "laptop": 5.0,
            "tv": 4.0,
            "couch": 6.0,
            "dining table": 5.0,
            "bicycle": 4.0,
            "surfboard": 7.0,
            "boat": 10.0,
            "horse": 10.0,
        }

    # def _create_family_indicators(self) -> Set[str]:
    #     """Objects indicating family-friendly property"""
    #     return {
    #         "teddy bear", "sports ball", "frisbee", "bicycle",
    #         "skateboard", "kite", "cake", "donut"
    #     }

    async def detect_amenities_from_image(
        self,
        image_data: bytes,
        image_format: str = "jpeg"
    ) -> Dict[str, Any]:
        """
        Comprehensive object detection and amenity extraction from single image

        Returns rich metadata including:
        - All detected objects with confidence
        - Mapped amenities
        - Room type inference
        - Quality score
        - Property characteristics (luxury, family-friendly, etc.)
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                raise ValueError("Invalid image data")

            # Get image dimensions for context
            height, width = image.shape[:2]
            image_size = {"width": width, "height": height}

            # Run YOLO detection
            results = self.model(image, conf=self.confidence_threshold, verbose=False)

            # Extract detections
            detections = []
            detected_classes = []

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = result.names[cls_id]

                    detected_classes.append(class_name)

                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()

                    # Calculate object size relative to image
                    obj_width = x2 - x1
                    obj_height = y2 - y1
                    relative_size = (obj_width * obj_height) / (width * height)

                    detections.append({
                        "object": class_name,
                        "confidence": round(conf, 3),
                        "bbox": [int(x1), int(y1), int(x2), int(y2)],
                        "relative_size": round(relative_size, 4),
                    })

            # Convert to set for unique objects
            detected_classes_set = set(detected_classes)

            # Map to amenities
            amenities = self._extract_amenities(detected_classes)

            # Infer room type
            room_analysis = self._infer_room_type(detected_classes_set, detected_classes)

            # Calculate quality score
            quality_score = self._calculate_quality_score(
                detected_classes_set,
                detections,
                len(image_data)  # Image file size as quality indicator
            )

            # Property characteristics
            characteristics = self._analyze_characteristics(detected_classes_set)

            return {
                "success": True,
                "image_size": image_size,
                "detections": detections,
                "detected_objects": list(detected_classes_set),
                "object_counts": dict(Counter(detected_classes)),
                "amenities": amenities,
                "room_analysis": room_analysis,
                "quality_score": quality_score,
                "characteristics": characteristics,
                "total_objects": len(detections),
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "detections": [],
                "amenities": [],
            }

    async def detect_amenities_from_multiple_images(
        self,
        images: List[bytes],
        metadata: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Process multiple images and aggregate comprehensive property analysis

        Args:
            images: List of image bytes
            metadata: Optional metadata for each image (e.g., room labels)

        Returns:
            Complete property analysis with room counts, amenities, scoring
        """
        all_detections = []
        all_amenities = set()
        room_analyses = []
        quality_scores = []
        all_characteristics = []
        all_object_counts = Counter()

        for idx, image_data in enumerate(images):
            result = await self.detect_amenities_from_image(image_data)

            if result["success"]:
                all_detections.extend(result["detections"])
                all_amenities.update(result["amenities"])
                room_analyses.append(result["room_analysis"])
                quality_scores.append(result["quality_score"])
                all_characteristics.append(result["characteristics"])
                all_object_counts.update(result["object_counts"])

        # Aggregate room detection
        rooms = self._aggregate_room_detection(room_analyses)

        # Property type inference
        property_type = self._infer_property_type(all_object_counts, rooms)

        # Overall quality
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 50

        # Aggregate characteristics
        final_characteristics = self._aggregate_characteristics(all_characteristics)

        # Generate title suggestions based on findings
        title_keywords = self._generate_title_keywords(
            rooms,
            list(all_amenities),
            final_characteristics
        )

        return {
            "success": True,
            "total_images_processed": len(images),
            "total_detections": len(all_detections),
            "unique_objects_found": len(all_object_counts),
            "object_counts": dict(all_object_counts),
            "amenities": sorted(list(all_amenities)),
            "rooms": rooms,
            "property_type": property_type,
            "quality_score": round(avg_quality, 1),
            "characteristics": final_characteristics,
            "title_keywords": title_keywords,
            "suggested_price_multiplier": self._calculate_price_multiplier(
                avg_quality,
                final_characteristics
            ),
        }

    def _extract_amenities(self, detected_classes: List[str]) -> List[str]:
        """Convert detected objects to comprehensive amenity list"""
        amenities = set()

        for obj in detected_classes:
            if obj in self.amenity_map:
                amenities.update(self.amenity_map[obj])

        # Inferred amenities based on combinations
        detected_set = set(detected_classes)

        if "couch" in detected_set and "tv" in detected_set:
            amenities.add("Entertainment center")

        if "laptop" in detected_set and "chair" in detected_set:
            amenities.add("Work from home ready")

        if "bed" in detected_set and detected_classes.count("bed") >= 2:
            amenities.add("Multiple bedrooms")

        if "potted plant" in detected_set and detected_classes.count("potted plant") >= 3:
            amenities.add("Lots of greenery")

        if any(obj in detected_set for obj in ["wine glass", "vase", "book"]):
            amenities.add("Thoughtfully decorated")

        if "dog" in detected_set or "cat" in detected_set:
            amenities.add("Pet-friendly")

        return list(amenities)

    def _infer_room_type(
        self,
        detected_classes_set: Set[str],
        detected_classes_list: List[str]
    ) -> Dict[str, Any]:
        """
        Enhanced room type inference with confidence scoring
        """
        room_scores = {}

        for room_type, indicators in self.room_indicators.items():
            primary_matches = sum(
                1 for obj in indicators["primary"]
                if obj in detected_classes_set
            )
            secondary_matches = sum(
                1 for obj in indicators["secondary"]
                if obj in detected_classes_set
            )

            # Must meet minimum primary requirement
            if primary_matches >= indicators["min_primary"]:
                score = (primary_matches * 3) + secondary_matches
                room_scores[room_type] = score

        if room_scores:
            best_match = max(room_scores, key=room_scores.get)
            confidence = min(room_scores[best_match] / 10.0, 1.0)

            return {
                "room_type": best_match,
                "confidence": round(confidence, 2),
                "all_matches": room_scores,
            }

        return {
            "room_type": "general_space",
            "confidence": 0.3,
            "all_matches": {},
        }

    def _aggregate_room_detection(
        self,
        room_analyses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Aggregate room detections across all images"""
        room_counts = Counter()

        for analysis in room_analyses:
            if analysis["confidence"] >= 0.5:
                room_counts[analysis["room_type"]] += 1

        return {
            "bedrooms": room_counts.get("bedroom", 0),
            "bathrooms": room_counts.get("bathroom", 0),
            "has_kitchen": room_counts.get("kitchen", 0) > 0,
            "has_living_room": room_counts.get("living_room", 0) > 0,
            "has_dining_room": room_counts.get("dining_room", 0) > 0,
            "has_office": room_counts.get("home_office", 0) > 0,
            "has_outdoor_space": room_counts.get("outdoor_space", 0) > 0,
            "has_garage": room_counts.get("garage", 0) > 0,
            "total_rooms": sum(room_counts.values()),
            "room_breakdown": dict(room_counts),
        }

    def _calculate_quality_score(
        self,
        detected_classes: Set[str],
        detections: List[Dict],
        image_size_bytes: int
    ) -> float:
        """
        Comprehensive quality scoring (0-100)
        Factors: luxury items, variety, photo quality, furnishing level
        """
        score = 40.0  # Base score

        # Luxury item bonus
        for obj in detected_classes:
            if obj in self.luxury_indicators:
                score += self.luxury_indicators[obj]

        # Variety bonus (well-furnished)
        unique_items = len(detected_classes)
        score += min(unique_items * 1.5, 25)

        # Photo quality (confidence + image size)
        if detections:
            avg_confidence = sum(d["confidence"] for d in detections) / len(detections)
            score += avg_confidence * 8

        # Large, clear photo bonus
        if image_size_bytes > 500_000:  # > 500KB
            score += 5

        # Deductions for sparse rooms
        if unique_items < 3:
            score -= 15

        return min(max(score, 0), 100.0)

    def _analyze_characteristics(self, detected_classes: Set[str]) -> Dict[str, bool]:
        """Analyze property characteristics"""
        return {
            "luxury": any(obj in self.luxury_indicators for obj in detected_classes),
            "work_friendly": "desk" in detected_classes or "chair" in detected_classes,
            "entertainment_ready": "tv" in detected_classes,
            # "outdoor_space": any(obj in ["bench", "umbrella", "bicycle", "car"] for obj in detected_classes),
            # "mountain_nearby": "skis" in detected_classes or "snowboard" in detected_classes,
            "well_decorated": any(obj in ["potted plant", "vase", "book"] for obj in detected_classes),
        }

    def _aggregate_characteristics(
        self,
        all_characteristics: List[Dict[str, bool]]
    ) -> Dict[str, bool]:
        """Aggregate characteristics across all images"""
        if not all_characteristics:
            return {}

        # A characteristic is true if it appears in ANY image
        aggregated = {}
        for key in all_characteristics[0].keys():
            aggregated[key] = any(char[key] for char in all_characteristics)

        return aggregated

    def _infer_property_type(
        self,
        object_counts: Counter,
        rooms: Dict[str, Any]
    ) -> str:
        """Infer property type based on detected features"""
        if rooms["has_outdoor_space"] and rooms["bedrooms"] >= 3:
            return "Entire house"
        elif rooms["bedrooms"] >= 2:
            return "Entire apartment"
        elif rooms["bedrooms"] == 1:
            return "Private room" if not rooms["has_kitchen"] else "Studio apartment"
        elif rooms["has_office"] and not rooms["bedrooms"]:
            return "Office space"
        else:
            return "Room"

    def _generate_title_keywords(
        self,
        rooms: Dict[str, Any],
        amenities: List[str],
        characteristics: Dict[str, bool]
    ) -> List[str]:
        """Generate keywords for AI title generation"""
        keywords = []

        # Room-based keywords
        if rooms["bedrooms"] >= 3:
            keywords.append("Spacious")
        if rooms["has_outdoor_space"]:
            keywords.append("Outdoor space")
        if rooms["has_garage"]:
            keywords.append("Parking")

        # Characteristic keywords
        if characteristics.get("luxury"):
            keywords.extend(["Luxury", "Premium", "Upscale"])
        if characteristics.get("work_friendly"):
            keywords.append("Work-from-home ready")
        if characteristics.get("family_friendly"):
            keywords.append("Family-friendly")

        return keywords

    def _calculate_price_multiplier(
        self,
        quality_score: float,
        characteristics: Dict[str, bool]
    ) -> float:
        """
        Calculate price multiplier based on quality and features
        Range: 0.7 to 2.0
        """
        multiplier = 1.0

        # Quality-based adjustment
        if quality_score >= 80:
            multiplier += 0.4
        elif quality_score >= 60:
            multiplier += 0.2
        elif quality_score < 40:
            multiplier -= 0.3

        # Feature bonuses
        if characteristics.get("luxury"):
            multiplier += 0.3
        if characteristics.get("beach_nearby") or characteristics.get("mountain_nearby"):
            multiplier += 0.2
        if characteristics.get("outdoor_space"):
            multiplier += 0.15
        if characteristics.get("work_friendly"):
            multiplier += 0.1

        return round(max(0.7, min(multiplier, 2.0)), 2)

    async def select_best_photos(
        self,
        images_with_results: List[Dict[str, Any]],
        max_photos: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Intelligently select best photos prioritizing:
        1. Room variety (bedroom, kitchen, bathroom, living room)
        2. Quality score
        3. Unique content
        """
        # Categorize by room type
        room_photos = {}
        general_photos = []

        for img in images_with_results:
            room_type = img.get("room_analysis", {}).get("room_type", "general_space")
            confidence = img.get("room_analysis", {}).get("confidence", 0)

            if confidence >= 0.5:
                if room_type not in room_photos:
                    room_photos[room_type] = []
                room_photos[room_type].append(img)
            else:
                general_photos.append(img)

        # Select best from each room category
        selected = []
        priority_rooms = ["bedroom", "kitchen", "bathroom", "living_room", "outdoor_space"]

        for room in priority_rooms:
            if room in room_photos and len(selected) < max_photos:
                # Get highest quality photo from this room
                best = max(room_photos[room], key=lambda x: x.get("quality_score", 0))
                selected.append(best)

        # Fill remaining slots with highest quality photos
        remaining = [img for img in images_with_results if img not in selected]
        remaining_sorted = sorted(remaining, key=lambda x: x.get("quality_score", 0), reverse=True)
        selected.extend(remaining_sorted[:max_photos - len(selected)])

        return selected[:max_photos]

    def annotate_image(
        self,
        image_data: bytes,
        detections: List[Dict[str, Any]]
    ) -> bytes:
        """
        Draw bounding boxes and labels on image for demo/debugging
        """
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            for det in detections:
                x1, y1, x2, y2 = [int(v) for v in det["bbox"]]
                label = f"{det['object']} ({det['confidence']:.2f})"

                # Color based on confidence
                confidence = det["confidence"]
                if confidence > 0.7:
                    color = (0, 255, 0)  # Green - high confidence
                elif confidence > 0.5:
                    color = (0, 255, 255)  # Yellow - medium
                else:
                    color = (0, 165, 255)  # Orange - lower

                cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

                # Label background
                (label_width, label_height), _ = cv2.getTextSize(
                    label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
                )
                cv2.rectangle(
                    image,
                    (x1, y1 - label_height - 10),
                    (x1 + label_width, y1),
                    color,
                    -1
                )

                # Label text
                cv2.putText(
                    image, label, (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1
                )

            _, buffer = cv2.imencode('.jpg', image)
            return buffer.tobytes()

        except Exception as e:
            print(f"Error annotating image: {e}")
            return image_data

