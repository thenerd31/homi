/**
 * CameraCapture.ts
 *
 * Captures high-resolution images from Spectacles camera every 2 seconds
 *
 * Setup in Lens Studio:
 * 1. Add Camera Module to your project (Project Settings → Modules → Camera Module)
 * 2. Add this script to a SceneObject
 * 3. Assign Camera Module in inspector
 * 4. SessionManager will call captureAndEncode() periodically
 */

import { Config } from "./Config";

@component
export class CameraCapture extends BaseScriptComponent {

    // ============================================================================
    // INSPECTOR INPUTS
    // ============================================================================

    @input
    @hint("Camera Module from Project Settings")
    cameraModule: CameraModule;


    // ============================================================================
    // PRIVATE PROPERTIES
    // ============================================================================

    private captureCount: number = 0;
    private isCapturing: boolean = false;
    private lastCaptureTexture: Texture | null = null;


    // ============================================================================
    // LIFECYCLE
    // ============================================================================

    onAwake() {
        Config.log("CameraCapture initialized");

        if (!this.cameraModule) {
            Config.logError("CameraModule not assigned! Add it in Project Settings → Modules");
            return;
        }

        Config.log("CameraModule ready");
    }


    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Capture image and encode to base64
     * Returns base64 string via callback
     */
    async captureAndEncode(callback: (base64: string | null, timestamp: string) => void): Promise<void> {
        try {
            Config.log(`Capturing frame ${this.captureCount + 1}...`);

            // Create image request for high-res capture (3200x2400)
            const imageRequest = CameraModule.createImageRequest();

            // Request image from camera
            const imageFrame = await this.cameraModule.requestImage(imageRequest);

            if (!imageFrame || !imageFrame.texture) {
                Config.logError("Failed to capture image");
                callback(null, new Date().toISOString());
                return;
            }

            Config.log(`Image captured: ${imageFrame.texture.getWidth()}x${imageFrame.texture.getHeight()}`);

            this.lastCaptureTexture = imageFrame.texture;
            this.captureCount++;

            // Encode texture to base64 using callback-based API
            const base64String = await new Promise<string>((resolve, reject) => {
                Base64.encodeTextureAsync(
                    imageFrame.texture,
                    (encoded: string) => resolve(encoded),        // Success callback
                    () => reject(new Error("Encoding failed")),   // Failure callback
                    CompressionQuality.HighQuality,               // Quality
                    EncodingType.Jpg                              // JPEG format
                );
            });

            Config.log(`Frame ${this.captureCount} encoded (${base64String.length} chars)`);

            // Return via callback
            const timestamp = new Date().toISOString();
            callback(base64String, timestamp);

        } catch (error) {
            Config.logError("Error during capture:", error);
            callback(null, new Date().toISOString());
        }
    }

    /**
     * Get total captures
     */
    getCaptureCount(): number {
        return this.captureCount;
    }

    /**
     * Reset capture count
     */
    resetCount(): void {
        this.captureCount = 0;
    }

    /**
     * Get last captured texture (for display/preview)
     */
    getLastTexture(): Texture | null {
        return this.lastCaptureTexture;
    }
}
