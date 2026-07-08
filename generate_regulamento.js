import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = `file://${path.resolve(__dirname, 'Regulamento_SSL.html')}`;
  
  console.log('Opening file:', filePath);
  
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Generating PDF...');
  
  await page.pdf({
    path: 'Checkout-Solar-sem-Limites/public/Regulamento_SSL.pdf',
    format: 'A4',
    landscape: false,
    printBackground: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  await browser.close();
  console.log('✅ PDF gerado: Checkout-Solar-sem-Limites/public/Regulamento_SSL.pdf');
})();
