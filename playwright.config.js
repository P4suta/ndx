import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'test/e2e',
	webServer: {
		command: 'bun run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
	},
	use: {
		baseURL: 'http://localhost:5173',
	},
	projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
