import puppeteer from 'puppeteer';

const baseUrl = 'http://127.0.0.1:8765/site/index.html';
const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop HD', width: 1280, height: 720 },
  { name: 'Desktop FHD', width: 1920, height: 1080 },
];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

let allPassed = true;

for (const vp of viewports) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  const status = overflow ? 'FAIL' : 'OK';
  if (overflow) allPassed = false;
  console.log(`${vp.name} (${vp.width}x${vp.height}): overflow=${overflow} [${status}]`);
  await page.close();
}

await browser.close();
process.exit(allPassed ? 0 : 1);
