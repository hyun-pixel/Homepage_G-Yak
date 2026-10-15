# G-야크 이미지·글꼴·아이콘 기록

작성일: 2026년 10월 13일

## AI 이미지

6개 이미지는 이 프로젝트를 위해 기본 이미지 생성 도구로 만들었다. 실재 고객·상품·촬영 사실을 나타내지 않는다. 가상 브랜드의 구성 자료다. 원본 PNG를 보관하고 웹용 WebP는 크기 조정과 인코딩만 했다. 제품 컷의 알파 투명도를 유지했으며 창작적 재편집은 하지 않았다. 글자를 그림 안에 넣지 않아 본문은 HTML로 읽을 수 있다.

| 이름 | 보관 원본 | 웹용 파일 |
|---|---|---|
| puffer-olive | `assets/source/puffer-olive.png` | `dist/assets/puffer-olive.webp` |
| puffer-stone | `assets/source/puffer-stone.png` | `dist/assets/puffer-stone.webp` |
| puffer-charcoal | `assets/source/puffer-charcoal.png` | `dist/assets/puffer-charcoal.webp` |
| commute | `assets/source/commute.png` | `dist/assets/commute.webp` |
| walk | `assets/source/walk.png` | `dist/assets/walk.webp` |
| weekend | `assets/source/weekend.png` | `dist/assets/weekend.webp` |

상품 컷은 올리브·스톤·차콜의 같은 후드·지퍼·퀼팅 형태를 유지하도록 생성했다. 착용 사진은 출근·공원 산책·주말 호숫가 장면이다. 실제 상품 제작을 하게 되면 실물 사진과 사양을 다시 검증해야 한다.

### 생성 요청 기록

#### puffer-olive

기본 도구의 원본 저장 경로: `C:/Users/User/.codex/generated_images/01a12eea-8785-7393-956d-47289e3c5880/exec-5c4d53b0-818c-4b66-9a07-16ebdb48255f.png`

```text
Use case: product-mockup. Asset type: transparent product photography for the fictional Korean outdoor brand G-YAK. Create one photorealistic lightweight hooded puffer jacket, full front view, invisible mannequin, floating upright. Muted dusty olive green (soft natural olive, not military camouflage). Contemporary unisex urban outdoor clothing, relaxed hip-length silhouette, generous sculptural hood with slightly darker interior, clean central zipper, broad horizontal quilted baffles, subtle diagonal shoulder seams, zipped side pockets, understated matte nylon with realistic fabric folds and softly rounded down volume. Both sleeves naturally angled downward, entire garment fully visible with generous transparent margins, consistent symmetrical frontal view and studio lighting, refined e-commerce photography, 85mm lens, no hanger, no person, no text, no visible logo, no watermark. Keep background genuinely transparent with alpha; no floor, no opaque backdrop, no checkerboard painted into the image. The garment should occupy about 80 percent of image height. This is a new original product concept, not a copy of another brand's jacket.
```

#### puffer-stone

기본 도구의 원본 저장 경로: `C:/Users/User/.codex/generated_images/01a12eea-8785-7393-956d-47289e3c5880/exec-4048f3df-6977-45d4-8de4-00ec491682ed.png`

```text
Use case: precise-object-edit. Edit target: the supplied original olive puffer jacket. Change ONLY the fabric color to warm light stone gray, softly neutral off-white with a slight warm gray undertone (not yellow, not pure white). Keep every other detail identical: silhouette, hood, exact baffle arrangement, pockets, central zipper, sleeves, folds, camera angle, scale, positioning, natural studio lighting and transparent alpha background. Same full frontal product, no person or hanger, no text/logo/watermark, entire garment visible. Preserve transparency.
```

#### puffer-charcoal

기본 도구의 원본 저장 경로: `C:/Users/User/.codex/generated_images/01a12eea-8785-7393-956d-47289e3c5880/exec-b82bd83b-1c53-4381-89ab-4e158c57b87a.png`

```text
Use case: precise-object-edit. Edit target: the supplied original olive puffer jacket. Change ONLY the fabric color to a refined dark neutral charcoal gray, clearly gray rather than pure black. Keep every other detail identical: silhouette, hood, exact baffle arrangement, pockets, central zipper, sleeves, folds, camera angle, scale, positioning, studio lighting and transparent alpha background. Keep texture visible in the darker fabric. Same full frontal product, no person or hanger, no text/logo/watermark, entire garment visible. Preserve transparency.
```

