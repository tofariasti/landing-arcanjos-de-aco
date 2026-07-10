import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const previewDir = path.join(root, 'assets/img/previews');
const screenshotDir = path.join(root, 'screenshots');
const port = 9876;
const baseUrl = `http://127.0.0.1:${port}`;

const versions = [
  { slug: 'v1-raca', preview: 'v1.png' },
  { slug: 'v2-territorio', preview: 'v2.png' },
  { slug: 'v3-aco-estrada', preview: 'v3.png' },
];

const viewports = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

function startServer() {
  return new Promise((resolve) => {
    const proc = spawn('python3', ['-m', 'http.server', String(port)], {
      cwd: root,
      stdio: 'ignore',
    });
    setTimeout(() => resolve(proc), 800);
  });
}

await mkdir(previewDir, { recursive: true });
await mkdir(screenshotDir, { recursive: true });

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

try {
  for (const version of versions) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const url = `${baseUrl}/${version.slug}/`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({
      path: path.join(previewDir, version.preview),
      fullPage: false,
    });
    await page.close();
    console.log('Preview saved:', version.preview);
  }

  const hubPage = await browser.newPage();
  await hubPage.setViewport({ width: 1280, height: 720 });
  await hubPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  for (const vp of viewports) {
    await hubPage.setViewport({ width: vp.width, height: vp.height });
    await hubPage.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 800));
    await hubPage.screenshot({
      path: path.join(screenshotDir, `${vp.name}.png`),
      fullPage: false,
    });
    console.log('Screenshot saved:', vp.name);
  }
  await hubPage.close();
} finally {
  await browser.close();
  server.kill();
}

console.log('Done.');
