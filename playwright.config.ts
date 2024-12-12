import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2eTests', // Directory for Playwright tests
  timeout: 5 * 1000, // Maximum test timeout
  use: {
    headless: true, // Run tests in headless mode
    baseURL: 'http://localhost:5173', // Update to your app's base URL
  },
  webServer: {
    command: 'npm run dev', // Command to start the app
    port: 5173, // Port to access the app
    timeout: 120 * 1000, // Maximum wait time for the server
    reuseExistingServer: !process.env.CI, // Reuse server in local dev
  },
});
