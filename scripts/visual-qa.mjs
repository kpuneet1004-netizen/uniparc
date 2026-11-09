import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const outputDir = 'visual-qa';
await fs.mkdir(outputDir, { recursive: true });

const viewports = [
  { name: 'mobile-320', width: 320, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1200', width: 1200, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
];

const browser = await chromium.launch({ headless: true });
const failures = [];
const report = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#main-content').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1800);
  await page.evaluate(async () => {
    await Promise.all([...document.images].map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        const timeout = setTimeout(resolve, 7000);
        img.addEventListener('load', () => { clearTimeout(timeout); resolve(); }, { once: true });
        img.addEventListener('error', () => { clearTimeout(timeout); resolve(); }, { once: true });
      });
    }));
  });

  const metrics = await page.evaluate(() => {
    const failedImages = [...document.images]
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => ({ src: img.currentSrc || img.src, alt: img.alt }));
    const missingAnchorTargets = [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute('href'))
      .filter(href => href && href.length > 1 && !document.getElementById(href.slice(1)));
    const overflowingElements = [...document.querySelectorAll('body *')]
      .filter(el => {
        const style = getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'absolute') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1);
      })
      .slice(0, 12)
      .map(el => ({ tag: el.tagName, className: typeof el.className === 'string' ? el.className : '', right: Math.round(el.getBoundingClientRect().right) }));
    return {
      title: document.title,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      pageHeight: document.documentElement.scrollHeight,
      failedImages,
      missingAnchorTargets,
      overflowingElements,
      menuToggleVisible: getComputedStyle(document.querySelector('.menu-toggle')).display !== 'none',
      headerPosition: getComputedStyle(document.querySelector('.site-header')).position,
    };
  });

  const screenshot = `${outputDir}/${viewport.name}.png`;
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });

  const checks = {
    httpOk: response && response.status() < 400,
    noHorizontalPageOverflow: metrics.documentWidth <= metrics.viewportWidth + 1,
    noBrokenImages: metrics.failedImages.length === 0,
    allAnchorTargetsExist: metrics.missingAnchorTargets.length === 0,
    noRuntimeErrors: pageErrors.length === 0,
    stickyHeader: metrics.headerPosition === 'sticky',
    mobileMenuAvailable: viewport.width > 760 || metrics.menuToggleVisible,
  };
  const failedChecks = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
  report.push({ viewport: viewport.name, checks, metrics, pageErrors, screenshot });
  if (failedChecks.length) failures.push({ viewport: viewport.name, failedChecks, metrics, pageErrors });
  await page.close();
}

await fs.writeFile(`${outputDir}/report.json`, JSON.stringify({ baseURL, report, failures }, null, 2));
await browser.close();
console.log(JSON.stringify({ viewports: report.map(item => ({ viewport: item.viewport, checks: item.checks, pageHeight: item.metrics.pageHeight })), failures }, null, 2));
if (failures.length) process.exitCode = 1;
