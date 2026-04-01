const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

const originalHtml = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');

const doc = new JSDOM(originalHtml, {
  url: "https://hotelsolar.tur.br/solarsemlimites2026/#/checkout",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  virtualConsole: (() => { const v = new jsdom.VirtualConsole(); v.sendTo(console); return v; })()
});

setTimeout(() => {
  const rootHtml = doc.window.document.getElementById('root').innerHTML;
  console.log("Root length:", rootHtml.length);
  if (rootHtml.length < 50) console.log("ROOT IS EMPTY!");
  else console.log("ROOT HAS CONTENT");
  process.exit(0);
}, 3000);
