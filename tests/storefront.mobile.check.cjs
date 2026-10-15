const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),checks=[],errors=[];try{
 for(const[width,height]of[[320,680],[390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true}),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  const load=async query=>{await page.goto('http://127.0.0.1:8725/dist/'+query);await page.evaluate(()=>document.fonts.ready);};
  await load('?v=18');await page.locator('.search-trigger').click();await page.locator('#global-search').fill('가방');assert.equal(await page.locator('#search-results .search-match').count(),1);await page.locator('#search-results img').evaluate(img=>img.decode());
  await page.locator('#search-dialog').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished));});
  assert.equal(await page.locator('#search-dialog').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.equal(await page.locator('#search-dialog').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(242, 244, 239)');
  if(width===390)await page.screenshot({path:'outputs/storefront-v18-mobile-search.png'});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#search-dialog').evaluate(el=>el.open),false);await page.locator('.search-trigger').click();await page.locator('#global-search-form button').click();assert.equal(await page.locator('#page-view .product-card').count(),1);
  await page.locator('#page-view [data-save=daily-pack]').click();await page.locator('.mobile-menu-trigger').click();await page.locator('#menu-dialog a[href="?page=saved"]').click();assert.equal(await page.locator('#page-view .product-card').count(),1);assert.equal(await page.locator('#menu-dialog').evaluate(el=>el.open),false);
  await page.locator('#page-view .product-card').click();await page.locator('[data-size=FREE]').click();await page.locator('.add-to-cart').click();assert.equal(await page.locator('#cart-total').textContent(),'99,000원');await page.keyboard.press('Escape');
  await load('?page=shop&category=gear');await page.locator('.shop-filter summary').click();await page.locator('[name=size]').selectOption('FREE');await page.locator('[name=price]').selectOption('under70');await page.locator('#shop-filter-form button').click();assert.equal(await page.locator('#page-view .product-card').count(),3);
  await load('?page=home');await page.locator('[data-arrival=gear]').click();const bounds=await page.locator('[data-rail=next]').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));assert(bounds.width>=44&&bounds.height>=44);assert(await page.locator('[data-rail=next]').isEnabled());
  await page.setViewportSize({width:1440,height:900});await page.waitForFunction(()=>document.querySelector('[data-rail=next]').disabled);await page.setViewportSize({width,height});await page.waitForFunction(()=>!document.querySelector('[data-rail=next]').disabled);await page.locator('[data-rail=next]').click();await page.waitForFunction(()=>document.querySelector('#arrival-rail').scrollLeft>20);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks.push({width,height,searchEnterEscape:true,menuToSaved:true,freeSizeCart:true,compoundFilter:true,railTarget:bounds,railResizesBothWays:true,noOverflow:true});await ctx.close();
 }
 assert.equal(errors.length,0);fs.writeFileSync('outputs/storefront-mobile-check.json',JSON.stringify({date:'2026-10-15',version:18,browser:await browser.version(),checks,errors},null,2));console.log(JSON.stringify({result:'pass',viewports:checks.length,errors}));
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
