import { chromium } from 'playwright';
import fs from 'fs';
const FPS=60, DUR=10, N=FPS*DUR, W=+process.env.WORKERS||6;
fs.mkdirSync('frames',{recursive:true});
const browser = await chromium.launch({args:['--force-color-profile=srgb','--disable-lcd-text']});
const chunk = Math.ceil(N/W);
let meta=null;
await Promise.all(Array.from({length:W},async(_,w)=>{
  const page = await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  page.on('pageerror', e=>console.log('pageerror:', e.message));
  await page.goto('file://'+process.cwd()+'/index.html');
  await page.evaluate(()=>window.__ready);
  if(w===0) meta = await page.evaluate(()=>({iconPops}));
  const a=w*chunk, b=Math.min(N,a+chunk);
  // warm-up: seek sequentially from 0 to the chunk start so every tween initializes in order
  for(let t=0;t<a/FPS;t+=0.25) await page.evaluate(t=>window.__render(t), t);
  for(let i=a;i<b;i++){
    await page.evaluate(t=>window.__render(t), i/FPS);
    await page.screenshot({path:`frames/f${String(i).padStart(4,'0')}.png`});
    if((i-a)%50===0) console.log(`w${w} ${i}/${b}`);
  }
  await page.close();
}));
fs.writeFileSync('meta.json', JSON.stringify(meta));
await browser.close();
console.log('done');
