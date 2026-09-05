const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve('videos');
const tmpDir = path.join(outDir, 'tmp');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: tmpDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('http://127.0.0.1:5173/demo');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });

  await wait(2500);

  await page.getByRole('button', { name: /Grieta/ }).first().click();
  await page.waitForSelector('text=TST-0148');
  await wait(3500);

  await page.getByRole('button', { name: /Promotor/ }).click();
  await page.waitForSelector('text=3 puntos rojos');
  await wait(3500);

  await page.getByRole('button', { name: /App offline/ }).click();
  await wait(1200);
  await page.getByRole('button', { name: /MODO AVION/ }).click();
  await wait(900);
  await page.getByRole('button', { name: /SE CAE UN CERRO/ }).click();
  await wait(2500);

  await page.getByRole('button', { name: /Segunda senal/ }).click();
  await wait(1500);
  await page.getByRole('button', { name: /MODO AVION/ }).click();
  await page.waitForSelector('text=ALERTA DEL SECTOR');
  await wait(4000);

  await page.getByRole('button', { name: /Promotor/ }).click();
  await wait(1200);
  await page.getByRole('button', { name: /Confirmar alerta/ }).click();
  await page.waitForSelector('text=TTS');
  await wait(2500);

  await page.getByRole('button', { name: /App offline/ }).click();
  await page.waitForSelector('text=ALERTA GENERAL');
  await wait(5000);

  const video = page.video();
  await context.close();
  await browser.close();

  const rawPath = await video.path();
  const finalPath = path.join(outDir, 'testigo-prototipo-demo.webm');
  fs.copyFileSync(rawPath, finalPath);

  console.log(JSON.stringify({ finalPath, errors }, null, 2));
})();
