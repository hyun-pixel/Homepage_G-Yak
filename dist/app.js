'use strict';

const products = window.GYAK_PRODUCTS;
const colorInfo = window.GYAK_COLORS;
const categories = window.GYAK_CATEGORIES;
const sizes = ['S', 'M', 'L', 'XL'];
const sizesFor = product => product.sizes || sizes;
const edits = window.GYAK_EDITS;
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const storageKey = 'gyak.cart';
const home = document.querySelector('#home-view');
const pageView = document.querySelector('#page-view');
const getProduct = id => products.find(product => product.id === id);
const money = value => new Intl.NumberFormat('ko-KR').format(value) + '원';
const icon = name => `<svg aria-hidden="true"><use href="assets/icons.svg?v=14#${name}"></use></svg>`;
const imageFor = (product, color) => `assets/${product.asset}-${color}.webp`;
const routeUrl = (page, params = {}) => '?' + new URLSearchParams({page, ...params});
const productUrl = (product, color = product.colors[0]) => routeUrl('product', {id:product.id, color});
let heroColor = 'olive';
let detailColor = '';
let detailSize = '';
let detailQuantity = 1;
let colorRequest = 0;
let cart = [];
let confirmationItems = null;
const returnFocus = new Map();
let savedProducts=readProductIDs('gyak.saved'),recentProducts=readProductIDs('gyak.recent'),noticeTimer;
const featuredIDs=['everyday-down','cozy-fleece','wind-shell','field-shirt','soft-hoodie','field-wide','daily-pack','rib-beanie'];

// Keep existing single-product carts; only whitelisted product choices are retained.
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) for (const item of saved) {
    if (!item) continue;
    const product = getProduct(item.product || 'everyday-down');
    if (!product || !product.colors.includes(item.color) || !sizesFor(product).includes(item.size) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) continue;
    const existing = cart.find(row => row.product === product.id && row.color === item.color && row.size === item.size);
    if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
    else cart.push({product:product.id, color:item.color, size:item.size, quantity:item.quantity});
  }
} catch { /* Optional browser storage may be unavailable. */ }

function saveCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* Memory cart remains usable. */ }
}
const cartKey = item => `${item.product}:${item.color}:${item.size}`;
const cartTotal = items => items.reduce((sum, item) => sum + getProduct(item.product).price * item.quantity, 0);

