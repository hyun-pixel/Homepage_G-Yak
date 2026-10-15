const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.argv[2]||'before',out=path.resolve(__dirname,'../outputs');
const seed=[{product:'everyday-down',color:'olive',size:'M',quantity:1},{product:'soft-hoodie',color:'stone',size:'L',quantity:1}];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const report={date:'2026-10-15',phase,layoutCaptureMotion:'reduce',screens:[],errors:[],failedRequests:[]};
 try{
  for(const [label,width,height]of [['pc',1440,900],['mobile',390,844],['tablet',1024,900],['narrow',320,680]]){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage();
   page.on('pageerror',e=>report.errors.push(e.message));page.on('requestfailed',r=>report.failedRequests.push(r.url()));
   await page.addInitScript(items=>localStorage.setItem('gyak.cart',JSON.stringify(items)),seed);
   for(const route of ['home','shop','product','brand','cart','checkout','confirmation']){
    if(route==='confirmation'){
     for(const [id,value]of [['recipient','검수이름'],['phone','010-1111-2222'],['postcode','01234'],['address','검수로 123'],['address-detail','101동 202호']])await page.locator('#'+id).fill(value);
     await page.locator('#checkout-form button[type=submit]').click();
    }else await page.goto('http://127.0.0.1:8725/dist/?v=13&page='+route+(route==='product'?'&id=everyday-down&color=stone':''));
    await page.evaluate(async()=>{await document.fonts.ready;const imgs=[...document.images];imgs.forEach(img=>img.loading='eager');await Promise.all(imgs.filter(img=>img.getAttribute('src')).map(img=>img.decode().catch(()=>{})));});
    const metrics=await page.evaluate(()=>{
     const box=el=>el.getBoundingClientRect().toJSON();
     const visible=el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length)&&!el.closest('[hidden],dialog:not([open])');
     const text=[...document.querySelectorAll('h1,h2,h3,p,button,a,th,td,label,legend')].filter(visible);
     return {overflow:document.documentElement.scrollWidth>innerWidth,headings:text.filter(el=>/^H/.test(el.tagName)).map(el=>({text:el.textContent.trim(),box:box(el),font:getComputedStyle(el).fontSize,lineHeight:getComputedStyle(el).lineHeight})),clipped:text.filter(el=>el.scrollWidth>el.clientWidth+2&&el.clientWidth>0&&getComputedStyle(el).overflowX!=='visible').map(el=>el.textContent.trim()),looks:['.look-walk','.look-note'].map(sel=>document.querySelector(sel)).filter(visible).map(el=>({selector:el.className,box:box(el)})),images:[...document.querySelectorAll('main img')].filter(visible).map(img=>({src:img.getAttribute('src'),box:box(img),natural:[img.naturalWidth,img.naturalHeight],fit:getComputedStyle(img).objectFit,position:getComputedStyle(img).objectPosition}))};
    });
    if(route==='product'){
     metrics.productReading=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();return{photo:rect('.detail-image-button'),total:rect('.detail-total'),action:rect('.purchase-actions .add-to-cart'),description:rect('.detail-description')};});
     if(phase==='after'){
      assert(metrics.productReading.action.top>=metrics.productReading.total.bottom+12,`purchase action covers earlier text at ${width}`);
      if(width>=768)assert(metrics.productReading.photo.bottom<=height+1,`photo exceeds first screen at ${width}`);
     }
    }
    report.screens.push({label,width,height,route,...metrics});
    if(label==='pc'||label==='mobile'){
     const stem=path.join(out,`final-${phase}-${label}-${route}`);
     if(route==='home'){
      const style='.site-header,.skip-link{visibility:hidden!important}';
      await page.locator('#everyday').screenshot({path:stem+'-everyday.png',style});
      await page.locator('.collection-section').screenshot({path:stem+'-collection.png',style});
      await page.locator('.home-brand').screenshot({path:stem+'-brand.png'});
      await page.locator('.site-footer').screenshot({path:stem+'-footer.png'});
     }else await page.screenshot({path:stem+'.png',fullPage:true});
    }
   }
   await context.close();
  }
  fs.writeFileSync(path.join(out,`final-review-${phase}.json`),JSON.stringify(report,null,2));
  assert.equal(report.errors.length,0);assert.equal(report.failedRequests.length,0);assert(report.screens.every(s=>!s.overflow));
  console.log(JSON.stringify({phase,screens:report.screens.length,errors:report.errors,failedRequests:report.failedRequests,clipped:report.screens.flatMap(s=>s.clipped.map(text=>({label:s.label,route:s.route,text})))}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
