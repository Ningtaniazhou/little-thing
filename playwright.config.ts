import { defineConfig } from '@playwright/test';

const sizes = [[320,568],[375,667],[390,844],[430,932],[768,1024],[1280,800],[1440,900]];
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 150_000,
  expect: { timeout: 20_000, toHaveScreenshot: { maxDiffPixelRatio: .015 } },
  fullyParallel: true,
  workers: 2,
  retries: 0,
  outputDir: 'test-results',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', {outputFile:'test-results/results.json'}]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4320',
    screenshot: 'only-on-failure', trace: 'retain-on-failure', video: 'retain-on-failure',
    reducedMotion: 'reduce', deviceScaleFactor: 1,
  },
  projects: (['chromium', 'firefox', 'webkit'] as const).flatMap(browserName => sizes.map(([width,height]) => ({
    name: `${browserName}-${width}x${height}`,
    use: { browserName, viewport: {width,height}, ...(browserName === "chromium" ? {channel:"chromium", launchOptions:{args:process.platform === "darwin" ? ["--use-angle=metal"] : []}} : {}) },
  }))),
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run start -- --hostname 127.0.0.1 --port 4320',
    url: 'http://127.0.0.1:4320/3d', reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
