const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const{chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base='http://127.0.0.1:8725/dist/';
const output=path.resolve(__dirname,'../outputs');
const checks=[],errors=[];
const seed=[{product:'everyday-down',color:'olive',size:'M',quantity:1},{product:'soft-hoodie',color:'stone',size:'L',quantity:1}];
const record=(name,evidence)=>checks.push({name,result:'pass',evidence});
async function load(page,query=''){
  await page.goto(base+query);await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>!!document.querySelector('#home-additions .product-card'));
}
async function noOverflow(page,label){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,label);}
async function details(page,id='everyday-down',color='olive'){await load(page,`?page=product&id=${id}&color=${color}`);}
async function add(page,size,quantity=1){await page.locator(`[data-size="${size}"]`).click();await page.locator('#detail-quantity').fill(String(quantity));await page.locator('.add-to-cart').click();await page.waitForFunction(()=>document.querySelector('#cart-dialog').open);}
async function personal(page){await page.locator('#recipient').fill('검수이름');await page.locator('#phone').fill('010-1111-2222');await page.locator('#postcode').fill('01234');await page.locator('#address').fill('검수로 123');await page.locator('#address-detail').fill('101동 202호');}

(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const ctx=await browser.newContext();ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  const dimensions=[[320,680],[360,780],[390,844],[430,932],[760,900],[768,1024],[1024,900],[1040,900],[1280,900],[1440,900],[1680,1050]];
  for(const[width,height]of dimensions){
   const page=await ctx.newPage();await page.setViewportSize({width,height});await page.addInitScript(items=>localStorage.setItem('gyak.cart',JSON.stringify(items)),seed);
   await load(page);
   for(const[index,fraction]of[0,.32,.61,.91].entries()){
    await page.evaluate(f=>{const el=document.querySelector('#hero');window.scrollTo({top:f?el.offsetTop+f*(el.offsetHeight-innerHeight):0,behavior:'instant'});},fraction);await page.waitForTimeout(90);
    await noOverflow(page,`home ${width}`);
    const state=await page.evaluate(index=>{const product=document.querySelector('.hero-product').getBoundingClientRect(),copy=document.querySelectorAll('.hero-scene')[index],shop=document.querySelector('.hero-shop').getBoundingClientRect();return{opacity:Number(getComputedStyle(copy).opacity),copy:copy.getBoundingClientRect().toJSON(),product:product.toJSON(),shop:shop.toJSON(),header:document.querySelector('.site-header').getBoundingClientRect().toJSON()};},index);
    assert(state.opacity>.98,`${width} scene ${index}`);assert(Math.abs(state.header.top)<1);assert(state.shop.bottom<=height+1);
    if(width<1040){assert(state.copy.bottom+3<state.product.top,`${width} copy overlap`);assert(state.product.bottom+3<state.shop.top,`${width} button overlap`);}
   }
   for(const[screen,query]of[['shop','?page=shop'],['product','?page=product&id=everyday-down&color=stone'],['brand','?page=brand'],['cart','?page=cart'],['checkout','?page=checkout']]){
    await load(page,query);await noOverflow(page,`${screen} ${width}`);
    if(screen==='shop'){const columns=await page.locator('.product-grid').last().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert.equal(columns,width<768?2:width<1040?3:4);}
    if(screen==='product'&&width<768){const positions=await page.evaluate(()=>['.detail-gallery','.detail-info','.detail-explain'].map(selector=>document.querySelector(selector).getBoundingClientRect().top));assert(positions[0]<positions[1]&&positions[1]<positions[2]);}
    if(screen==='product'){assert.equal(await page.locator('.size-picker #size-guide').count(),1);await page.locator('#size-guide summary').click();await noOverflow(page,`open size guide ${width}`);const tableFits=await page.locator('#size-guide table').evaluate(el=>{const box=el.getBoundingClientRect();return box.left>=0&&box.right<=innerWidth;});assert(tableFits,`size table fits ${width}`);await page.locator('#size-guide summary').click();await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));}
    if(width===1440||width===390){await page.waitForTimeout(500);await page.screenshot({path:path.join(output,`site-${width===1440?'pc':'mobile'}-${screen}.png`)});}
   }
   await personal(page);await page.locator('#checkout-form button[type=submit]').click();assert.equal(await page.locator('.confirmation-wrap h1').textContent(),'주문 정보를 확인했습니다.');await noOverflow(page,`confirmation ${width}`);
   if(width===1440||width===390){await page.waitForTimeout(300);await page.screenshot({path:path.join(output,`site-${width===1440?'pc':'mobile'}-confirmation.png`)});}
   await page.close();
  }
  record('전체 페이지 반응형과 기존 히어로',{dimensions,pages:7,storyScenes:4,noHorizontalOverflow:true,mobileReadingOrder:true});

  for(const [width,height]of [[1440,900],[390,844]]){
   const lookPage=await ctx.newPage();await lookPage.setViewportSize({width,height});await load(lookPage);
   const content=JSON.parse(fs.readFileSync('outputs/lifestyle-v15-content.json'));
   const entries=content.flatMap(look=>[[ '#'+look.id+' .look-image-link','edit',look.edit],['#'+look.id+' .look-edit-link','edit',look.edit],...look.items.map(([id,color],index)=>['#'+look.id+' .look-products a:nth-child('+(index+1)+')','product',id,color])]);
   for(const [selector,kind,id,color]of entries){
    await lookPage.locator(selector).evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight/3,behavior:'instant'}));await lookPage.waitForTimeout(90);const before=await lookPage.evaluate(()=>scrollY);
    if(selector==='#walk .look-image-link'){await lookPage.locator(selector).focus();await lookPage.keyboard.press('Enter');}else await lookPage.locator(selector).click();
    if(kind==='edit'){assert.equal(new URL(lookPage.url()).searchParams.get('edit'),id);assert.equal(await lookPage.locator('#page-view .product-card').count(),3);assert.equal(await lookPage.locator('#page-view h1').textContent(),await lookPage.evaluate(id=>window.GYAK_EDITS[id].title,id));}
    else{assert.equal(new URL(lookPage.url()).searchParams.get('id'),id);assert.equal(new URL(lookPage.url()).searchParams.get('color'),color);assert.equal(await lookPage.locator('.detail-info h1').textContent(),await lookPage.evaluate(id=>window.GYAK_PRODUCTS.find(p=>p.id===id).name,id));assert.equal(await lookPage.locator('.detail-info [data-color-label]').textContent(),await lookPage.evaluate(color=>window.GYAK_COLORS[color].label,color));}
    await lookPage.goBack();await lookPage.locator('#everyday').waitFor({state:'visible'});await lookPage.waitForTimeout(90);assert(Math.abs(await lookPage.evaluate(()=>scrollY)-before)<2,'look return position '+width+' / '+selector);
   }
   await noOverflow(lookPage,`lifestyle links ${width}`);
   const actions=await lookPage.locator('#everyday .look-products a').evaluateAll(links=>links.map(el=>{const box=el.getBoundingClientRect();return {height:box.height,left:box.left,right:box.right};}));
   assert(actions.length===9&&actions.every(box=>box.height>=44&&box.left>=0&&box.right<=width),`lifestyle targets ${width}`);
   await lookPage.locator('#commute img').evaluate(img=>img.decode());
   await lookPage.locator('#commute').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-80,behavior:'instant'}));await lookPage.waitForTimeout(120);
   await lookPage.screenshot({path:path.join(output,`site-v17-${width===1440?'pc':'mobile'}-lifestyle.png`)});await lookPage.close();
  }
  record('상황별 코디에서 상품 선택',{viewports:['1440×900','390×844'],entryPoints:15,edits:['commute','walk','trek'],distinctProducts:9,matchingDetailColor:true,keyboardPhotoLink:true,backRestoresPosition:true,touchTargetsAtLeast44:true});

  for(const [width,height]of [[1440,900],[390,844]]){
   const guidePage=await ctx.newPage();await guidePage.setViewportSize({width,height});
   for(const category of ['outer','tops','pants','gear']){await load(guidePage);await guidePage.locator(`.category-entry[href*="category=${category}"]`).click();assert.equal(new URL(guidePage.url()).searchParams.get('category'),category);assert.equal(await guidePage.locator('#page-view .product-card').count(),({outer:7,puffer:3,tops:7,pants:6,gear:4})[category]);}
   await load(guidePage);await guidePage.locator('.category-entry[href*="category=outer"]').click();await guidePage.locator('#page-view .product-card').first().click();assert.equal(await guidePage.locator('.detail-info h1').textContent(),'에브리데이 라이트 다운');
   await guidePage.locator('[data-detail-color="stone"]').click();await guidePage.waitForFunction(()=>document.querySelector('#detail-image').src.includes('stone'));await guidePage.locator('[data-size="M"]').click();await guidePage.locator('#detail-quantity').fill('2');await guidePage.locator('#detail-quantity').dispatchEvent('change');
   await guidePage.locator('#size-guide summary').click();assert.equal(await guidePage.locator('#size-guide').evaluate(el=>el.open),true);assert.equal(await guidePage.locator('#size-guide').count(),1);
   assert.equal(await guidePage.locator('[data-size="M"]').getAttribute('aria-pressed'),'true');assert.equal(await guidePage.locator('#detail-quantity').inputValue(),'2');assert.equal(await guidePage.locator('.detail-info [data-color-label]').textContent(),'스톤');assert.equal(await guidePage.locator('#detail-total').textContent(),'378,000원');
   assert.equal(await guidePage.locator('.detail-info').evaluate(el=>getComputedStyle(el).position),'static');
   await guidePage.locator('#detail-image').evaluate(img=>img.decode());await guidePage.locator('.size-picker').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-90,behavior:'instant'}));await guidePage.waitForTimeout(100);
   await guidePage.screenshot({path:path.join(output,`site-v17-${width===1440?'pc':'mobile'}-size-guide.png`)});
   await guidePage.locator('#size-guide summary').focus();await guidePage.keyboard.press('Enter');assert.equal(await guidePage.locator('#size-guide').evaluate(el=>el.open),false);assert.equal(await guidePage.locator('[data-size="M"]').getAttribute('aria-pressed'),'true');assert.equal(await guidePage.locator('#detail-quantity').inputValue(),'2');
   await guidePage.locator('.site-footer a[href*="#size-guide"]').click();assert.equal(await guidePage.locator('#size-guide').evaluate(el=>el.open),true);
   const guideTop=await guidePage.locator('#size-guide').evaluate(el=>el.getBoundingClientRect().top),headerBottom=await guidePage.locator('.site-header').evaluate(el=>el.getBoundingClientRect().bottom);assert(guideTop>=headerBottom,`guide anchor under header ${width}`);
   await load(guidePage);await guidePage.locator('.home-brand a').click();assert.equal(new URL(guidePage.url()).searchParams.get('page'),'brand');await guidePage.locator('.brand-end a').click();assert.equal(await guidePage.locator('#page-view .product-card').count(),24);await guidePage.close();
  }
  record('컬렉션·브랜드·사이즈 안내',{viewports:['1440×900','390×844'],categoryLinks:4,featuredProduct:true,inlineGuidePreservesColorSizeQuantity:true,keyboardToggle:true,oneGuidePerProduct:true,footerAnchorVisible:true,brandReturnsToCollection:true});

  const page=await ctx.newPage();await load(page);await page.evaluate(()=>localStorage.removeItem('gyak.cart'));await load(page,'?page=shop');
  assert.equal(await page.locator('#page-view .product-card').count(),24);
  for(const category of['outer','puffer','tops','pants','gear']){await page.locator(`.category-tabs a[href*="category=${category}"]`).click();assert.equal(await page.locator('#page-view .product-card').count(),({outer:7,puffer:3,tops:7,pants:6,gear:4})[category]);assert(await page.locator(`.category-tabs a[href*="category=${category}"]`).getAttribute('aria-current').then(v=>v==='page'));}
  await load(page,'?page=shop');
  const allProducts=await page.evaluate(()=>window.GYAK_PRODUCTS);
  for(const product of allProducts){for(const color of product.colors){await details(page,product.id,color);await page.locator('#detail-image').evaluate(img=>img.decode());assert.equal(await page.locator('.detail-info h1').textContent(),product.name);assert.equal(await page.locator('.detail-info [data-color-label]').textContent(),await page.evaluate(color=>window.GYAK_COLORS[color].label,color));}}
  await details(page,'light-vest','stone');await page.locator('#size-guide summary').click();assert.equal(await page.locator('#size-guide th').filter({hasText:'소매 길이'}).count(),0);
  await load(page);await page.locator('.hero-shop [data-color="stone"]').click();await page.waitForFunction(()=>document.querySelector('#hero-image').src.includes('stone'));await page.locator('.hero-shop .product-open').click();assert.equal(await page.locator('.detail-info [data-color-label]').textContent(),'스톤');await page.reload();assert.equal(await page.locator('.detail-info [data-color-label]').textContent(),'스톤');
  await page.locator('[data-detail-color="charcoal"]').click();await page.waitForFunction(()=>document.querySelector('#detail-image').src.includes('charcoal'));await page.reload();assert.equal(await page.locator('.detail-info [data-color-label]').textContent(),'차콜');
  record('상품·분류·이미지',{products:24,categories:4,colorImages:34,categoryCounts:true,colorDeepLinks:true,reloadSelection:true});

  await details(page);await page.locator('.add-to-cart').click();assert.equal(await page.locator('#size-error').textContent(),'사이즈를 선택해 주세요.');assert.equal(await page.locator('#cart-dialog').evaluate(el=>el.open),false);
  await page.locator('[data-size="M"]').click();await page.locator('#detail-quantity').fill('1.5');await page.locator('.add-to-cart').click();assert.equal(await page.locator('#detail-quantity').getAttribute('aria-invalid'),'true');
  await add(page,'M',2);assert.equal(await page.locator('#cart-total').textContent(),'378,000원');await page.keyboard.press('Escape');assert(await page.locator('.add-to-cart').evaluate(el=>el===document.activeElement));
  await add(page,'M',1);assert.equal(await page.locator('#cart-content .cart-row').count(),1);assert.equal(await page.locator('#cart-total').textContent(),'567,000원');await page.keyboard.press('Escape');
  await details(page,'everyday-down','charcoal');await add(page,'XL',1);await page.keyboard.press('Escape');
  await details(page,'soft-hoodie','stone');await add(page,'L',2);assert.equal(await page.locator('#cart-content .cart-row').count(),3);assert.equal(await page.locator('#cart-total').textContent(),'914,000원');
  await page.locator('#cart-content [data-cart-key="everyday-down:olive:M"] [data-cart-action="decrease"]').click();assert.equal(await page.locator('#cart-total').textContent(),'725,000원');
  await page.locator('#cart-content [data-cart-key="soft-hoodie:stone:L"] [data-cart-action="increase"]').click();assert.equal(await page.locator('#cart-total').textContent(),'804,000원');
  await page.locator('#cart-content [data-cart-key="everyday-down:charcoal:XL"] [data-cart-action="remove"]').click();assert.equal(await page.locator('#cart-total').textContent(),'615,000원');
  await page.reload();await page.locator('.cart-trigger').click();assert.equal(await page.locator('#cart-total').textContent(),'615,000원');await page.locator('.cart-page-link').click();assert.equal(await page.locator('.cart-page-items .cart-row').count(),2);
  record('복수 상품 장바구니','사이즈 미선택·소수 수량 차단, 같은 옵션 합치기, 다른 옵션·상품 구분, 수량·삭제·합계·새로고침 복원');

  const requests=[],logs=[];page.on('request',r=>requests.push({url:r.url(),method:r.method()}));page.on('console',msg=>logs.push(msg.text()));
  await load(page,'?page=checkout');await page.locator('#checkout-form button[type=submit]').click();assert.equal(await page.locator('#recipient').getAttribute('aria-invalid'),'true');assert.equal(await page.evaluate(()=>document.activeElement.id),'recipient');
  await personal(page);await page.locator('#phone').fill('12');await page.locator('#checkout-form button[type=submit]').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'phone');
  await page.locator('#phone').fill('010-1111-2222');await page.locator('.cart-trigger').click();await page.locator('#cart-content [data-cart-action="increase"]').first().click();await page.keyboard.press('Escape');assert.equal(await page.locator('#recipient').inputValue(),'검수이름');
  await page.locator('#checkout-form button[type=submit]').click();assert.equal(await page.locator('.confirmation-wrap h1').textContent(),'주문 정보를 확인했습니다.');
  assert.equal(await page.locator('#checkout-form').count(),0);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('gyak.cart')).length),0);
  const privateValues=['검수이름','010-1111-2222','검수로','101동'];
  const browserState=await page.evaluate(()=>JSON.stringify({url:location.href,history:history.state,storage:{...localStorage}}));
  for(const value of privateValues){assert(!browserState.includes(value));assert(!JSON.stringify(requests).includes(value));assert(!logs.join('').includes(value));assert(!(await page.locator('body').innerText()).includes(value));}
  assert(requests.every(request=>request.method==='GET'&&request.url.startsWith('http://127.0.0.1:8725/')));
  await page.reload();assert.equal(await page.locator('.confirmation-wrap').count(),0);assert(await page.locator('.empty-page h1').textContent().then(v=>v.includes('내역이 없습니다')));
  await page.evaluate(items=>localStorage.setItem('gyak.cart',JSON.stringify(items)),seed);await load(page,'?page=checkout');await personal(page);await page.locator('.desktop-nav [data-nav="brand"]').click();await page.goBack();assert.equal(await page.locator('#recipient').inputValue(),'');await personal(page);await page.reload();assert.equal(await page.locator('#recipient').inputValue(),'');
  record('주문 확인과 개인정보','필드 근처 오류·첫 오류 포커스, 장바구니 수정 중 입력 유지, 확인/이동/새로고침 후 입력 삭제, URL·기록·저장소·콘솔·서버 전송 없음');

  await page.setViewportSize({width:390,height:844});await load(page);await page.locator('.mobile-menu-trigger').click();for(let i=0;i<10;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>!document.hasFocus()||!!document.activeElement.closest('#menu-dialog')));}assert.equal(await page.locator('.menu-members button:disabled').count(),3);await page.keyboard.press('Escape');assert(await page.locator('.mobile-menu-trigger').evaluate(el=>el===document.activeElement));
  await details(page);await page.locator('[data-zoom]').click();assert(await page.locator('#image-dialog').evaluate(el=>el.open));await page.keyboard.press('Escape');assert(await page.locator('[data-zoom]').evaluate(el=>el===document.activeElement));
  await page.setViewportSize({width:1440,height:900});await page.locator('[data-zoom]').click();await page.mouse.click(10,450);assert.equal(await page.locator('#image-dialog').evaluate(el=>el.open),false);
  await page.locator('.breadcrumb a').first().click();assert.equal(await page.locator('#home-view').evaluate(el=>el.hidden),false);await page.goBack();assert.equal(await page.locator('.detail-info h1').textContent(),'에브리데이 라이트 다운');
  record('메뉴·접근·이동','회원 항목 비활성, 모달 바깥 페이지 포커스 차단, ESC·바깥 클릭·포커스 복원, 브레드크럼·앞뒤 이동·사진 확대');

  const reduced=await ctx.newPage();await reduced.setViewportSize({width:390,height:844});await reduced.emulateMedia({reducedMotion:'reduce'});await load(reduced);assert.equal(await reduced.locator('.hero-stage').evaluate(el=>getComputedStyle(el).position),'relative');assert(await reduced.locator('.hero-scene').evaluateAll(els=>els.every(el=>getComputedStyle(el).opacity==='1')));
  const short=await ctx.newPage();await short.setViewportSize({width:844,height:390});await load(short);assert.equal(await short.locator('.hero-stage').evaluate(el=>getComputedStyle(el).position),'relative');await noOverflow(short,'short viewport');
  const fallback=await ctx.newPage();await load(fallback);await fallback.evaluate(()=>{for(const sheet of document.styleSheets)for(let i=sheet.cssRules.length-1;i>=0;i--)if(sheet.cssRules[i]instanceof CSSSupportsRule)sheet.deleteRule(i);});assert.equal(await fallback.locator('.hero-stage').evaluate(el=>getComputedStyle(el).position),'relative');
  await page.setViewportSize({width:720,height:450});for(const query of['?page=shop','?page=product&id=everyday-down','?page=checkout','?page=brand']){await load(page,query);await page.addStyleTag({content:'p{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}'});await noOverflow(page,'zoom-equivalent reflow');}
  record('움직임·좁은 높이·글자 간격','감소 설정과 짧은 화면에서 모든 설명 정적 접근, 기능 미지원 모의 대체, 200%에 해당하는 720×450 재배치와 본문 간격 변경');

  const racing=await ctx.newPage();await racing.addInitScript(()=>{window.requestIdleCallback=()=>0;});await racing.route('**/puffer-stone.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,250));await route.continue();});await load(racing);await racing.locator('.hero-shop [data-color="stone"]').click();await racing.locator('.hero-shop [data-color="charcoal"]').click();await racing.waitForFunction(()=>document.querySelector('#hero-image').src.includes('charcoal'));await racing.waitForTimeout(300);assert(await racing.locator('#hero-image').getAttribute('src').then(v=>v.includes('charcoal')));
  const failed=await ctx.newPage();await failed.addInitScript(()=>{window.requestIdleCallback=()=>0;});await failed.route('**/puffer-stone.webp',route=>route.abort());await load(failed);await failed.locator('.hero-shop [data-color="stone"]').click();await failed.waitForFunction(()=>document.querySelector('#hero-message').textContent.includes('불러오지'));assert(await failed.locator('#hero-image').getAttribute('src').then(v=>v.includes('olive')));
  const blocked=await browser.newPage();blocked.on('pageerror',e=>errors.push(e.message));await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Unavailable','SecurityError')}}));await details(blocked);await add(blocked,'M');assert.equal(await blocked.locator('#cart-total').textContent(),'189,000원');
  const corrupted=await ctx.newPage();await corrupted.addInitScript(()=>localStorage.setItem('gyak.cart',JSON.stringify([{color:'olive',size:'M',quantity:2},{product:'soft-hoodie',color:'stone',size:'L',quantity:1},{product:'no-such-product',color:'stone',size:'L',quantity:99},{product:'soft-hoodie',color:'invalid',size:'L',quantity:1}])));await load(corrupted);await corrupted.locator('.cart-trigger').click();assert.equal(await corrupted.locator('#cart-total').textContent(),'457,000원');assert.equal(await corrupted.locator('#cart-content .cart-row').count(),2);
  record('이미지·저장소 복구','늦은 색상 사진이 마지막 선택을 덮지 않음, 실패 시 기존 사진 유지, 저장 차단 시 메모리 장바구니, 기존 시안 장바구니 유지·손상 데이터 제외');
  assert.equal(errors.length,0);
  fs.writeFileSync(path.join(output,'site-check.json'),JSON.stringify({date:new Date().toISOString().slice(0,10),version:18,browser:await browser.version(),checks,errors},null,2));
  console.log(JSON.stringify({result:'pass',groups:checks.length,dimensions:dimensions.length,browser:await browser.version()}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
