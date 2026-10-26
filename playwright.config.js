import { defineConfig } from '@playwright/test'

// Every test process can run on its own port (PLAYWRIGHT_PORT) so several
// spec files can be verified concurrently, each against its own `vite
// preview` instance. Run `npm run build` first: preview serves dist/.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4300)
const artifactDir = `tmp/playwright-${port}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  reporter: [['list']],
  outputDir: `${artifactDir}/results`,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1366, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: true,
    timeout: 60000,
  },
})