#### commute

기본 도구의 원본 저장 경로: `C:/Users/User/.codex/generated_images/01a12eea-8785-7393-956d-47289e3c5880/exec-2c3bc83f-b353-438b-82b5-d3504e70a0bf.png`

```text
Use case: photorealistic-natural. Reference image: supplied fictional G-YAK jacket, use its exact hood shape, horizontal baffles, zipper, relaxed silhouette and muted olive fabric for the clothing design. Generate an original wide horizontal 3:2 editorial lifestyle photograph for a Korean everyday outdoor clothing brand. Two fictional Korean adult models, a woman around 30 and a man around 32, walk naturally along a quiet contemporary neighborhood street near a pale stone building and soft green trees. The man wears this exact olive hooded puffer and relaxed charcoal trousers; the woman wears the same jacket design in light stone gray with dark straight-leg trousers. Understated everyday outfits, no hiking packs or technical climbing gear. They are full-body, positioned in the middle-left part of the frame with generous environment and calm space on the right, candid walking and conversation, natural relaxed expressions, believable adult anatomy. Soft overcast morning light, restrained olive/stone/gray palette, realistic skin and textile texture, premium but approachable magazine photography. No text overlays, no logo, no watermark, no identifiable landmark or shop sign. Not an ad layout, just the photograph.
```

#### walk

기본 도구의 원본 저장 경로: `C:/Users/User/.codex/generated_images/01a12eea-8785-7393-956d-47289e3c5880/exec-66b0d8c8-2979-4170-b9ad-bd46c557ace9.png`

```text
Use case: photorealistic-natural. Reference image 1 is the fictional G-YAK stone jacket design; reference image 2 supplies the fictional adult woman's appearance and the campaign's photography. Make a new original portrait 4:5 editorial fashion photograph of the same fictional adult Korean woman taking a relaxed walk along a tree-lined neighborhood park path. She wears exactly the stone gray puffer jacket from reference 1 with the same horizontal quilted baffles, hood shape and central zipper, simple charcoal knit underneath, relaxed dark trousers and neutral sneakers. Natural candid movement, head and entire outfit clearly visible, pleasant quiet expression, soft overcast daylight, muted olive foliage and pale gravel path, tactile realistic textiles, natural skin, premium approachable outdoor lifestyle photography. Keep her roughly central so face and jacket survive a mobile crop. No text, no logo/watermark, no climbing gear or promotional layout.
```

#### weekend

기본 도구의 원본 저장 경로: `C:/Users/User/.codex/generated_images/01a12eea-8785-7393-956d-47289e3c5880/exec-b5b88787-5232-4b31-be6f-609697a6a5b8.png`

```text
Use case: photorealistic-natural. Reference image 1 is the fictional G-YAK charcoal puffer design; reference image 2 supplies the fictional adult models and the campaign photography. Create a new original horizontal 4:3 editorial lifestyle photograph of the same fictional Korean adult man from reference 2 on a casual weekend walk along a calm wooded lakeside gravel path. He wears exactly the charcoal gray hooded puffer from reference 1, with the same horizontal baffles, hood and zipper, relaxed olive trousers and neutral everyday sneakers. A modest canvas tote in one hand is appropriate. Show the entire outfit and quiet natural surroundings, not a mountain expedition. Subject near middle-right, full body, soft cloudy daylight, restrained olive/stone/charcoal palette, realistic face, hands and textile texture, comfortable approachable mood. No text, brand logo, watermark, obvious landmark, tents or climbing gear.
```

## 글꼴·아이콘·로고

