import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 8766;
const BASE = `http://127.0.0.1:${PORT}`;

/** Mobile-first: smallest screens first */
const VIEWPORTS = [
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
  { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Desktop FHD', width: 1920, height: 1080 },
];

const PAGES = [
  { name: 'Hub', path: '/' },
  { name: 'V1 RAÇA', path: '/v1-raca/' },
  { name: 'V2 TERRITÓRIO', path: '/v2-territorio/' },
  { name: 'V3 AÇO ESTRADA', path: '/v3-aco-estrada/' },
];

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-m', 'http.server', String(PORT)], {
      cwd: new URL('..', import.meta.url).pathname,
      stdio: 'ignore',
    });
    proc.on('error', reject);
    sleep(800).then(() => resolve(proc));
  });
}

async function auditPage(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const viewportContent = viewport ? viewport.getAttribute('content') || '' : '';
    const hasMobileViewport = /width=device-width/i.test(viewportContent);

    const docWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const overflow = docWidth > clientWidth + 1;

    const offenders = [];
    if (overflow) {
      document.querySelectorAll('body *').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        if (rect.right > clientWidth + 1 || rect.left < -1) {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const cls = el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : '';
          offenders.push({
            selector: `${tag}${id}${cls}`,
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          });
        }
      });
    }

    const smallTargets = [];
    document.querySelectorAll('a, button, input, textarea, select').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (rect.width < 40 || rect.height < 40) {
        smallTargets.push({
          selector: el.tagName.toLowerCase() + (el.className ? `.${String(el.className).split(/\s+/)[0]}` : ''),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        });
      }
    });

    return {
      hasMobileViewport,
      overflow,
      docWidth,
      clientWidth,
      offenders: offenders.slice(0, 5),
      smallTargets: smallTargets.slice(0, 5),
    };
  });
}

async function testViewport(browser, pageEntry, viewport) {
  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    isMobile: viewport.width < 768,
    hasTouch: viewport.width < 1024,
  });

  const url = BASE + pageEntry.path;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

  if (pageEntry.path.includes('v1-raca')) {
    await page.evaluate(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) preloader.remove();
    });
  }

  const top = await auditPage(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(400);
  const bottom = await auditPage(page);

  await page.close();

  const overflow = top.overflow || bottom.overflow;
  const viewportOk = top.hasMobileViewport;
  const passed = !overflow && viewportOk;

  return {
    overflow,
    viewportOk,
    passed,
    top,
    bottom,
  };
}

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

const results = [];
let allPassed = true;

console.log('Responsive audit (mobile-first order)\n');

try {
  for (const pageEntry of PAGES) {
    console.log(`=== ${pageEntry.name} ===`);
    for (const viewport of VIEWPORTS) {
      const result = await testViewport(browser, pageEntry, viewport);
      const status = result.passed ? 'PASS' : 'FAIL';
      if (!result.passed) allPassed = false;

      console.log(
        `  ${viewport.name} (${viewport.width}x${viewport.height}): ` +
        `overflow=${result.overflow ? 'yes' : 'no'} viewport=${result.viewportOk ? 'ok' : 'missing'} [${status}]`
      );

      if (result.overflow && result.top.offenders.length) {
        console.log(`    offenders: ${result.top.offenders.map((o) => `${o.selector}→${o.right}px`).join(', ')}`);
      }

      results.push({ page: pageEntry.name, viewport: viewport.name, ...result });
    }
    console.log('');
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}

const failed = results.filter((r) => !r.passed);
console.log(`Total: ${results.length} checks · ${results.length - failed.length} passed · ${failed.length} failed`);

process.exit(allPassed ? 0 : 1);
