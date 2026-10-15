const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base='http://127.0.0.1:8725/dist/?v=18';
async function entry(page,selector,progress){
 await page.locator(selector).first().evaluate((el,progress)=>{let top=0,node=el;while(node){top+=node.offsetTop;node=node.offsetParent;}window.scrollTo({top:top-innerHeight+Math.min(el.offsetHeight,innerHeight-88)*progress,behavior:'instant'});},progress);
 await page.waitForTimeout(100);
}
const state=(page,selector)=>page.locator(selector).first().evaluate(el=>{const s=getComputedStyle(el);return {opacity:Number(s.opacity),scale:s.scale,translate:s.translate,clip:s.clipPath,animation:s.animationName};});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),errors=[],checks=[];
 try{
  const baseline=JSON.parse(fs.readFileSync('outputs/hero-stability-v16-baseline.json','utf8'));const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
  const css=fs.readFileSync('dist/styles.css','utf8'),hero=css.slice(css.indexOf('.product-story{'),css.indexOf('.everyday-section{'))+css.slice(css.indexOf('/* The readable static layout above'));
  assert.equal(hash(hero),baseline.heroCSS,'corrected hero CSS changed');assert.equal(hash(fs.readFileSync('dist/motion.css')),baseline.motionCSS,'editorial motion CSS changed');
  for(const [width,height]of [[1440,900],[390,844]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);
   await entry(page,'#commute figure',.08);await page.locator('#commute img').evaluate(img=>img.decode());
   const photo=[];
   for(const progress of [.08,.55,1.12]){await entry(page,'#commute figure',progress);photo.push({progress,frame:await state(page,'#commute figure'),image:await state(page,'#commute img')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
   assert(photo[0].frame.animation.includes('editorial-crop'));assert(Number(photo[0].image.scale)>Number(photo[2].image.scale)+.015,JSON.stringify(photo));assert.equal(Number(photo[2].image.scale),1);assert.notEqual(photo[0].frame.clip,photo[2].frame.clip);
   await entry(page,'.category-entry',.05);const cardStart=await state(page,'.category-entry');await entry(page,'.category-entry',1.15);const cardEnd=await state(page,'.category-entry');assert(cardStart.opacity<.98);assert(cardEnd.opacity>.999);
   await entry(page,'.category-entry',.05);await page.locator('.category-entry').first().focus();assert.equal((await state(page,'.category-entry')).animation,'none');assert.equal((await state(page,'.category-entry')).opacity,1);
   await page.locator('#commute .look-image-link').focus();assert.equal((await state(page,'#commute figure')).clip,'none');assert.equal((await state(page,'#commute img')).scale,'none');
   assert(await page.locator('#hero *').evaluateAll(elements=>elements.every(el=>!getComputedStyle(el).animationName.includes('editorial-'))));
   if(width===1440){await entry(page,'.product-card',1.2);await page.locator('.product-card').first().hover();await page.waitForTimeout(500);const hover=await page.locator('.product-card img').first().evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return {scale:m.a,y:m.f};});assert(hover.scale>1.035&&hover.y<-3);await page.mouse.move(10,10);}
   await page.emulateMedia({reducedMotion:'reduce'});await entry(page,'#commute figure',.08);assert.equal((await state(page,'#commute figure')).animation,'none');assert.equal((await state(page,'#commute img')).scale,'none');assert.equal((await state(page,'.product-card')).opacity,1);
   await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'&page=brand');await entry(page,'.brand-hero-image',.12);assert((await state(page,'.brand-hero-image')).animation.includes('editorial-crop'));
   await page.goto(base);await page.evaluate(()=>{const sheet=[...document.styleSheets].find(s=>s.href?.includes('motion.css'));function removeSupports(group){for(let i=group.cssRules.length-1;i>=0;i--){const rule=group.cssRules[i];if(rule instanceof CSSSupportsRule)group.deleteRule(i);else if(rule.cssRules&&rule.deleteRule)removeSupports(rule);}}removeSupports(sheet);});await entry(page,'#commute figure',.08);assert.equal((await state(page,'#commute figure')).animation,'none');assert.equal((await state(page,'.product-card')).opacity,1);
   await page.goto(base);await entry(page,'#commute figure',1.12);await page.locator('#commute img').evaluate(img=>img.decode());await page.locator('#commute').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-80,behavior:'instant'}));await page.waitForTimeout(150);await page.screenshot({path:`outputs/motion-v18-${width===1440?'pc':'mobile'}-everyday.png`});
   checks.push({width,height,photo,cardStart,cardEnd,keyboardRevealsImmediately:true,reducedMotion:true,unsupportedFallback:true,heroExcluded:true,brandMotion:true});await page.close();
  }
  assert.equal(errors.length,0);fs.writeFileSync('outputs/editorial-motion-check.json',JSON.stringify({date:'2026-10-15',version:18,browser:await browser.version(),approvedHeroCSSAndEditorialMotionUnchanged:true,checks,errors},null,2));console.log(JSON.stringify({result:'pass',viewports:checks.length,approvedHeroCSSAndEditorialMotionUnchanged:true,reducedMotion:true,unsupportedFallback:true,errors}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