function openDialog(dialog, trigger) {
  const previous = document.querySelector('dialog[open]');
  const target = previous ? returnFocus.get(previous) : trigger || document.activeElement;
  if (previous && previous !== dialog) previous.close();
  returnFocus.set(dialog, target);
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('has-dialog');
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('close', () => {
    if (document.querySelector('dialog[open]')) return;
    document.body.classList.remove('has-dialog');
    const target = returnFocus.get(dialog);
    if (target?.isConnected && !target.closest('[hidden]')) target.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}


function readProductIDs(key){try{const saved=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(saved)?[...new Set(saved.filter(id=>typeof id==='string'&&getProduct(id)))].slice(0,24):[];}catch{return [];}}
function saveProductIDs(key,ids){try{localStorage.setItem(key,JSON.stringify(ids));}catch{/* In-memory choices remain available. */}}
function isCategory(product,category){return category==='all'||product.category===category||(category==='outer'&&product.category==='puffer');}
function searchProducts(query){const terms=query.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);return products.filter(product=>{const text=[product.name,product.english,categories[product.category],...(product.tags||[]),...product.colors.map(color=>colorInfo[color].label)].join(' ').normalize('NFKC').toLowerCase().replace(/\s+/g,'');return terms.every(term=>text.includes(term));});}
function saveButton(product,className=''){const selected=savedProducts.includes(product.id);return '<button type="button" class="save-toggle '+className+'" data-save="'+product.id+'" aria-pressed="'+selected+'" aria-label="'+product.name+' 관심상품 '+(selected?'해제':'저장')+'">'+icon('heart')+'</button>';}
function syncSaved(){document.querySelectorAll('[data-save]').forEach(button=>{const product=getProduct(button.dataset.save),selected=savedProducts.includes(product.id);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',product.name+' 관심상품 '+(selected?'해제':'저장'));});document.querySelectorAll('[data-saved-count]').forEach(label=>{label.textContent=String(savedProducts.length);label.hidden=!savedProducts.length;});}
function notifyShop(message){const notice=document.querySelector('#shop-notice');clearTimeout(noticeTimer);notice.textContent=message;notice.hidden=false;noticeTimer=setTimeout(()=>{notice.hidden=true;},4000);}
function toggleSaved(id){if(!getProduct(id))return;const removing=savedProducts.includes(id);savedProducts=removing?savedProducts.filter(item=>item!==id):[id,...savedProducts];saveProductIDs('gyak.saved',savedProducts);syncSaved();if(currentPage()==='saved'){renderSaved();pageView.querySelector('[data-save],h1')?.focus({preventScroll:true});}notifyShop(removing?'관심상품에서 해제했습니다.':'관심상품에 저장했습니다.');}
function relatedProducts(product){const ids=[...new Set([...product.related,...featuredIDs])];return ids.filter(id=>id!==product.id).map(getProduct).filter(Boolean).slice(0,4);}
function rememberProduct(id){recentProducts=[id,...recentProducts.filter(item=>item!==id)].slice(0,8);saveProductIDs('gyak.recent',recentProducts);}
function renderRecent(){const region=document.querySelector('#recent-products');if(!region)return;region.hidden=!recentProducts.length;region.innerHTML=recentProducts.length?'<header class="compact-heading"><h2>최근 본 상품</h2><button type="button" class="text-link" data-clear-recent>기록 지우기</button></header><div class="product-grid">'+productCards(recentProducts.slice(0,4).map(getProduct))+'</div>':'';}
function renderSaved(){pageView.innerHTML='<header class="page-heading"><div><h1 tabindex="-1">관심상품</h1><p>마음에 드는 상품을 모아 보세요. 현재 브라우저에 보관됩니다.</p></div><span>'+savedProducts.length+'개 상품</span></header>'+(savedProducts.length?'<div class="product-grid">'+productCards(savedProducts.map(getProduct))+'</div>':'<div class="empty-page"><h2>아직 저장한 상품이 없습니다.</h2><p>상품 사진의 하트 버튼을 눌러 관심상품에 저장해 보세요.</p><a class="button primary" href="'+routeUrl('shop')+'" data-route>상품 둘러보기'+icon('arrow-up-right')+'</a></div>');}
function shopLink(changes={}){const current=currentPage()==='shop'?Object.fromEntries(new URLSearchParams(location.search)):{};delete current.page;const values={...current,...changes};return routeUrl('shop',Object.fromEntries(Object.entries(values).filter(([key,value])=>['category','q','color','size','price','sort','edit'].includes(key)&&value!==null&&value!=='')));}
function updateArrivals(category='all'){const items=products.filter(product=>product.isNew&&isCategory(product,category)).slice(0,8);document.querySelector('#arrival-rail').innerHTML=productCards(items);document.querySelectorAll('[data-arrival]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.arrival===category)));const rail=document.querySelector('#arrival-rail');rail.scrollLeft=0;syncRail();syncSaved();}
function syncRail(){const rail=document.querySelector('#arrival-rail');if(!rail)return;const max=rail.scrollWidth-rail.clientWidth;document.querySelector('[data-rail="previous"]').disabled=rail.scrollLeft<2;document.querySelector('[data-rail="next"]').disabled=rail.scrollLeft>=max-2;}
function renderSearchPreview(){const value=document.querySelector('#global-search').value.slice(0,60).trim(),items=value?searchProducts(value):featuredIDs.slice(0,4).map(getProduct);const region=document.querySelector('#search-results');region.innerHTML='<p class="search-result-label" aria-live="polite">'+(value?items.length+'개의 상품을 찾았습니다.':'이런 상품은 어떠세요?')+'</p>'+(items.length?'<ul>'+items.slice(0,4).map(product=>'<li><a class="search-match" href="'+productUrl(product)+'" data-route><img src="'+imageFor(product,product.colors[0])+'" width="64" height="80" alt=""><span><strong>'+product.name+'</strong><span>'+money(product.price)+'</span></span>'+icon('arrow-up-right')+'</a></li>').join('')+'</ul>':'<p class="search-empty">다른 상품명이나 분류로 검색해 보세요.</p>');}
document.querySelector('#global-search').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();document.querySelector('#search-dialog').close();}});
const journalStories=[
 {id:'city-to-trail',title:'도시에서 숲길까지, 같은 옷으로.',summary:'평소의 옷을 입고, 익숙한 길을 조금 더 걸어 보는 일.',image:'weekend.webp',width:1448,height:1086,alt:'차콜색 패딩을 입고 호숫가를 걷는 남성',edit:'weekend',paragraphs:['바깥으로 나가는 데 꼭 거창한 준비가 필요한 것은 아닙니다. 평소 입던 팬츠와 편안한 한 겹이면 충분한 날도 있죠. 익숙한 동네의 다른 골목, 퇴근길에 잠깐 들르는 공원에서 하루의 풍경이 조금 달라집니다.','G-야크는 일상과 바깥을 따로 나누지 않는 옷차림을 생각합니다. 차분한 색을 중심에 두고, 포켓과 여밈처럼 자주 쓰는 디테일을 간결하게 정리합니다. 옷이 앞서기보다 나의 하루에 자연스럽게 어울리도록요.','주말에는 좋아하는 상의에 조금 넉넉한 팬츠를 맞춰 보세요. 작은 가방과 익숙한 재킷을 더하면 가까운 산책길부터 새로운 동네까지 나만의 속도로 이어집니다.']},
 {id:'everyday-layers',title:'한 겹씩, 나의 계절을 입다.',summary:'티셔츠에서 베스트와 재킷까지, 익숙한 옷을 새롭게 조합하는 방법.',image:'walk.webp',width:1122,height:1402,alt:'스톤색 패딩을 입고 공원 길을 걷는 여성',edit:'layers',paragraphs:['옷차림이 애매하게 느껴지는 날에는 두꺼운 한 벌 대신 서로 다른 두께의 옷을 조합해 보세요. 간결한 긴소매를 기본으로 두면 셔츠, 베스트, 재킷을 바꿔 입으며 다른 분위기를 만들 수 있습니다.','색은 두세 가지로 차분하게 이어 보세요. 스톤이나 크림처럼 밝은 기본에 올리브를 더하거나, 네이비와 샌드를 나란히 두면 서로의 표면과 형태가 자연스럽게 드러납니다.','여러 겹을 입을 때는 어깨와 소매의 여유도 함께 확인해 주세요. 제품별 사이즈 안내를 평소 옷의 치수와 비교하고, 움직일 때 편안한 형태를 골라 보세요. 정해진 답보다 내 하루에 맞는 조합이 먼저입니다.']}
];
function journalCards(){return journalStories.map(story=>'<a class="journal-card" href="'+routeUrl('journal',{id:story.id})+'" data-route><figure><img src="assets/'+story.image+'" width="'+story.width+'" height="'+story.height+'" loading="lazy" alt="'+story.alt+'"></figure><div><h3>'+story.title+'</h3><p>'+story.summary+'</p><span class="text-link">이야기 읽기'+icon('arrow-up-right')+'</span></div></a>').join('');}
function renderJournal(id){const story=journalStories.find(item=>item.id===id);if(!story){pageView.innerHTML='<header class="page-heading journal-heading"><div><h1 tabindex="-1">일상의 바깥, G-야크 노트.</h1><p>옷을 입고, 길을 걷고, 나만의 하루를 발견하는 이야기.</p></div></header><div class="journal-grid">'+journalCards()+'</div>';return;}pageView.innerHTML='<article class="journal-article"><nav class="breadcrumb" aria-label="현재 위치"><a href="'+routeUrl('journal')+'" data-route>저널</a><span aria-hidden="true">›</span><span>스타일 노트</span></nav><header><h1 tabindex="-1">'+story.title+'</h1><p>'+story.summary+'</p></header><figure class="journal-hero"><img src="assets/'+story.image+'" alt="'+story.alt+'" width="'+story.width+'" height="'+story.height+'"></figure><div class="article-body">'+story.paragraphs.map(text=>'<p>'+text+'</p>').join('')+'<a class="button primary" href="'+routeUrl('shop',{edit:story.edit})+'" data-route>이야기 속 스타일 살펴보기'+icon('arrow-up-right')+'</a></div><section class="related-section"><h2>함께 어울리는 상품</h2><div class="product-grid">'+productCards(edits[story.edit].products.slice(0,4).map(getProduct))+'</div></section></article>';}
function renderGuide(){pageView.innerHTML='<header class="page-heading guide-heading"><div><h1 tabindex="-1">쇼핑 가이드</h1><p>내게 맞는 옷을 고르고, 오래 함께하기 위한 작은 안내.</p></div></header><div class="guide-layout"><nav aria-label="안내 바로가기"><a href="#guide-size">사이즈 선택</a><a href="#guide-care">옷 관리</a><a href="#guide-saved">관심상품·장바구니</a></nav><div class="guide-sections"><section id="guide-size"><h2>내게 맞는 사이즈</h2><details open><summary>사이즈는 어떻게 고르나요?</summary><p>상품 상세의 사이즈 선택 아래에서 사이즈 안내를 펼쳐 주세요. 평소 편하게 입는 옷의 가슴 단면·허리둘레·총장을 표의 해당 항목과 비교해 주세요. 가슴 단면은 펼친 옷의 가로 너비이며, 허리둘레는 허리 부분을 한 바퀴 잰 길이입니다. 겹쳐 입을 옷의 두께와 어깨·소매의 여유도 함께 살펴보세요.</p></details><details><summary>FREE 사이즈는 무엇인가요?</summary><p>한 가지 사이즈로 구성된 상품입니다. 모자·비니·가방은 상품 사진과 디자인 설명을 먼저 살펴보고, 상품 상세에서 FREE를 선택해 주세요.</p></details></section><section id="guide-care"><h2>옷과 오래 함께하기</h2><details><summary>세탁 전에는 무엇을 확인하나요?</summary><p>옷 안쪽의 취급 표시를 먼저 확인해 주세요. 색상과 소재가 다른 옷은 구분하고, 장식이나 지퍼가 다른 옷과 마찰하지 않도록 정돈합니다. 세탁·건조 방법은 각 제품의 취급 표시를 우선해 주세요.</p></details><details><summary>보관할 때는 어떻게 하나요?</summary><p>옷이 충분히 마른 상태인지 확인하고 포켓을 비워 주세요. 형태가 과하게 눌리지 않도록 정돈해 바람이 통하는 곳에 보관하는 것이 좋습니다.</p></details></section><section id="guide-saved"><h2>관심상품과 장바구니</h2><details><summary>선택한 상품은 어디에 보관되나요?</summary><p>관심상품과 장바구니는 현재 브라우저에 보관됩니다. 로그인 없이 사용할 수 있으며 다른 기기와 자동으로 연결되지는 않습니다. 브라우저 저장 공간을 지우면 선택 내역도 사라질 수 있습니다.</p></details><details><summary>입력한 받는 분 정보는 저장되나요?</summary><p>이름·연락처·주소는 현재 입력 화면에서만 확인합니다. 확인을 마치거나 화면을 벗어나면 지워지며 브라우저 저장소나 서버에 보관하지 않습니다.</p></details></section><a class="text-link" href="'+routeUrl('shop')+'" data-route>상품 둘러보기'+icon('arrow-up-right')+'</a></div></div>';}

function productCards(items){return items.map(product=>'<article class="product-tile"><a class="product-card" href="'+productUrl(product)+'" data-route><figure><img src="'+imageFor(product,product.colors[0])+'" alt="'+colorInfo[product.colors[0]].label+'색 '+product.name+'" width="900" height="1200" loading="lazy" decoding="async">'+(product.isNew?'<span class="product-tag">NEW</span>':product.id==='everyday-down'?'<span class="product-tag signature-tag">시그니처</span>':'')+'</figure><h3>'+product.name+'</h3><p class="card-price">'+money(product.price)+'</p><p class="card-colors"><span class="palette-dots" aria-hidden="true">'+product.colors.map(color=>'<span style="background:'+colorInfo[color].hex+'"></span>').join('')+'</span><span>'+(product.colors.length===1?colorInfo[product.colors[0]].label:product.colors.length+'가지 색상')+'</span></p></a>'+saveButton(product)+'</article>').join('');}

function homeAdditions(){
 document.querySelector('#home-additions').innerHTML='<nav class="shop-shortcuts" aria-label="상품 바로가기">'+'<h2>카테고리로 <br>둘러보기</h2><div class="shortcut-items">'+[['outer','wind-shell','olive'],['puffer','everyday-down','stone'],['tops','rugby-long','clay'],['pants','field-wide','charcoal'],['gear','field-hat','stone']].map(([key,id,color])=>{const product=getProduct(id);return '<a href="'+routeUrl('shop',{category:key})+'" data-route><span class="shortcut-image"><img src="'+imageFor(product,color)+'" alt="" width="'+(id==='everyday-down'?1000:1024)+'" height="'+(id==='everyday-down'?1200:1536)+'" loading="lazy" decoding="async"></span><span class="shortcut-label">'+categories[key]+'</span></a>';}).join('')+'</div></nav><section class="collection-section shopfront-section" aria-labelledby="collection-title"><header class="section-heading"><div><h2 id="collection-title">새로운 계절,<br>새롭게 만나는 옷.</h2><p>하루의 반경을 넓혀 줄 G-야크의 새로운 선택.</p></div><a class="text-link" href="'+routeUrl('shop',{sort:'newest'})+'" data-route>신상품 모두 보기'+icon('arrow-up-right')+'</a></header><div class="shelf-toolbar"><div class="shelf-tabs" role="group" aria-label="신상품 분류">'+[['all','전체'],['outer','아우터'],['tops','상의'],['pants','팬츠'],['gear','용품']].map(([key,label])=>'<button type="button" data-arrival="'+key+'" aria-pressed="'+(key==='all')+'">'+label+'</button>').join('')+'</div><div class="rail-controls"><button type="button" class="icon-button" data-rail="previous" aria-label="이전 신상품" disabled>'+icon('arrow-left')+'</button><button type="button" class="icon-button" data-rail="next" aria-label="다음 신상품">'+icon('arrow-right')+'</button></div></div><div id="arrival-rail" class="arrival-rail" tabindex="0" role="region" aria-label="신상품 목록, 가로로 이동해 더 보기">'+productCards(products.filter(product=>product.isNew).slice(0,8))+'</div><div class="category-entry-grid category-grid-four">'+[['outer','everyday-down','가볍게 걸치는 한 겹'],['tops','rugby-long','하루를 시작하는 기본'],['pants','field-wide','나만의 속도로 편안하게'],['gear','daily-pack','옷차림을 완성하는 작은 선택']].map(([category,id,copy])=>{const product=getProduct(id);return '<a class="category-entry" href="'+routeUrl('shop',{category})+'" data-route><img src="'+imageFor(product,product.colors[0])+'" alt="'+product.name+'" width="900" height="1200" loading="lazy"><span><span>'+categories[category]+'<small>'+copy+'</small></span>'+icon('arrow-up-right')+'</span></a>';}).join('')+'</div></section>';
 document.querySelector('#home-tail').innerHTML='<section class="edit-campaign"><a class="campaign-media" href="'+routeUrl('shop',{edit:'weekend'})+'" data-route aria-label="주말의 옷차림 컬렉션"><img src="assets/weekend.webp" width="1448" height="1086" loading="lazy" alt="호숫가 산책로에서 차콜색 패딩을 입고 걷는 남성"></a><div class="campaign-copy"><h2>가까운 곳부터,<br>조금 더 멀리.</h2><p>주말을 위한 특별한 옷보다<br>매일 입고 싶은 옷으로 나서는 시간.</p><a class="button secondary" href="'+routeUrl('shop',{edit:'weekend'})+'" data-route>주말의 옷차림 보기'+icon('arrow-up-right')+'</a></div></section><section class="home-journal"><header class="compact-heading"><div><h2>일상의 바깥, G-야크 노트.</h2><p>옷과 함께 쌓이는 우리의 이야기.</p></div><a class="text-link" href="'+routeUrl('journal')+'" data-route>모든 이야기'+icon('arrow-up-right')+'</a></header><div class="journal-grid">'+journalCards()+'</div></section><section id="recent-products" class="recent-section" hidden></section><section class="home-brand" aria-labelledby="home-brand-title"><div><div><h2 id="home-brand-title">밖을 향해,<br>일상에 가깝게.</h2><p>특별한 날을 기다리지 않아도 입기 좋은 옷.<br>G-야크는 우리의 하루에서 시작합니다.</p></div><a class="button secondary" href="'+routeUrl('brand')+'" data-route>G-야크 이야기'+icon('arrow-up-right')+'</a></div></section>';
 document.querySelector('#arrival-rail').addEventListener('scroll',syncRail,{passive:true});window.addEventListener('resize',syncRail,{passive:true});renderRecent();requestAnimationFrame(syncRail);
}

function cartRows(items) {
  return items.map(item => {
    const product = getProduct(item.product), label = `${colorInfo[item.color].label} / ${item.size}`;
    return `<article class="cart-row" data-cart-key="${cartKey(item)}">
      <a href="${productUrl(product,item.color)}" data-route aria-label="${product.name} 상세 보기"><img class="cart-thumb" src="${imageFor(product,item.color)}" alt="${colorInfo[item.color].label}색 ${product.name}" width="88" height="114"></a>
      <div class="cart-row-info"><h3><a href="${productUrl(product,item.color)}" data-route>${product.name}</a></h3><p class="cart-option">${label}</p><p class="cart-item-price">${money(product.price * item.quantity)}</p>
      <div class="cart-row-controls"><div class="quantity-control" aria-label="${product.name} ${label} 수량"><button type="button" data-cart-action="decrease" aria-label="${product.name} 수량 줄이기" ${item.quantity===1?'disabled':''}>${icon('minus')}</button><span>${item.quantity}</span><button type="button" data-cart-action="increase" aria-label="${product.name} 수량 늘리기" ${item.quantity===99?'disabled':''}>${icon('plus')}</button></div><button type="button" class="cart-remove" data-cart-action="remove" aria-label="${product.name} ${label} 삭제">삭제</button></div></div>
    </article>`;
  }).join('');
}
function orderLines(items) {
  return `<div class="order-lines">${items.map(item=>{const product=getProduct(item.product);return `<article class="order-line"><img src="${imageFor(product,item.color)}" alt="${product.name}" width="64" height="80"><div><h3>${product.name}</h3><p>${colorInfo[item.color].label} / ${item.size} / ${item.quantity}개</p><strong>${money(product.price*item.quantity)}</strong></div></article>`;}).join('')}</div>`;
}
function emptyCart() {
  return `<div class="empty-page"><h1 tabindex="-1">장바구니가 비어 있습니다.</h1><p>일상에 어울리는 옷을 골라 보세요.</p><a class="button primary" href="${routeUrl('shop')}" data-route>상품 둘러보기${icon('arrow-up-right')}</a></div>`;
}
function renderCart(announcement='') {
  const count=cart.reduce((sum,item)=>sum+item.quantity,0);
  document.querySelectorAll('[data-cart-count]').forEach(badge=>{badge.hidden=!count;badge.textContent=count>99?'99+':String(count);});
  document.querySelector('.cart-trigger').setAttribute('aria-label',count?`장바구니 열기, 상품 ${count}개`:'장바구니 열기');
  document.querySelector('#cart-total').textContent=money(cartTotal(cart));
  document.querySelector('#cart-content').innerHTML=cart.length?cartRows(cart):`<div class="cart-empty"><h3>장바구니가 비어 있습니다.</h3><p>일상에 어울리는 옷을 골라 보세요.</p><a class="text-link" href="${routeUrl('shop')}" data-route>상품 둘러보기${icon('arrow-up-right')}</a></div>`;
  document.querySelector('[data-cart-checkout]').hidden=!cart.length;
  document.querySelector('#cart-status').textContent=announcement;
  if (currentPage()==='cart') renderCartPage();
  if (currentPage()==='checkout' && pageView.querySelector('#checkout-form')) {
    if (!cart.length) { clearPersonalFields(); renderCheckout(); }
    else pageView.querySelector('.order-summary').innerHTML=`<h2>선택한 상품</h2>${orderLines(cart)}<div class="cart-total"><span>상품 합계</span><strong>${money(cartTotal(cart))}</strong></div><a class="text-link" href="${routeUrl('cart')}" data-route>장바구니 수정</a>`;
  }
}
function renderCartPage() {
  pageView.innerHTML=cart.length?`<header class="page-heading"><div><h1 tabindex="-1">장바구니</h1><p>선택한 상품과 옵션을 확인해 주세요.</p></div><span>${cart.reduce((sum,item)=>sum+item.quantity,0)}개 상품</span></header>
    <div class="cart-layout"><div class="cart-page-items">${cartRows(cart)}</div><aside class="order-summary"><h2>선택 내역</h2><div class="cart-total"><span>상품 합계</span><strong>${money(cartTotal(cart))}</strong></div><a class="button primary" href="${routeUrl('checkout')}" data-route>주문 정보 입력${icon('arrow-up-right')}</a><a class="text-link" href="${routeUrl('shop')}" data-route>쇼핑 계속하기</a></aside></div>`:emptyCart();
}

function swatches(product,color) {
  return `<fieldset class="color-picker"><legend>색상 <span data-color-label>${colorInfo[color].label}</span></legend><div class="swatches">${product.colors.map(option=>`<button type="button" class="swatch ${option===color?'selected':''}" data-detail-color="${option}" aria-label="${colorInfo[option].label}색 선택" aria-pressed="${option===color}"><span style="background:${colorInfo[option].hex}"></span></button>`).join('')}</div></fieldset>`;
}
function sizeGuide(product) {
  // Fictional garment measurements; these are documented design data, not measured products.
  if(product.category==='gear')return '<details id="size-guide"><summary>사이즈 안내</summary><div class="guide-content"><p>단일 사이즈 FREE로 구성됩니다. 제품의 전체 형태와 디테일은 사진을 눌러 확인해 주세요.</p><p>사진과 디자인 설명을 함께 살펴보고 원하는 형태인지 확인해 주세요.</p></div></details>';
  const pants=product.category==='pants',vest=product.id==='light-vest'||product.sleeveless;
  const table=product.measurements||(vest?[['S',52,40,65],['M',55,42,67],['L',58,44,69],['XL',61,46,71]]:pants?[['S',68,100,98],['M',72,104,100],['L',76,108,102],['XL',80,112,104]]:[['S',52,58,65],['M',55,60,67],['L',58,62,69],['XL',61,64,71]]);
  return `<details id="size-guide"><summary>사이즈 안내</summary><div class="guide-content"><p>평소 편하게 입는 옷의 치수와 비교해 주세요. 단위는 cm입니다.</p><p>${pants?'허리와 엉덩이는 둘레를, 총장은 옷의 전체 길이를 기준으로 비교해 주세요.':'가슴 단면은 옷을 평평하게 펼친 가슴 부분의 가로 너비입니다.'}</p><table class="size-guide-table"><thead><tr><th scope="col">사이즈</th><th scope="col">${pants?'허리둘레':'가슴 단면'}</th><th scope="col">${pants?'엉덩이둘레':vest?'어깨너비':'소매 길이'}</th><th scope="col">총장</th></tr></thead><tbody>${table.map(row=>`<tr><th scope="row">${row[0]}</th>${row.slice(1).map(value=>`<td>${value}</td>`).join('')}</tr>`).join('')}</tbody></table><p>여유 있게 겹쳐 입는 스타일을 원하면 평소 옷의 품과 길이를 함께 비교해 주세요.</p></div></details>`;
}
function renderProduct(product,requestedColor) {
  rememberProduct(product.id);
  detailColor=product.colors.includes(requestedColor)?requestedColor:product.colors[0];detailSize='';detailQuantity=1;
  pageView.innerHTML=`<nav class="breadcrumb" aria-label="현재 위치"><a href="${routeUrl('home')}" data-route>홈</a><span aria-hidden="true">›</span><a href="${routeUrl('shop',{category:product.category})}" data-route>${categories[product.category]}</a><span aria-hidden="true">›</span><span aria-current="page">${product.name}</span></nav>
    <div class="product-detail-layout"><div class="detail-gallery"><button type="button" class="detail-image-button" aria-label="${product.name} 사진 크게 보기" data-zoom><img id="detail-image" src="${imageFor(product,detailColor)}" alt="${colorInfo[detailColor].label}색 ${product.name} 전체 모습" width="900" height="1200" fetchpriority="high"></button><p class="photo-help">사진을 누르면 크게 볼 수 있습니다.</p>
    </div>
    <div class="detail-info"><p class="product-series">${product.english}</p><div class="detail-title-row"><h1 tabindex="-1">${product.name}</h1>${saveButton(product)}</div><p class="dialog-price">${money(product.price)}</p><p class="detail-description">${product.description}</p>${swatches(product,detailColor)}
      <fieldset class="size-picker"><legend>사이즈</legend><div class="size-options">${sizesFor(product).map(size=>`<button type="button" data-size="${size}" aria-pressed="false">${size}</button>`).join('')}</div><p id="size-error" class="field-error" aria-live="polite"></p><div class="product-guide detail-size-guide">${sizeGuide(product)}</div></fieldset>
      <div class="detail-quantity"><span id="quantity-label">수량</span><div class="quantity-control"><button type="button" data-detail-quantity="decrease" aria-label="수량 줄이기" disabled>${icon('minus')}</button><input id="detail-quantity" type="number" min="1" max="99" step="1" value="1" aria-labelledby="quantity-label" aria-describedby="quantity-error" inputmode="numeric"><button type="button" data-detail-quantity="increase" aria-label="수량 늘리기">${icon('plus')}</button></div><p id="quantity-error" class="field-error" aria-live="polite"></p></div>
      <p class="product-message" aria-live="polite"></p><div class="detail-total"><span>상품 합계</span><strong id="detail-total">${money(product.price)}</strong></div><div class="purchase-actions"><button type="button" class="button primary add-to-cart">장바구니 담기${icon('bag')}</button></div>
    </div><section class="detail-explain" aria-labelledby="design-title"><h2 id="design-title">${product.line}</h2><ul class="design-points">${product.points.map(point=>`<li>${point}</li>`).join('')}</ul>${product.id==='everyday-down'?'<figure class="detail-lifestyle"><img src="assets/commute.webp" alt="에브리데이 라이트 다운을 입은 남녀의 일상 모습" width="1536" height="1024" loading="lazy"><figcaption>도시의 하루에 자연스럽게 어울리는 옷.</figcaption></figure>':''}<div class="product-guide"><details><summary>스타일·관리 안내</summary><div class="guide-content"><p>${product.description}</p><p>함께 입는 옷의 형태와 색을 편안하게 맞춰 보세요. 보관할 때는 옷의 형태를 정돈하고 충분히 건조한 상태를 확인해 주세요.</p></div></details></div></section></div><section class="related-section" aria-labelledby="related-title"><h2 id="related-title">함께 어울리는 상품</h2><div class="product-grid">${productCards(relatedProducts(product))}</div></section>`;
}

function renderShop(category){
 const params=new URLSearchParams(location.search),selected=Object.hasOwn(categories,category)?category:'all',query=(params.get('q')||'').trim().slice(0,60),color=Object.hasOwn(colorInfo,params.get('color'))?params.get('color'):'',size=[...sizes,'FREE'].includes(params.get('size'))?params.get('size'):'',price=['under70','70to120','over120'].includes(params.get('price'))?params.get('price'):'',edit=Object.hasOwn(edits,params.get('edit'))?params.get('edit'):'',sort=['recommended','newest','price-asc','price-desc'].includes(params.get('sort'))?params.get('sort'):'recommended';
 let items=searchProducts(query).filter(product=>isCategory(product,selected)&&(!color||product.colors.includes(color))&&(!size||sizesFor(product).includes(size))&&(!edit||edits[edit].products.includes(product.id))&&(!price||(price==='under70'?product.price<70000:price==='70to120'?product.price>=70000&&product.price<=120000:product.price>120000)));
 const rank=id=>featuredIDs.includes(id)?featuredIDs.indexOf(id):featuredIDs.length+products.findIndex(product=>product.id===id);
 items.sort((a,b)=>sort==='price-asc'?a.price-b.price:sort==='price-desc'?b.price-a.price:sort==='newest'?Number(!!b.isNew)-Number(!!a.isNew):rank(a.id)-rank(b.id));
 const title=query?'검색 결과':edit?edits[edit].title:selected==='all'?'전체 상품':categories[selected],description=query?'“'+escapeHTML(query)+'” 검색 결과입니다.':edit?edits[edit].description:'우리의 하루에 자연스럽게 어울리는 옷.';
 const priceLabels={under70:'7만원 미만','70to120':'7만~12만원',over120:'12만원 초과'},active=[...(query?[['q','검색: '+query]]:[]),...(edit?[['edit',edits[edit].title]]:[]),...(color?[['color',colorInfo[color].label]]:[]),...(size?[['size',size]]:[]),...(price?[['price',priceLabels[price]]]:[])];
 pageView.innerHTML='<header class="page-heading"><div><h1 tabindex="-1">'+title+'</h1><p>'+description+'</p></div><span aria-live="polite">'+items.length+'개 상품</span></header><nav class="category-tabs" aria-label="상품 분류">'+Object.entries(categories).map(([key,label])=>'<a href="'+shopLink({category:key})+'" data-route '+(key===selected?'aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav><div class="catalog-toolbar"><form id="catalog-search" role="search"><label class="sr-only" for="catalog-query">상품 검색</label><input id="catalog-query" type="search" name="q" maxlength="60" placeholder="상품명이나 분류로 검색" value="'+escapeHTML(query)+'"><button class="icon-button" type="submit" aria-label="검색">'+icon('search')+'</button></form><label class="sort-control" for="shop-sort">정렬<select id="shop-sort">'+[['recommended','추천순'],['newest','신상품순'],['price-asc','낮은 가격순'],['price-desc','높은 가격순']].map(([key,label])=>'<option value="'+key+'" '+(key===sort?'selected':'')+'>'+label+'</option>').join('')+'</select></label></div><details class="shop-filter" '+(color||size||price?'open':'')+'><summary>'+icon('sliders')+'필터<span>'+(color||size||price?'적용 중':'색상 · 사이즈 · 가격')+'</span></summary><form id="shop-filter-form"><label>색상<select name="color"><option value="">모든 색상</option>'+Object.entries(colorInfo).map(([key,value])=>'<option value="'+key+'" '+(color===key?'selected':'')+'>'+value.label+'</option>').join('')+'</select></label><label>사이즈<select name="size"><option value="">모든 사이즈</option>'+[...sizes,'FREE'].map(value=>'<option '+(size===value?'selected':'')+'>'+value+'</option>').join('')+'</select></label><label>가격<select name="price"><option value="">모든 가격</option>'+Object.entries(priceLabels).map(([key,value])=>'<option value="'+key+'" '+(price===key?'selected':'')+'>'+value+'</option>').join('')+'</select></label><div class="filter-actions"><a class="text-link" href="'+shopLink({color:null,size:null,price:null})+'" data-route>필터 초기화</a><button type="submit" class="button primary">적용하기</button></div></form></details>'+(active.length?'<div class="active-filters" aria-label="선택한 조건">'+active.map(([key,label])=>'<a href="'+shopLink({[key]:null})+'" data-route aria-label="'+escapeHTML(label)+' 조건 해제">'+escapeHTML(label)+icon('x')+'</a>').join('')+'</div>':'')+(items.length?'<div class="product-grid catalog-grid">'+productCards(items)+'</div>':'<div class="empty-page"><h2>조건에 맞는 상품이 없습니다.</h2><p>검색어를 바꾸거나 필터를 해제해 주세요.</p><a class="button primary" href="'+routeUrl('shop')+'" data-route>전체 상품 보기'+icon('arrow-up-right')+'</a></div>');
}

function renderBrand() {
  pageView.innerHTML=`<div class="brand-page"><header class="brand-heading"><h1 tabindex="-1">밖을 향해,<br>일상에 가깝게.</h1><p>특별한 날을 기다리지 않아도 입기 좋은 옷.<br>우리가 보내는 평범한 하루와<br>잠깐 바깥으로 나서는 순간을 생각합니다.</p></header><figure class="brand-hero-image"><img src="assets/commute.webp" alt="도시를 함께 걷는 두 사람의 편안한 옷차림" width="1536" height="1024" fetchpriority="high"></figure>
    <section class="brand-story"><figure><img src="assets/walk.webp" alt="공원에서 산책하는 여성의 일상 패딩 스타일" width="1122" height="1402" loading="lazy"></figure><div><h2>일상에서<br>먼저 떠오르는 옷.</h2><p>아침의 출근길, 오후의 짧은 산책, 느긋하게 나서는 주말. 다른 순간에도 자연스럽게 어울리는 옷을 생각합니다.</p><p>차분한 색과 편안한 형태. 평소 즐겨 입는 옷 사이에서, 낯설지 않게 함께할 수 있도록.</p></div></section>
    <section class="brand-story reverse"><figure><img src="assets/weekend.webp" alt="호숫가 산책로를 걷는 남성의 편안한 주말 옷차림" width="1448" height="1086" loading="lazy"></figure><div><h2>조금 더 편하게,<br>조금 더 자연스럽게.</h2><p>옷을 고르는 기준은 우리의 일상입니다. 겹쳐 입기 좋은 형태와 담백한 선, 함께 어울리는 색으로 옷차림을 이어갑니다.</p><p>G-야크는 일상과 바깥의 경계를 자연스럽게 잇는 아웃도어를 생각합니다.</p></div></section><section class="brand-end"><h2>당신의 하루에<br>어울리는 한 벌.</h2><a class="button primary" href="${routeUrl('shop')}" data-route>컬렉션 살펴보기${icon('arrow-up-right')}</a></section></div>`;
}

function checkoutField(id,label,placeholder,options={}) {
  return `<div class="field"><label for="${id}">${label}${options.optional?' <span>(선택)</span>':''}</label><input id="${id}" type="${options.type||'text'}" placeholder="${placeholder}" autocomplete="off" maxlength="${options.max||160}" ${options.inputmode?`inputmode="${options.inputmode}"`:''} aria-describedby="${id}-error" ${options.optional?'':'required'}><p id="${id}-error" class="field-error"></p></div>`;
}
function renderCheckout() {
  if(!cart.length){pageView.innerHTML=emptyCart();return;}
  pageView.innerHTML=`<header class="page-heading"><div><h1 tabindex="-1">주문 정보</h1><p>선택한 상품과 받는 분의 정보를 확인해 주세요.</p></div></header><div class="checkout-layout"><form id="checkout-form" class="checkout-form" novalidate autocomplete="off"><h2>받는 분 정보</h2>
    ${checkoutField('recipient','받는 분','받으실 분의 이름',{max:40})}${checkoutField('phone','연락처','010-1234-5678',{type:'tel',inputmode:'tel',max:20})}${checkoutField('postcode','우편번호','5자리 우편번호',{inputmode:'numeric',max:5})}${checkoutField('address','주소','도로명과 건물 번호')}${checkoutField('address-detail','상세 주소','동·호수 등',{optional:true,max:120})}${checkoutField('delivery-note','받는 곳 메모','필요한 내용이 있으면 적어 주세요',{optional:true,max:120})}
    <p class="privacy-note">입력한 정보는 이 화면에서만 확인하며 저장하지 않습니다. 확인을 마치거나 화면을 벗어나면 입력값이 지워집니다.</p><button type="submit" class="button primary">주문 정보 확인${icon('arrow-up-right')}</button></form>
    <aside class="order-summary"><h2>선택한 상품</h2>${orderLines(cart)}<div class="cart-total"><span>상품 합계</span><strong>${money(cartTotal(cart))}</strong></div><a class="text-link" href="${routeUrl('cart')}" data-route>장바구니 수정</a></aside></div>`;
}
function renderConfirmation() {
  if(!confirmationItems){pageView.innerHTML=`<div class="empty-page"><h1 tabindex="-1">확인할 상품 내역이 없습니다.</h1><p>일상에 어울리는 옷을 먼저 골라 보세요.</p><a class="button primary" href="${routeUrl('shop')}" data-route>상품 둘러보기${icon('arrow-up-right')}</a></div>`;return;}
  pageView.innerHTML=`<div class="confirmation-wrap"><h1 tabindex="-1">주문 정보를 확인했습니다.</h1><p>선택하신 상품과 금액을 확인해 주세요.<br>입력하신 받는 분 정보는 저장하지 않았습니다.</p><section class="order-summary"><h2>확인한 선택 내역</h2>${orderLines(confirmationItems)}<div class="cart-total"><span>상품 합계</span><strong>${money(cartTotal(confirmationItems))}</strong></div></section><div class="confirmation-actions"><a class="button primary" href="${routeUrl('shop')}" data-route>쇼핑 계속하기${icon('arrow-up-right')}</a><a class="button secondary" href="${routeUrl('home')}" data-route>홈으로</a></div></div>`;
}

function currentPage(){return new URLSearchParams(location.search).get('page')||'home';}
function currentProduct(){return getProduct(new URLSearchParams(location.search).get('id'));}
function clearPersonalFields(){document.querySelectorAll('#checkout-form input').forEach(input=>{input.value='';});}
function renderPage(focus=false) {
  document.querySelectorAll('.color-picker[aria-busy="true"]').forEach(picker=>picker.setAttribute('aria-busy','false'));
  const params=new URLSearchParams(location.search),page=currentPage();
  const product=currentProduct();
  home.hidden=page!=='home';pageView.hidden=page==='home';document.body.classList.toggle('is-product',page==='product');
  pageView.classList.remove('brand-view');
  const titles={home:'일상에 가까운 아웃도어',shop:'컬렉션',brand:'G-야크 이야기',cart:'장바구니',checkout:'주문 정보',confirmation:'주문 정보 확인',saved:'관심상품',journal:'저널',guide:'쇼핑 가이드'};
  document.title=`${product&&page==='product'?product.name:(Object.hasOwn(titles,page)?titles[page]:'페이지')} | G-야크`;
  if(page==='shop')renderShop(params.get('category')||'all');
  else if(page==='product'&&product)renderProduct(product,params.get('color'));
  else if(page==='brand')renderBrand();
  else if(page==='saved')renderSaved();
  else if(page==='journal')renderJournal(params.get('id'));
  else if(page==='guide')renderGuide();
  else if(page==='cart')renderCartPage();
  else if(page==='checkout')renderCheckout();
  else if(page==='confirmation')renderConfirmation();
  else if(page!=='home')pageView.innerHTML=`<div class="empty-page"><h1 tabindex="-1">페이지를 찾을 수 없습니다.</h1><p>상품 목록에서 다시 찾아보세요.</p><a class="button primary" href="${routeUrl('shop')}" data-route>상품 둘러보기${icon('arrow-up-right')}</a></div>`;
  syncSaved();if(page==='home'){renderRecent();requestAnimationFrame(syncRail);}
  const active=page==='journal'?'journal':page==='brand'?'brand':page==='shop'?(params.get('category')||'all'):page==='product'&&product?product.category:'';
  document.querySelectorAll('[data-nav]').forEach(link=>{const selected=link.dataset.nav===active||(active==='puffer'&&link.dataset.nav==='outer'&&!!link.closest('.desktop-nav'));link.classList.toggle('current',selected);if(selected)link.setAttribute('aria-current',page==='product'?'location':'page');else link.removeAttribute('aria-current');});
  if(focus){const heading=page==='home'?document.querySelector('.scene-intro h1'):pageView.querySelector('h1');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
  if(location.hash==='#size-guide'&&page==='product'){const guide=pageView.querySelector('#size-guide');if(guide){guide.open=true;guide.scrollIntoView({behavior:'instant',block:'start'});}}
}
function navigate(href) {
  const url=new URL(href,location.href);
  if(url.origin!==location.origin)return;
  clearPersonalFields();colorRequest++;
  document.querySelectorAll('dialog[open]').forEach(dialog=>{returnFocus.delete(dialog);dialog.close();});
  document.body.classList.remove('has-dialog');
  history.replaceState({scroll:scrollY},'',location.href);
  history.pushState({scroll:0},'',url);
  renderPage(true);
  if(!url.hash)window.scrollTo({top:0,behavior:'instant'});
}
history.scrollRestoration='manual';
window.addEventListener('pagehide',clearPersonalFields);
window.addEventListener('popstate',()=>{clearPersonalFields();colorRequest++;document.querySelectorAll('dialog[open]').forEach(dialog=>{returnFocus.delete(dialog);dialog.close();});document.body.classList.remove('has-dialog');renderPage(true);window.scrollTo({top:history.state?.scroll||0,behavior:'instant'});});

async function loadHeroPose(color) {
  const picture=new Image();picture.fetchPriority='low';picture.src=`assets/puffer-${color}-open-wide.webp`;
  try{await picture.decode();return picture;}catch{return null;}
}
function applyHeroPose(picture) {
  const product=document.querySelector('.hero-product');
  product.classList.remove('pose-ready');
  if(picture){document.querySelector('#hero-open-image').src=picture.src;product.classList.add('pose-ready');}
}
async function selectColor(color,forHero) {
  const product=forHero?getProduct('everyday-down'):currentProduct();
  if(!product||!product.colors.includes(color))return;
  const request=++colorRequest, scope=forHero?document.querySelector('.hero-shop'):document.querySelector('.detail-info');
  if(!scope)return;
  const message=forHero?document.querySelector('#hero-message'):scope.querySelector('.product-message');
  scope.querySelector('.color-picker').setAttribute('aria-busy','true');
  const add=scope.querySelector('.add-to-cart');if(add)add.disabled=true;
  message.textContent=forHero?'':'사진을 불러오는 중입니다.';message.dataset.state='loading';
  const picture=new Image();picture.src=imageFor(product,color);
  const posePromise=forHero?loadHeroPose(color):null;let pose=null;
  try{await picture.decode();if(forHero)pose=await posePromise;}catch{
    if(request===colorRequest){message.dataset.state='error';message.textContent=forHero?'사진을 불러오지 못했습니다.':'사진을 불러오지 못했습니다. 색상을 다시 선택해 주세요.';}
    return;
  }finally{if(request===colorRequest){scope.querySelector('.color-picker').setAttribute('aria-busy','false');if(add)add.disabled=false;}}
  if(request!==colorRequest)return;
  if(forHero)heroColor=color;else detailColor=color;
  const image=document.querySelector(forHero?'#hero-image':'#detail-image');image.src=picture.src;image.alt=`${colorInfo[color].label}색 ${product.name} 전체 모습`;
  if(forHero)applyHeroPose(pose);
  scope.querySelector('[data-color-label]').textContent=colorInfo[color].label;
  scope.querySelectorAll(forHero?'[data-color]':'[data-detail-color]').forEach(button=>{const selected=(forHero?button.dataset.color:button.dataset.detailColor)===color;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  message.textContent='';message.dataset.state='';
  if(forHero)document.querySelector('#color-status').textContent=`${colorInfo[color].label}색을 선택했습니다.`;
  else{const url=new URL(location.href);url.searchParams.set('color',color);history.replaceState(history.state,'',url);}
}
function updateQuantity(value) {
  const input=document.querySelector('#detail-quantity');if(!input)return false;
  const valid=Number.isInteger(value)&&value>=1&&value<=99;
  input.setAttribute('aria-invalid',String(!valid));document.querySelector('#quantity-error').textContent=valid?'':'수량은 1개부터 99개까지 입력해 주세요.';
  if(!valid)return false;
  detailQuantity=value;input.value=String(value);document.querySelector('#detail-total').textContent=money(currentProduct().price*value);
  document.querySelector('[data-detail-quantity="decrease"]').disabled=value===1;document.querySelector('[data-detail-quantity="increase"]').disabled=value===99;
  return true;
}
function addProduct(button) {
  const product=currentProduct();if(!product)return;
  const sizeError=document.querySelector('#size-error');
  if(!detailSize){sizeError.textContent='사이즈를 선택해 주세요.';document.querySelector('[data-size]').focus();return;}
  sizeError.textContent='';
  if(!updateQuantity(Number(document.querySelector('#detail-quantity').value))){document.querySelector('#detail-quantity').focus();return;}
  const existing=cart.find(item=>item.product===product.id&&item.color===detailColor&&item.size===detailSize);
  if((existing?.quantity||0)+detailQuantity>99){document.querySelector('.detail-info .product-message').dataset.state='error';document.querySelector('.detail-info .product-message').textContent='같은 색상과 사이즈는 최대 99개까지 담을 수 있습니다.';return;}
  if(existing)existing.quantity+=detailQuantity;else cart.push({product:product.id,color:detailColor,size:detailSize,quantity:detailQuantity});
  saveCart();renderCart(`${product.name} ${colorInfo[detailColor].label}색 ${detailSize} 사이즈를 담았습니다.`);openDialog(document.querySelector('#cart-dialog'),button);
}

document.addEventListener('click',async event=>{
  const button=event.target.closest('button,a');if(!button||button.disabled)return;
  if(button.matches('a[data-route]')&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(button.href);return;}
  if(button.dataset.save){toggleSaved(button.dataset.save);return;}
  if(button.hasAttribute('data-arrival')){updateArrivals(button.dataset.arrival);return;}
  if(button.dataset.rail){const rail=document.querySelector('#arrival-rail'),amount=rail.clientWidth;rail.scrollBy({left:button.dataset.rail==='next'?amount:-amount,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
  if(button.hasAttribute('data-clear-recent')){recentProducts=[];saveProductIDs('gyak.recent',recentProducts);renderRecent();document.querySelector('.home-brand a')?.focus({preventScroll:true});notifyShop('최근 본 상품 기록을 지웠습니다.');return;}
  if(button.dataset.open==='search-dialog')renderSearchPreview();
  if(button.hasAttribute('data-close'))button.closest('dialog')?.close();
  if(button.dataset.open)openDialog(document.getElementById(button.dataset.open),button);
  if(button.dataset.color)await selectColor(button.dataset.color,true);
  if(button.dataset.detailColor)await selectColor(button.dataset.detailColor,false);
  if(button.classList.contains('product-open')){navigate(productUrl(getProduct('everyday-down'),button.dataset.lookColor||heroColor));return;}
  if(button.dataset.size){detailSize=button.dataset.size;pageView.querySelectorAll('[data-size]').forEach(option=>{const selected=option.dataset.size===detailSize;option.classList.toggle('selected',selected);option.setAttribute('aria-pressed',String(selected));});document.querySelector('#size-error').textContent='';}
  if(button.dataset.detailQuantity){const input=document.querySelector('#detail-quantity');const current=Number(input.value);updateQuantity(Math.max(1,Math.min(99,(Number.isInteger(current)?current:1)+(button.dataset.detailQuantity==='increase'?1:-1))));}
  if(button.classList.contains('add-to-cart'))addProduct(button);
  if(button.hasAttribute('data-zoom')){const product=currentProduct();const img=document.querySelector('#zoom-image');img.src=imageFor(product,detailColor);img.alt=`${colorInfo[detailColor].label}색 ${product.name} 전체 모습`;document.querySelector('#image-title').textContent=product.name;openDialog(document.querySelector('#image-dialog'),button);}
  if(button.dataset.cartAction){
    const key=button.closest('[data-cart-key]').dataset.cartKey,index=cart.findIndex(item=>cartKey(item)===key);if(index<0)return;
    const item=cart[index],action=button.dataset.cartAction;const container=button.closest('dialog')||pageView;
    if(action==='increase')item.quantity=Math.min(99,item.quantity+1);if(action==='decrease')item.quantity=Math.max(1,item.quantity-1);if(action==='remove')cart.splice(index,1);
    saveCart();renderCart(action==='remove'?'상품을 삭제했습니다.':`수량을 ${item.quantity}개로 변경했습니다.`);
    const row=[...container.querySelectorAll('[data-cart-key]')].find(el=>el.dataset.cartKey===key);
    const focus=row?.querySelector(`[data-cart-action="${action}"]:not(:disabled)`)||row?.querySelector('[data-cart-action]:not(:disabled)')||container.querySelector('[data-close],h1,a');
    focus?.focus({preventScroll:true});
  }
});
document.addEventListener('change',event=>{if(event.target.id==='shop-sort'){navigate(shopLink({sort:event.target.value}));return;}if(event.target.id==='detail-quantity')updateQuantity(Number(event.target.value));});
document.addEventListener('input',event=>{if(event.target.id==='global-search')renderSearchPreview();if(event.target.closest('#checkout-form')){event.target.removeAttribute('aria-invalid');const error=document.getElementById(event.target.id+'-error');if(error)error.textContent='';}});
document.addEventListener('submit',event=>{
  if(event.target.id==='global-search-form'||event.target.id==='catalog-search'){event.preventDefault();const query=new FormData(event.target).get('q').trim().slice(0,60);navigate(routeUrl('shop',query?{q:query}:{}));return;}
  if(event.target.id==='shop-filter-form'){event.preventDefault();const values=Object.fromEntries(new FormData(event.target));navigate(shopLink(values));return;}
  if(event.target.id!=='checkout-form')return;event.preventDefault();
  if(!cart.length){clearPersonalFields();navigate(routeUrl('cart'));return;}
  const form=event.target;let firstError=null;
  const checks=[['recipient',v=>v.length>=2&&v.length<=40,'받는 분의 이름을 2자 이상 입력해 주세요.'],['phone',v=>/^0[0-9]{9,10}$/.test(v.replace(/[\s-]/g,'')),'연락처를 숫자 10~11자리로 확인해 주세요.'],['postcode',v=>/^[0-9]{5}$/.test(v),'우편번호 5자리를 입력해 주세요.'],['address',v=>v.length>=5&&v.length<=160,'도로명과 건물 번호를 포함한 주소를 입력해 주세요.']];
  for(const[id,valid,message]of checks){const input=form.querySelector('#'+id),ok=valid(input.value.trim());input.setAttribute('aria-invalid',String(!ok));form.querySelector('#'+id+'-error').textContent=ok?'':message;if(!ok&&!firstError)firstError=input;}
  if(firstError){firstError.focus();return;}
  confirmationItems=cart.map(item=>({...item}));
  // Personal values are never copied into URLs, history, storage, logs or order state.
  clearPersonalFields();cart=[];saveCart();renderCart();navigate(routeUrl('confirmation'));
});

homeAdditions();renderCart();renderPage();
const warmHero=()=>{
  getProduct('everyday-down').colors.forEach(color=>{const picture=new Image();picture.src=imageFor(getProduct('everyday-down'),color);});
  const backdrops=document.querySelector('.hero-backdrops');
  backdrops.querySelectorAll('[data-hero-srcset]').forEach(source=>source.srcset=source.dataset.heroSrcset);
  const landscapes=[...backdrops.querySelectorAll('[data-hero-src]')];
  landscapes.forEach(img=>img.src=img.dataset.heroSrc);
  // Keep the first landscape when later decorative photos fail or are still loading.
  Promise.all(landscapes.map(img=>img.decode())).then(()=>backdrops.classList.add('landscapes-ready')).catch(()=>{}).finally(()=>{
    const color=heroColor;loadHeroPose(color).then(picture=>{if(color===heroColor)applyHeroPose(picture);});
  });
};
const scheduleHero=()=>{if('requestIdleCallback'in window)requestIdleCallback(warmHero,{timeout:1000});else setTimeout(warmHero,0);};
Promise.all([...document.querySelectorAll('#hero-image,.backdrop-city img')].map(img=>img.decode())).then(scheduleHero,scheduleHero);
