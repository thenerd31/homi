/**
 * NetworkManager.ts
 *
 * Handles all HTTP communication with backend using InternetModule
 *
 * Setup in Lens Studio:
 * 1. Add Internet Module to project (Project Settings → Modules → Internet Module)
 * 2. Add this script to a SceneObject
 * 3. Assign Internet Module in inspector
 */

import { Config } from "./Config";

@component
export class NetworkManager extends BaseScriptComponent {

    // ============================================================================
    // INSPECTOR INPUTS
    // ============================================================================

    @input
    @hint("Internet Module from Project Settings")
    internetModule: InternetModule;


    // ============================================================================
    // PRIVATE PROPERTIES
    // ============================================================================

    private currentSessionId: string | null = null;
    private requestCount: number = 0;
    private successCount: number = 0;
    private errorCount: number = 0;


    // ============================================================================
    // LIFECYCLE
    // ============================================================================

    onAwake() {
        Config.log("NetworkManager initialized");

        if (!this.internetModule) {
            Config.logError("InternetModule not assigned! Add it in Project Settings → Modules");
            return;
        }

        // Test backend connection
        this.testConnection();
    }


    // ============================================================================
    // PUBLIC METHODS - SESSION
    // ============================================================================

    /**
     * Start new scan session
     */
    async startSession(callback: (sessionId: string | null) => void): Promise<void> {
        try {
            Config.log("Starting scan session...");

            const url = `${Config.BACKEND_BASE_URL}${Config.ENDPOINTS.SCAN_SESSION}`;

            const body = JSON.stringify({
                user_id: "spectacles_user",
                property_address: "Property Scan"
            });

            const request = new Request(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body
            });

            const response = await this.internetModule.fetch(request);

            if (response.status === 200) {
                const text = await response.text();
                const data = JSON.parse(text);

                if (data.success && data.session_id) {
                    this.currentSessionId = data.session_id;
                    Config.log(`Session started: ${this.currentSessionId}`);
                    callback(this.currentSessionId);
                } else {
                    Config.logError("Session creation failed", data);
                    callback(null);
                }
            } else {
                Config.logError(`HTTP ${response.status}`);
                callback(null);
            }

        } catch (error) {
            Config.logError("Error starting session:", error);
            callback(null);
        }
    }

    /**
     * Send image for detection
     */
    async sendForDetection(
        imageBase64: string,
        timestamp: string,
        callback: (result: any) => void
    ): Promise<void> {
        try {
            this.requestCount++;
            Config.log(`Sending detection request ${this.requestCount}...`);

            const url = `${Config.BACKEND_BASE_URL}${Config.ENDPOINTS.DETECT}`;

            const body = JSON.stringify({
                image_base64: imageBase64,
                session_id: this.currentSessionId,
                timestamp: timestamp
            });

            const request = new Request(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body
            });

            const response = await this.internetModule.fetch(request);

            if (response.status === 200) {
                const text = await response.text();
                const data = JSON.parse(text);

                if (data.success) {
                    this.successCount++;
                    Config.logDetection(data);
                    callback(data);
                } else {
                    this.errorCount++;
                    Config.logError("Detection failed", data);
                    callback(null);
                }
            } else {
                this.errorCount++;
                Config.logError(`HTTP ${response.status}`);
                callback(null);
            }

        } catch (error) {
            this.errorCount++;
            Config.logError("Error sending detection:", error);
            callback(null);
        }
    }

    /**
     * Finalize session
     */
    async finalizeSession(callback: (analysis: any) => void): Promise<void> {
        if (!this.currentSessionId) {
            Config.logError("No active session");
            callback(null);
            return;
        }

        try {
            Config.log(`Finalizing session: ${this.currentSessionId}`);

            const url = `${Config.BACKEND_BASE_URL}${Config.ENDPOINTS.FINALIZE}`;

            const body = JSON.stringify({
                session_id: this.currentSessionId
            });

            const request = new Request(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body
            });

            const response = await this.internetModule.fetch(request);

            if (response.status === 200) {
                const text = await response.text();
                const data = JSON.parse(text);

                if (data.success) {
                    Config.log("Session finalized");
                    this.currentSessionId = null;
                    callback(data.analysis);
                } else {
                    Config.logError("Finalize failed", data);
                    callback(null);
                }
            } else {
                Config.logError(`HTTP ${response.status}`);
                callback(null);
            }

        } catch (error) {
            Config.logError("Error finalizing:", error);
            callback(null);
        }
    }


    // ============================================================================
    // PUBLIC METHODS - INFO
    // ============================================================================

    /**
     * Get network statistics
     */
    getStats(): any {
        return {
            totalRequests: this.requestCount,
            successfulRequests: this.successCount,
            failedRequests: this.errorCount,
            successRate: this.requestCount > 0 ? (this.successCount / this.requestCount) * 100 : 0
        };
    }

    /**
     * Get current session ID
     */
    getSessionId(): string | null {
        return this.currentSessionId;
    }


    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================

    /**
     * Test backend connection
     */
    private async testConnection(): Promise<void> {
        try {
            Config.log("Testing backend connection...");

            const url = `${Config.BACKEND_BASE_URL}${Config.ENDPOINTS.HEALTH}`;

            const request = new Request(url, {
                method: "GET"
            });

            const response = await this.internetModule.fetch(request);

            if (response.status === 200) {
                Config.log("✅ Backend connected!");
            } else {
                Config.logError(`❌ Backend returned ${response.status}`);
            }

        } catch (error) {
            Config.logError("❌ Backend connection failed:", error);
        }
    }
}
