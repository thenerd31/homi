/**
 * AROverlayRenderer.ts
 *
 * Displays detection results as on-screen text overlays
 * Simplified version - shows detected objects as list on screen
 *
 * Setup in Lens Studio:
 * 1. Add this script to a SceneObject
 * 2. Assign Text component for displaying detections
 */

import { Config } from "./Config";

@component
export class AROverlayRenderer extends BaseScriptComponent {

    // ============================================================================
    // INSPECTOR INPUTS
    // ============================================================================

    @input
    @hint("Text component for displaying detected objects")
    detectionsText: Text;


    // ============================================================================
    // PRIVATE PROPERTIES
    // ============================================================================

    private currentDetections: any[] = [];
    private clearTimer: DelayedCallbackEvent;


    // ============================================================================
    // LIFECYCLE
    // ============================================================================

    onAwake() {
        Config.log("AROverlayRenderer initialized");

        if (!this.detectionsText) {
            Config.logError("Detections text not assigned!");
            return;
        }

        // Create timer for auto-clearing overlays
        this.clearTimer = this.createEvent("DelayedCallbackEvent");
        this.clearTimer.bind(this.clearOverlays.bind(this));

        // Initialize
        this.clearOverlays();
    }


    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Render detection results
     */
    renderDetections(result: any): void {
        if (!result || !result.objects) {
            return;
        }

        Config.log(`Rendering ${result.objects.length} detections`);

        // Filter by confidence
        this.currentDetections = result.objects.filter(
            (obj: any) => obj.confidence >= Config.MIN_CONFIDENCE
        );

        // Update display
        this.updateDisplay();

        // Auto-clear after lifetime
        this.clearTimer.reset(Config.OVERLAY_LIFETIME_SEC);
    }


    private updateDisplay(): void {
        if (!this.detectionsText) {
            return;
        }

        if (this.currentDetections.length === 0) {
            this.detectionsText.text = "";
            return;
        }

        // Build detection list
        let displayText = "🎯 Detected:\n";

        // Show top 8 detections
        const toShow = this.currentDetections.slice(0, 8);

        toShow.forEach((det: any) => {
            const confidence = Math.round(det.confidence * 100);
            const emoji = this.getConfidenceEmoji(det.confidence);
            displayText += `${emoji} ${det.object} ${confidence}%\n`;
        });

        if (this.currentDetections.length > 8) {
            displayText += `... +${this.currentDetections.length - 8} more`;
        }

        this.detectionsText.text = displayText;
    }

    /**
     * Get emoji based on confidence
     */
    private getConfidenceEmoji(confidence: number): string {
        if (confidence > 0.7) {
            return "🟢"; // Green - high confidence
        } else if (confidence > 0.5) {
            return "🟡"; // Yellow - medium
        } else {
            return "🟠"; // Orange - low
        }
    }

    /**
     * Clear all overlays
     */
    private clearOverlays(): void {
        this.currentDetections = [];
        if (this.detectionsText) {
            this.detectionsText.text = "";
        }
    }
}
