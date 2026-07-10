import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 8765;
const BASE = `http://127.0.0.1:${PORT}`;

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

async function testPage(page, { name, path }) {
  const url = BASE + path;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const initial = await page.evaluate(() => ({
    revealCount: document.querySelectorAll('.reveal').length,
    heroCount: document.querySelectorAll('.hero-enter').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(900);

  const afterScroll = await page.evaluate(() => ({
    visibleCount: document.querySelectorAll('.reveal.is-visible').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));

  const revealOk = initial.revealCount > 0;
  const heroOk = initial.heroCount > 0;
  const scrollOk = afterScroll.visibleCount > 0;
  const overflowOk = !initial.overflow && !afterScroll.overflow;
  const passed = revealOk && heroOk && scrollOk && overflowOk;

  console.log(`${name}:`);
  console.log(`  reveal elements: ${initial.revealCount} ${revealOk ? 'OK' : 'FAIL'}`);
  console.log(`  hero entrance: ${initial.heroCount} ${heroOk ? 'OK' : 'FAIL'}`);
  console.log(`  visible after scroll: ${afterScroll.visibleCount} ${scrollOk ? 'OK' : 'FAIL'}`);
  console.log(`  no overflow: ${overflowOk ? 'OK' : 'FAIL'}`);
  console.log(`  => ${passed ? 'PASS' : 'FAIL'}\n`);

  return passed;
}

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
let allPassed = true;

try {
  for (const entry of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const passed = await testPage(page, entry);
    if (!passed) allPassed = false;
    await page.close();
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}

process.exit(allPassed ? 0 : 1);
