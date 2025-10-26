/**
 * VIBE Property Scanner Configuration
 * Pure configuration class - no @component decorator needed
 */

export class Config {

    static readonly BACKEND_BASE_URL: string = "http://172.16.224.126:8000";

    /**
     * API Endpoints
     */
    static readonly ENDPOINTS = {
        SCAN_SESSION: "/api/spectacles/scan-session",
        DETECT: "/api/spectacles/detect",
        FINALIZE: "/api/spectacles/finalize",
        HEALTH: "/health"
    };

    // Capture interval in seconds (for DelayedCallbackEvent)
    static readonly CAPTURE_INTERVAL_SEC: number = 2.0;

    // JPEG quality (0.0 - 1.0)
    static readonly JPEG_QUALITY: number = 0.85;

    // Minimum confidence to display overlays
    static readonly MIN_CONFIDENCE: number = 0.50;

    // Overlay lifetime in seconds
    static readonly OVERLAY_LIFETIME_SEC: number = 3.0;

    // Network timeout in milliseconds
    static readonly REQUEST_TIMEOUT_MS: number = 10000;

    // Retry settings
    static readonly MAX_RETRIES: number = 2;
    static readonly RETRY_DELAY_MS: number = 1000;

    // Debug logging
    static readonly DEBUG: boolean = true;

    static log(message: string): void {
        if (this.DEBUG) {
            print(`[VIBE] ${message}`);
        }
    }

    static logError(message: string, error?: any): void {
        print(`[VIBE ERROR] ${message}`);
        if (error) {
            print(error);
        }
    }

    static logDetection(result: any): void {
        if (this.DEBUG) {
            this.log(`Detected ${result.total_objects} objects, room: ${result.room_type}`);
        }
    }
}
