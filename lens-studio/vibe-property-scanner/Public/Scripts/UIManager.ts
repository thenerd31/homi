/**
 * UIManager.ts
 *
 * Manages all UI text displays for the scanner
 *
 * Setup in Lens Studio:
 * 1. Create ScreenText objects in scene
 * 2. Add this script to a SceneObject
 * 3. Assign all Text components in inspector
 */

import { Config } from "./Config";

@component
export class UIManager extends BaseScriptComponent {

    // ============================================================================
    // INSPECTOR INPUTS
    // ============================================================================

    @input
    @hint("Text for capture count")
    captureCountText: Text;

    @input
    @hint("Text for status")
    statusText: Text;

    @input
    @hint("Text for amenities list")
    amenitiesText: Text;

    @input
    @hint("Text for room detection")
    roomText: Text;

    @input
    @hint("Text for connection status")
    connectionText: Text;

    @input
    @hint("Text for error messages")
    errorText: Text;


    // ============================================================================
    // LIFECYCLE
    // ============================================================================

    onAwake() {
        Config.log("UIManager initialized");

        // Initialize text displays
        this.updateCaptureCount(0);
        this.updateStatus("Initializing...");
        this.updateConnection("Checking...");
        this.hideError();
    }


    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Update capture count display
     */
    updateCaptureCount(count: number): void {
        if (this.captureCountText) {
            this.captureCountText.text = `📸 ${count}`;
        }
    }

    /**
     * Update status text
     */
    updateStatus(status: string): void {
        if (this.statusText) {
            this.statusText.text = status;
        }
    }

    /**
     * Update connection status
     */
    updateConnection(status: string): void {
        if (this.connectionText) {
            this.connectionText.text = status;
        }
    }

    /**
     * Update with detection result
     */
    updateDetection(result: any, allAmenities: string[]): void {
        // Update room
        if (this.roomText && result.room_type) {
            const roomName = this.formatRoomName(result.room_type);
            this.roomText.text = `🏠 ${roomName}`;
        }

        // Update amenities
        if (this.amenitiesText) {
            if (allAmenities.length === 0) {
                this.amenitiesText.text = "Scanning...";
            } else {
                const display = allAmenities.slice(0, 3).join(", ");
                const more = allAmenities.length > 3 ? ` +${allAmenities.length - 3}` : "";
                this.amenitiesText.text = `✨ ${display}${more}`;
            }
        }
    }

    /**
     * Show scan summary
     */
    showSummary(analysis: any, captures: number, duration: number): void {
        let summary = `✅ Complete!\n`;
        summary += `${captures} captures, ${duration.toFixed(0)}s\n`;

        if (analysis) {
            summary += `${analysis.property_type}\n`;

            if (analysis.rooms) {
                summary += `${analysis.rooms.bedrooms} bed, ${analysis.rooms.bathrooms} bath\n`;
            }

            if (analysis.amenities) {
                summary += `${analysis.amenities.length} amenities\n`;
            }

            if (analysis.quality_score) {
                summary += `Quality: ${analysis.quality_score}/100`;
            }
        }

        this.updateStatus(summary);
    }

    /**
     * Show error message
     */
    showError(message: string): void {
        if (this.errorText) {
            this.errorText.text = `⚠️ ${message}`;
            this.errorText.enabled = true;
        }

        // Auto-hide after 5 seconds
        const hideDelay = this.createEvent("DelayedCallbackEvent");
        hideDelay.bind(this.hideError.bind(this));
        hideDelay.reset(5.0);
    }

    /**
     * Hide error message
     */
    hideError(): void {
        if (this.errorText) {
            this.errorText.enabled = false;
        }
    }


    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================

    /**
     * Format room name for display
     */
    private formatRoomName(roomType: string): string {
        return roomType
            .replace(/_/g, " ")
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
}
