import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseName = process.argv[2] || '01-icon-styles';
const inputFile = path.join(__dirname, baseName + '.html');
const outputFile = path.join(__dirname, baseName + '.pdf');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto('file://' + inputFile.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
await page.pdf({
  path: outputFile,
  format: 'A3',
  landscape: true,
  printBackground: true,
  margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
});
await browser.close();
console.log('PDF saved to:', outputFile);