- SUIT Variable: [제작자 저장소](https://github.com/sun-typeface/SUIT), OFL 라이선스. `dist/assets/fonts/SUIT-Variable.woff2`, `dist/assets/licenses/SUIT.txt`에 자체 호스팅 원본과 사용 조건을 보관했다.
- Phosphor Regular: [공식 저장소](https://github.com/phosphor-icons/core), MIT 라이선스. 필요한 메뉴·가방·화살표·닫기·더하기·빼기 6개만 `dist/assets/icons.svg`에 모았다. 조건은 `dist/assets/licenses/Phosphor.txt`에 보관했다.
- G-YAK 워드마크는 SUIT의 굵은 글자로 구성했다. 작은 G 아이콘은 코드로 만든 SVG이며 다른 아웃도어 브랜드의 표장을 복제하지 않았다. 상표 등록 가능성을 조사한 것은 아니다.
- 글꼴·아이콘은 무료 원본이며 유료 서비스 구매나 계정 개설을 하지 않았다. 사이트를 읽을 때 외부 이미지·폰트 서버에 접속하지 않는다.


## 전체 컬렉션 추가 자료 (버전 0.3)

대표 패딩 3색에 8종·각 2색의 16개 상품 컷을 추가했다. 기본 이미지 생성 도구로 첫 색상을 만들고, 같은 형태·퀼팅·후드·포켓·구도를 유지하는 색상 편집으로 두 번째 색상을 만들었다. 새 유료 서비스나 CLI/API 키를 사용하지 않았다.

모든 원본은 `assets/source/이름.png`, 웹용은 `dist/assets/이름.webp`에 보관한다. 투명 알파를 유지한 리사이즈·WebP 인코딩만 수행했다. 창작적 배경 변경이나 색 수정은 이미지 도구에서 수행했다.

| 이미지 이름 | 웹용 경로 |
|---|---|
| quilt-olive | `dist/assets/quilt-olive.webp` |
| vest-stone | `dist/assets/vest-stone.webp` |
| hoodie-stone | `dist/assets/hoodie-stone.webp` |
| sweat-stone | `dist/assets/sweat-stone.webp` |
| long-stone | `dist/assets/long-stone.webp` |
| trail-olive | `dist/assets/trail-olive.webp` |
| cargo-stone | `dist/assets/cargo-stone.webp` |
| jogger-charcoal | `dist/assets/jogger-charcoal.webp` |
| quilt-charcoal | `dist/assets/quilt-charcoal.webp` |
| vest-charcoal | `dist/assets/vest-charcoal.webp` |
| hoodie-olive | `dist/assets/hoodie-olive.webp` |
| sweat-charcoal | `dist/assets/sweat-charcoal.webp` |
| long-charcoal | `dist/assets/long-charcoal.webp` |
| trail-charcoal | `dist/assets/trail-charcoal.webp` |
| cargo-olive | `dist/assets/cargo-olive.webp` |
| jogger-stone | `dist/assets/jogger-stone.webp` |

정확한 최종 요청 문구와 원본 저장 경로는 [생성 요청 기록](catalog-generation.json), 알파·크기·용량은 [이미지 정보](catalog-images.json)에 기록했다. 이 16개와 기존 대표 상품 3색을 합쳐 19개 제품 이미지다. 모델·상품은 창작이며 실물 촬영이나 측정 사실을 나타내지 않는다.

## 2026-10-14 히어로 풍경 3장

사용자의 도심→설산→일반 트레킹 제안에 맞춰 기본 내장 `image_gen` 도구로 새 풍경을 생성했다. 기존 제품 컷과 생활 착용 이미지는 교체하지 않았다. 사진에는 사람·옷·글자·로고를 넣지 않아 제품과 카피를 독립적으로 배치한다. [정확한 최종 요청 3개와 경로·크기·용량](hero-landscapes.json)을 보관했다. CLI/API 키나 외부 유료 구매를 사용하지 않았다.

| 풍경 | 보관한 원본 | PC용 | 모바일용 |
|---|---|---|---|
| 도심 | `assets/source/hero-city.png` | `dist/assets/hero-city.webp` | `dist/assets/hero-city-mobile.webp` |
| 설산 | `assets/source/hero-snow.png` | `dist/assets/hero-snow.webp` | `dist/assets/hero-snow-mobile.webp` |
| 트레킹 | `assets/source/hero-trek.png` | `dist/assets/hero-trek.webp` | `dist/assets/hero-trek-mobile.webp` |

PC 1600×900 세 장 합계 388,588바이트, 모바일 768×432 합계 113,186바이트. 선택한 생성 원본은 그대로 복사해 보관하고, Sharp로 크기 조정·WebP 압축만 수행했다. 실제 장소 촬영·제품 성능 시험·현장 활동의 기록이 아닌 창작 배경이다.

## 2026-10-14 패딩 열린 모습 3컷

기존 올리브 컷을 편집 참조로 앞 지퍼가 열리고 전면이 살짝 벌어진 모습을 내장 `image_gen`으로 제작했다. 이 열린 모습을 편집 대상으로, 기존 스톤·차콜 컷을 색·재질 참조로 나머지 2색을 제작했다. 기존 닫힌 컷과 실제 상품 목록은 교체하지 않았다. 실제 옷의 작동이나 실물 구조를 증명하는 촬영 자료가 아니다.

| 색상 | 보관한 원본 | 웹용 투명 WebP | 용량 |
|---|---|---|---:|
| 올리브 | `assets/source/puffer-olive-open.png` | `dist/assets/puffer-olive-open.webp` | 118,176바이트 |
| 스톤 | `assets/source/puffer-stone-open.png` | `dist/assets/puffer-stone-open.webp` | 124,996바이트 |
| 차콜 | `assets/source/puffer-charcoal-open.png` | `dist/assets/puffer-charcoal-open.webp` | 107,200바이트 |

모두 1000×1200·알파 채널 유지, 합계 350,372바이트. 원본을 보관하고 Sharp로 규격·WebP 압축만 수행했다. [정확한 최종 요청 3개·참조 역할·저장 경로](hero-poses.json)를 기록했다. CLI/API 키나 새 외부 유료 구매를 사용하지 않았다.

## 2026-10-14 마지막 장면용 넓은 펼침 3컷 · 버전 8

사용자 수정에 맞춰 전면을 넓게 벌리고 소매가 바깥으로 향한 포즈를 내장 `image_gen`으로 제작했다. 올리브를 먼저 만들고, 가장자리에 여유를 확보하는 편집을 거친 후 같은 포즈로 스톤·차콜을 생성했다. 좁게 열린 기존 자료는 이력으로 유지한다.

| 색상 | 보관한 원본 | 웹용 투명 WebP | 용량 |
|---|---|---|---:|
| 올리브 | `assets/source/puffer-olive-open-wide.png` | `dist/assets/puffer-olive-open-wide.webp` | 103,578바이트 |
| 스톤 | `assets/source/puffer-stone-open-wide.png` | `dist/assets/puffer-stone-open-wide.webp` | 105,880바이트 |
| 차콜 | `assets/source/puffer-charcoal-open-wide.png` | `dist/assets/puffer-charcoal-open-wide.webp` | 93,304바이트 |

모두 1000×1200·알파 유지, 합계 302,762바이트. Sharp로 웹용 규격·WebP 압축만 수행했다. [최종 요청·올리브 여유 편집 요청·참조 역할·저장 경로](hero-wide-poses.json)를 기록했다. 실제 옷의 구조·성능 측정이 아닌 창작 자료이며, 새 유료 구매·CLI/API 키는 사용하지 않았다.

## 화면 14: 추가 상품 15종 · 2026년 10월 15일

기본 이미지 생성 도구를 각 상품에 독립 호출해 아우터4·상의4·팬츠3·용품4를 만들었다. 원본은 1024×1536 RGBA PNG, 웹용은 알파를 유지한 WebP 15개·합계2,105,002바이트다. [상품별 원본·요청·웹 경로](catalog-v14-generation.json)에 보관한다. 실제 판매·실측·촬영 사실이 아닌 가상 브랜드 창작 자료이며 타사 사진·로고·상품 텍스트를 복제하지 않았다. 기존 19색 컷과 생활 사진은 유지한다.

추가 아이콘은 기존 선 아이콘의 굵기·크기에 맞춰 직접 작성한 검색·하트·좌우 화살표·필터 SVG다. 기존 Phosphor 아이콘과 SUIT 라이선스 파일은 그대로 보관하며 배포 ZIP에 포함한다. 새 소재 구매·외부 서비스 계약은 없다.

## 화면 15: 상황별 착용 사진 3장

기본 imagegen으로 기존 상품 원본을 참조해 새 가상 성인 모델의 출근·산책·가벼운 트레킹 장면을 생성했다. 사진의 색상·옷 구조와 연결 상품을 맞췄고 기존 패딩 사진은 원래 경로에 보존했다. [전체 요청·참조·원본·웹 파일](lifestyle-v15-generation.json). 원본1536×1024·1122×1402·1448×1086, WebP 품질84·합계689,250바이트. 실제 고객·촬영·판매·성능을 증명하지 않는다. 새 소재 구매 없음.
