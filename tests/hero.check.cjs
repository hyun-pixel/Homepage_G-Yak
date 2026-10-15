const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const output=path.resolve(__dirname,'../outputs');
const dimensions=[[320,680],[360,780],[390,844],[430,932],[760,900],[768,1024],[1024,900],[1040,680],[1265,720],[1280,900],[1440,900],[1680,1050]];
const fractions=[0,.32,.61,.91];
const transitionFractions=[...new Set([...Array.from({length:21},(_,step)=>step/20),.78,.81,.82,.84,.86,.88,.94])].sort((a,b)=>a-b);
async function scrollTo(page,fraction){
 await page.evaluate(f=>{const hero=document.querySelector('#hero');window.scrollTo({top:f?hero.offsetTop+f*(hero.offsetHeight-innerHeight):0,behavior:'instant'});},fraction);
 await page.waitForTimeout(100);
}
const luminance=rgb=>rgb.map(value=>{value/=255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
async function paragraphContrast(page,index){
 const text=await page.locator('.hero-scene p').nth(index).evaluate(el=>({color:getComputedStyle(el).color.match(/\d+/g).slice(0,3).map(Number),rects:[...el.childNodes].filter(node=>node.nodeType===3&&node.textContent.trim()).flatMap(node=>{const range=document.createRange();range.selectNodeContents(node);return [...range.getClientRects()].map(box=>({x:box.x,y:box.y,width:box.width,height:box.height}));})}));
 await page.locator('.hero-scene').evaluateAll(elements=>elements.forEach(el=>el.style.visibility='hidden'));
 await page.waitForTimeout(50);
 const {data,info}=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});
 await page.locator('.hero-scene').evaluateAll(elements=>elements.forEach(el=>el.style.visibility=''));
 let minimum=21;const foreground=luminance(text.color);
 for(const rect of text.rects)for(let y=Math.ceil(rect.y);y<rect.y+rect.height&&y<info.height;y+=3)for(let x=Math.ceil(rect.x);x<rect.x+rect.width&&x<info.width;x+=3){
  const offset=(y*info.width+x)*info.channels,background=luminance([...data.subarray(offset,offset+3)]);
  minimum=Math.min(minimum,(Math.max(background,foreground)+.05)/(Math.min(background,foreground)+.05));
 }
 return Math.round(minimum*100)/100;
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],failures=[],checks=[];
 try{
  for(const [width,height] of dimensions){
   const page=await browser.newPage({viewport:{width,height}});
   page.on('pageerror',error=>errors.push(error.message));
   page.on('requestfailed',request=>failures.push(request.url()));
   await page.goto('http://127.0.0.1:8725/dist/?v=16');await page.evaluate(()=>document.fonts.ready);
   await page.locator('#hero-image').evaluate(img=>img.decode());
   await page.waitForFunction(()=>document.querySelector('.hero-backdrops').classList.contains('landscapes-ready'));
   await page.waitForFunction(()=>document.querySelector('.hero-product').classList.contains('pose-ready'));
   await page.locator('.hero-backdrop img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
   const centers=[],contrasts=[];
   for(const [index,fraction] of fractions.entries()){
    await scrollTo(page,fraction);
    const state=await page.evaluate(index=>{
     const box=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
     return {product:box('.hero-product'),shop:box('.hero-shop'),copy:document.querySelectorAll('.hero-scene')[index].getBoundingClientRect().toJSON(),copyOpacity:Number(getComputedStyle(document.querySelectorAll('.hero-scene')[index]).opacity),backgrounds:[...document.querySelectorAll('.hero-backdrop')].map(el=>Number(getComputedStyle(el).opacity)),closedOpacity:Number(getComputedStyle(document.querySelector('#hero-image')).opacity),openOpacity:Number(getComputedStyle(document.querySelector('#hero-open-image')).opacity),overflow:document.documentElement.scrollWidth>innerWidth};
    },index);
    assert(!state.overflow,`overflow ${width} / ${index}`);
    assert(state.copyOpacity>.98,`copy ${width} / ${index}`);
    assert(state.product.left>=0&&state.product.right<=width,`product crop ${width} / ${index}: ${JSON.stringify(state.product)}`);
    assert(state.product.bottom+8<state.shop.top,`shop overlap ${width} / ${index}: ${JSON.stringify(state)}`);
    if(width<1040) assert(state.copy.bottom+3<state.product.top,`copy overlap ${width} / ${index}: ${JSON.stringify(state)}`);
    if(index<3) assert(state.backgrounds[index]>.98,`background ${width} / ${index}`);
    else assert(state.backgrounds.every(opacity=>opacity<.01),'last scene should return to quiet background');
    assert(Math.abs(state.openOpacity-(index===3?1:0))<.01,`open pose ${width} / ${index}`);
    assert(Math.abs(state.closedOpacity-(index===3?0:1))<.01,`closed pose ${width} / ${index}`);
    centers.push(state.product.x+state.product.width/2);
    if(width===1440||width===390){const contrast=await paragraphContrast(page,index);assert(contrast>=4.5,`paragraph contrast ${width} / ${index}: ${contrast}`);contrasts.push(contrast);await page.waitForTimeout(400);await page.screenshot({path:path.join(output,`hero-v16-${width===1440?'pc':'mobile'}-${index+1}.png`)});}
   }
   const travel=centers[2]-centers[1];assert(travel>width*(width<1040?.23:.39),`travel ${width}: ${travel}`);
   // Check transitions too: rotation must not cut off the garment or cover its controls.
   for(const fraction of transitionFractions){
    await scrollTo(page,fraction);
    const state=await page.evaluate(()=>{const product=document.querySelector('.hero-product').getBoundingClientRect(),shop=document.querySelector('.hero-shop').getBoundingClientRect(),opacity=selector=>Number(getComputedStyle(document.querySelector(selector)).opacity);return {left:product.left,right:product.right,bottom:product.bottom,shopTop:shop.top,finalCopy:opacity('.scene-color'),previousCopy:opacity('.scene-life'),openPose:opacity('#hero-open-image'),closedPose:opacity('#hero-image')};});
    assert(state.left>=0&&state.right<=width,`transition crop ${width} / ${fraction}`);
    assert(state.bottom+6<state.shopTop,`transition controls ${width} / ${fraction}`);
    assert(Math.abs(state.finalCopy-state.openPose)<.001,`final copy/pose timing ${width} / ${fraction}: ${JSON.stringify(state)}`);
    assert(Math.abs(state.closedPose+state.openPose-1)<.001,`pose crossfade ${width} / ${fraction}`);
    if(fraction<.81)assert.equal(state.finalCopy,0,`premature final copy ${width} / ${fraction}`);
    if(fraction>.83)assert.equal(state.previousCopy,0,`previous copy overlaps opening ${width} / ${fraction}`);
   }
   checks.push({width,height,travelPixels:Math.round(travel),backgroundSequence:'city > snow > trek > quiet',closedThroughTrekking:true,wideOpenAtEnd:true,finalRevealSynchronized:true,transitionSamples:transitionFractions.length,paragraphContrastSamples:contrasts});await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto('http://127.0.0.1:8725/dist/');
  assert.equal(await reduced.locator('.hero-stage').evaluate(el=>getComputedStyle(el).position),'relative');
  assert(await reduced.locator('.hero-backdrop').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).animationName==='none')));
  assert.equal(await reduced.locator('#hero-open-image').evaluate(el=>getComputedStyle(el).opacity),'0');
  for(const viewport of [{width:844,height:390},{width:720,height:450}]){await reduced.setViewportSize(viewport);assert.equal(await reduced.locator('.hero-stage').evaluate(el=>getComputedStyle(el).position),'relative');assert(await reduced.locator('.hero-scene').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).opacity==='1')));}
  const failedLandscape=await browser.newPage({viewport:{width:1440,height:900}});
  await failedLandscape.route('**/hero-snow.webp',route=>route.abort());await failedLandscape.goto('http://127.0.0.1:8725/dist/');
  await failedLandscape.waitForFunction(()=>document.querySelector('.backdrop-trek img').complete&&document.querySelector('.backdrop-trek img').naturalWidth>0);
  await scrollTo(failedLandscape,.32);
  assert.equal(await failedLandscape.locator('.backdrop-city').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.equal(await failedLandscape.locator('#hero-image').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  await failedLandscape.locator('.hero-shop .product-open').click();assert.equal(await failedLandscape.locator('.detail-info h1').textContent(),'에브리데이 라이트 다운');

  for(const [width,height]of [[1440,900],[390,844]]){
   const colorPage=await browser.newPage({viewport:{width,height}});await colorPage.goto('http://127.0.0.1:8725/dist/?v=16');
   await colorPage.waitForFunction(()=>document.querySelector('.hero-product').classList.contains('pose-ready'));await scrollTo(colorPage,.95);
   for(const color of ['stone','charcoal','olive']){
    await colorPage.locator(`.hero-shop [data-color="${color}"]`).click();
    await colorPage.waitForFunction(color=>document.querySelector('#hero-image').src.endsWith('puffer-'+color+'.webp')&&document.querySelector('#hero-open-image').src.endsWith('puffer-'+color+'-open-wide.webp'),color);
    assert.equal(await colorPage.locator('#hero-open-image').evaluate(el=>getComputedStyle(el).opacity),'1');
    await colorPage.waitForTimeout(150);await colorPage.screenshot({path:path.join(output,`hero-v16-${width===1440?'pc':'mobile'}-open-${color}.png`)});
   }
   await scrollTo(colorPage,1);assert.equal(await colorPage.locator('#hero-open-image').evaluate(el=>getComputedStyle(el).opacity),'1');assert.equal(await colorPage.locator('#hero-image').evaluate(el=>getComputedStyle(el).opacity),'0');await scrollTo(colorPage,.61);assert.equal(await colorPage.locator('#hero-image').evaluate(el=>getComputedStyle(el).opacity),'1');assert.equal(await colorPage.locator('#hero-open-image').evaluate(el=>getComputedStyle(el).opacity),'0');
   await scrollTo(colorPage,.86);
   const reverseDifference=await colorPage.evaluate(()=>Number(getComputedStyle(document.querySelector('.scene-color')).opacity)-Number(getComputedStyle(document.querySelector('#hero-open-image')).opacity));
   assert(Math.abs(reverseDifference)<.001,`reverse reveal timing ${width}`);
   await colorPage.screenshot({path:path.join(output,`hero-v16-${width===1440?'pc':'mobile'}-reveal-midpoint.png`)});
   await colorPage.close();
  }
  const failedPose=await browser.newPage({viewport:{width:1440,height:900}});await failedPose.route('**/*-open*.webp',route=>route.abort());
  await failedPose.goto('http://127.0.0.1:8725/dist/?v=16');await scrollTo(failedPose,.95);await failedPose.locator('.hero-shop [data-color="stone"]').click();
  await failedPose.waitForFunction(()=>document.querySelector('#hero-image').src.endsWith('puffer-stone.webp'));
  assert.equal(await failedPose.locator('.hero-product').evaluate(el=>el.classList.contains('pose-ready')),false);
  assert.equal(await failedPose.locator('#hero-image').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.equal(await failedPose.locator('#hero-message').textContent(),'');
  assert.equal(errors.length,0);assert.equal(failures.length,0);
  fs.writeFileSync(path.join(output,'hero-motion-check.json'),JSON.stringify({date:'2026-10-15',version:16,browser:await browser.version(),checks,finalReveal:{start:.82,end:.90,matchingOpacityAtEverySample:true,reverseSynchronized:true},reducedMotion:true,shortViewport:true,deferredFailureFallback:true,openPoses:{colors:3,stage:"final",remainsOpen:true,reversesOnScrollUp:true,desktopAndMobile:true,failedOpenImageKeepsClosed:true},errors,failures},null,2));
  console.log(JSON.stringify({result:'pass',dimensions:checks.length,transitionSamples:checks.length*transitionFractions.length,finalRevealSynchronized:true,errors,failures}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
