import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = `file://${path.resolve(__dirname, 'Arte_Display_Mesas.html')}`;
  
  console.log('Opening file:', filePath);
  
  await page.goto(filePath, { waitUntil: 'networkidle' });
  
  // Wait a bit more for Tailwind to finish processing if needed
  await page.waitForTimeout(2000);

  console.log('Generating PDF...');
  
  await page.pdf({
    path: 'Arte_Display_Mesas_Julho.pdf',
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  await browser.close();
  console.log('PDF generated successfully: Arte_Display_Mesas_Julho.pdf');
})();
