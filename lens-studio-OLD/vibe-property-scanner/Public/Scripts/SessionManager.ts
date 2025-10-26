/**
 * SessionManager.ts
 *
 * Orchestrates the entire scanning session
 * Coordinates camera capture, network requests, UI updates, and AR overlays
 *
 * Setup in Lens Studio:
 * 1. Add this script to a SceneObject
 * 2. Assign all required script references in inspector
 * 3. Session auto-starts when lens opens
 */

import { Config } from "./Config";
import { CameraCapture } from "./CameraCapture";
import { NetworkManager } from "./NetworkManager";
import { UIManager } from "./UIManager";
import { AROverlayRenderer } from "./AROverlayRenderer";

@component
export class SessionManager extends BaseScriptComponent {

    // ============================================================================
    // INSPECTOR INPUTS
    // ============================================================================

    @input
    @hint("CameraCapture script reference")
    cameraCapture: CameraCapture;

    @input
    @hint("NetworkManager script reference")
    networkManager: NetworkManager;

    @input
    @hint("UIManager script reference")
    uiManager: UIManager;

    @input
    @hint("AROverlayRenderer script reference (optional)")
    arOverlayRenderer: AROverlayRenderer;


    // ============================================================================
    // PRIVATE PROPERTIES
    // ============================================================================

    private isSessionActive: boolean = false;
    private captureTimer: DelayedCallbackEvent;
    private totalCapturesSent: number = 0;
    private detectedAmenities: Set<string> = new Set();
    private sessionStartTime: number = 0;


    // ============================================================================
    // LIFECYCLE
    // ============================================================================

    onAwake() {
        Config.log("SessionManager initialized");

        // Validate inputs
        if (!this.cameraCapture) {
            Config.logError("CameraCapture not assigned!");
            return;
        }

        if (!this.networkManager) {
            Config.logError("NetworkManager not assigned!");
            return;
        }

        // UIManager and ARRenderer are optional
        if (!this.uiManager) {
            Config.log("UIManager not assigned - running without UI");
        }

        if (!this.arOverlayRenderer) {
            Config.log("ARRenderer not assigned - running without AR overlays");
        }

        // Create capture timer
        this.captureTimer = this.createEvent("DelayedCallbackEvent");
        this.captureTimer.bind(this.onCaptureTimer.bind(this));

        // Start session after short delay
        const startDelay = this.createEvent("DelayedCallbackEvent");
        startDelay.bind(this.startSession.bind(this));
        startDelay.reset(0.5);
    }


    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Start scanning session
     */
    startSession(): void {
        if (this.isSessionActive) {
            Config.log("Session already active");
            return;
        }

        Config.log("Starting scan session...");
        this.sessionStartTime = getTime();

        // Update UI (optional)
        if (this.uiManager) {
            this.uiManager.updateStatus("Starting session...");
        }

        // Start backend session
        this.networkManager.startSession((sessionId: string | null) => {
            if (!sessionId) {
                Config.logError("Failed to start session");
                if (this.uiManager) {
                    this.uiManager.showError("Failed to start session");
                }
                return;
            }

            // Session started successfully
            this.isSessionActive = true;
            this.totalCapturesSent = 0;
            this.detectedAmenities.clear();
            this.cameraCapture.resetCount();

            Config.log(`✅ Session started: ${sessionId}`);
            if (this.uiManager) {
                this.uiManager.updateStatus("🔄 Scanning...");
                this.uiManager.updateConnection("✅ Connected");
            }

            // Start capture loop
            this.captureTimer.reset(Config.CAPTURE_INTERVAL_SEC);
        });
    }

    /**
     * Stop scanning session
     */
    stopSession(): void {
        if (!this.isSessionActive) {
            Config.log("No active session");
            return;
        }

        Config.log("Stopping session...");
        this.isSessionActive = false;

        // Stop capture timer
        this.captureTimer.cancel();

        // Update UI (optional)
        if (this.uiManager) {
            this.uiManager.updateStatus("Finalizing...");
        }

        // Finalize backend session
        this.networkManager.finalizeSession((analysis: any) => {
            if (analysis) {
                const duration = getTime() - this.sessionStartTime;
                Config.log(`✅ Session completed (${duration.toFixed(1)}s)`);
                Config.log(`Analysis: ${JSON.stringify(analysis)}`);

                if (this.uiManager) {
                    this.uiManager.showSummary(analysis, this.totalCapturesSent, duration);
                }
            } else {
                Config.logError("Failed to finalize session");
                if (this.uiManager) {
                    this.uiManager.showError("Failed to finalize session");
                }
            }
        });
    }


    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================

    /**
     * Called every CAPTURE_INTERVAL_SEC seconds
     */
    private onCaptureTimer(): void {
        if (!this.isSessionActive) {
            return;
        }

        Config.log("Capture timer triggered");

        // Capture and encode image
        this.cameraCapture.captureAndEncode((base64: string | null, timestamp: string) => {
            if (!base64) {
                Config.logError("Capture failed");
                // Retry next interval
                this.captureTimer.reset(Config.CAPTURE_INTERVAL_SEC);
                return;
            }

            this.totalCapturesSent++;

            // Update UI with progress (optional)
            if (this.uiManager) {
                this.uiManager.updateCaptureCount(this.totalCapturesSent);
            }

            // Send to backend for detection
            this.networkManager.sendForDetection(base64, timestamp, (result: any) => {
                if (result) {
                    this.onDetectionResult(result);
                } else {
                    Config.logError("Detection failed");
                }

                // Schedule next capture
                if (this.isSessionActive) {
                    this.captureTimer.reset(Config.CAPTURE_INTERVAL_SEC);
                }
            });
        });
    }

    /**
     * Handle detection result
     */
    private onDetectionResult(result: any): void {
        Config.log(`Detection received: ${result.total_objects} objects`);

        // Update amenities tracking
        if (result.amenities) {
            result.amenities.forEach((amenity: string) => {
                this.detectedAmenities.add(amenity);
            });
        }

        // Update UI (optional)
        if (this.uiManager) {
            this.uiManager.updateDetection(result, Array.from(this.detectedAmenities));
        }

        // Update AR overlays (optional)
        if (this.arOverlayRenderer) {
            this.arOverlayRenderer.renderDetections(result);
        }
    }
}
