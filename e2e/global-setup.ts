/**
 * Global setup for Playwright E2E tests
 * Starts the test server before all tests
 */

import type { FullConfig } from "@playwright/test";
import { spawn } from "node:child_process";

async function globalSetup(_config: FullConfig) {
    // Check if server is already running
    try {
        const response = await fetch("http://localhost:3456");
        if (response.ok) {
            console.log("Server already running on port 3456");
            return;
        }
    } catch {
        // Server not running, start it
    }

    console.log("Starting E2E test server...");

    const serverProcess = spawn("bun", ["e2e/server.ts"], {
        stdio: "inherit",
        detached: true,
    });

    serverProcess.unref();

    // Wait for server to be ready
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch("http://localhost:3456");
            if (response.ok) {
                console.log("Server is ready!");
                return;
            }
        } catch {
            // Server not ready yet
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error("Server failed to start within timeout");
}

export default globalSetup;
