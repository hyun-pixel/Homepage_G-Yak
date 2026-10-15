# G-야크 홈페이지

2026년 10월 15일 · 문서1.6 · 화면18. 생활형 아웃도어 가상 브랜드의 24종 컬렉션과 쇼핑 흐름을 구현하고 전체 문구·배치의 PC·모바일 최종 검수를 마쳤다. 사용자 요청에 따라 Vercel의 기존 프로젝트로 공개 배포한다.

## Vercel 배포

[공개 홈페이지](https://homepageg-yak.vercel.app/)

저장소 루트의 vercel.json에서 Framework Preset은 Other(framework: null), Output Directory는 dist로 지정한다. Root Directory는 저장소 루트(빈 값)를 사용한다. 별도 설치·빌드 명령이나 환경변수가 필요 없는 정적 사이트다. main에 변경을 푸시하면 연결된 기존 Vercel 프로젝트가 배포한다.

첫 배포의 404는 Vercel이 저장소 루트를 출력 폴더로 사용해 dist/index.html을 첫 화면으로 제공하지 못했기 때문이다. 출력 폴더를 dist로 지정해 홈페이지와 그 안의 이미지·글꼴·스타일만 제공한다. 기획·검사·원본 자료는 사이트 출력에 포함되지 않는다. [Vercel 공식 설정 문서](https://vercel.com/docs/project-configuration/vercel-json#outputdirectory)를 따른다.

## 저장소 구성

이 저장소에는 실행 가능한 dist 전체와 기획 문서, 이미지 생성·라이선스 기록, 로컬 검사 코드를 포함한다. 검수 캡처·생성된 보고서·전달 ZIP·이미지 원본 PNG는 로컬 보관 자료로 제외한다. 아래 outputs·deliverables·assets/source 링크는 원래 작업 폴더에서 확인할 수 있으며 GitHub에는 포함하지 않는다.

웹사이트를 보려면 저장소를 내려받은 뒤 루트에서 Python 3의 http.server를 실행하고 /dist/로 접속한다. 서버는 기본 포트 8000 대신 아래 로컬 작업 환경의 8725를 사용해도 된다. dist 안의 HTML·CSS·JavaScript·이미지·글꼴이 사이트를 구성하므로 별도 빌드나 환경변수는 필요 없다. 검사 코드는 기존 작업 컴퓨터의 도구와 로컬 검수 자료를 참조하며, 다른 환경에서는 경로·기준 자료를 준비해야 한다.

## 확인하기

- [홈페이지](http://127.0.0.1:8725/dist/?v=18)

- [PC·모바일 비교](http://127.0.0.1:8725/planning/PREVIEW.html?v=18): 페이지를 고르고 PC 또는 모바일을 누른다.

- [통합 기획·디자인](planning/REVIEW.html) · [PRD](planning/PRD.md) · [디자인 명세](planning/DESIGN_SPEC.md) · [결정 기록](planning/DECISIONS.md)

- [와이어프레임](planning/WIREFRAMES.html) · [최종 검수 기록](planning/VERIFICATION.md) · [이미지·라이선스](assets/ASSETS.md)

- [전달 ZIP18](deliverables/G-YAK-homepage-v18.zip) · [사용 안내](deliverables/사용안내.txt)

## 최신 범위

24종·34개 색상 이미지, 아우터7(패딩3 포함)·상의7·팬츠6·용품4. 네 장면 히어로와 마지막 펼침, 사진형 분류 메뉴, 출근·산책·트레킹 코디, 신상품 수동 레일·주말 편집전·노트2편·쇼핑 가이드를 제공한다.

검색·색상/사이즈/가격 필터·정렬·관심상품·최근 본 상품·상품 상세·장바구니·주문 정보 확인을 연결했다. 회원가입·로그인·마이페이지는 누를 수 없다. 관심상품·장바구니·최근 기록은 현재 브라우저에만 보관한다.

실제 결제·주문 접수·배송·회원 DB·외부분석은 없다. 이름·연락처·주소는 입력 화면에서만 다루며 확인/화면 이탈/새로고침 뒤 지워진다. URL·브라우저 저장소·서버로 전송하거나 저장하지 않는다. 상품·가격·치수·사진은 가상 브랜드의 창작 자료다.

## 화면18 변경

문구는 의류·용품을 포괄하는 “상품”, 관심상품 “저장”, 금액 “상품 합계”로 통일했다. 선택 입력 표시, 검색 결과와 빈 상태의 다음 행동, 사이즈 비교 기준을 명확히 했다. 설명 문단의 줄바꿈과 저널 사진 크기 정보를 보완했다.

실제 사이트에서 바뀐 파일은 dist/index.html·app.js·storefront.css 3개다. 승인한 styles.css·motion.css·products.js·히어로 마크업은 바이트가 같다. 새 이미지·외부 서비스·의존성·추가 비용은 없다.

## 검수

- 19개 화면/상태×6너비=114표본: 가로 넘침·보이는 글자 잘림·사진 실패·이름 없는 버튼·실행 오류·요청 실패0.

- 전체 기능9묶음·11너비, 쇼핑 확장7묶음, 모바일320/390px 조작, PC/모바일 움직임·감소 설정 통과.

- 히어로3색60표본의 마지막 위치/크기·문구 동기화, 분류 메뉴6너비·10경로 유지.

- 접근성 표본16개 대비 최저5.43:1, 검색/입력 레이블·오류·키보드·회원 비활성 확인.

- ZIP64파일·7,652,780바이트, CRC·원본 바이트 일치, 푼 복사본 PC/모바일 HTTP 동작 통과.

정적 검사에는 기존 의도적 히어로 경고5개가 남으며 새 경고0이다. 실제 휴대폰·Safari·Firefox·전체 스크린리더·200% 브라우저 확대·새 성능 측정은 미확인이다. 과거 성능 수치를 최신 검수로 주장하지 않는다. 상세 증거와 첫 연결 거절 뒤 단독 재실행 이력은 검수 기록을 따른다.

## 구현과 전달

dist/index.html은 공통 헤더·히어로·생활 사진·메뉴/드로어를 담는다. styles.css는 공통/히어로, pages.css는 상세·장바구니·주문, motion.css는 기존 움직임, storefront.css는 확장 쇼핑/저널/가이드를 담당한다. products.js는 상품 데이터, app.js는 이동·검색·선택·저장·입력 검증이다. assets에 자체 제공 WebP·SUIT·SVG·라이선스가 있다.

전달 대상은 dist 내용뿐이다. ZIP에는 글꼴·아이콘 라이선스를 포함하고 원본PNG·기획·검수·환경 파일을 제외했다. 현재 파일 버전은 styles16·pages13·motion13·products15·storefront18·app18이다. 수정하지 않은 파일의 캐시 주소를 무의미하게 바꾸지 않았다.

원본/생성 기록은 assets, 기획/비교는 planning, 검사는 tests/outputs에 있다. 이전 ZIP과 README는 이력으로 보관한다.

## 로컬 미리보기와 검사

주소는 이 컴퓨터의 서버 실행 중에만 열린다. 별도 계정·환경변수·설정은 필요 없다. 서버가 꺼졌을 때의 실행 명령:

```powershell

& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m http.server 8725 --bind 127.0.0.1 --directory 'C:\Users\User\Documents\ChatGPT\홈페이지\Homepage_GYak'

```

개발 검사는 현재 컴퓨터의 내장 Node/Playwright와 Chrome을 사용한다. 새 패키지는 필요 없다. 전체 기능은 tests/site.check.cjs, 전체 배치는 tests/final-release.check.cjs after, 접근성 표본은 tests/final-accessibility.check.cjs로 실행한다. 각 파일 경로 앞에 위 캐시의 dependencies/node/bin/node.exe를 사용한다. 사이트 자체는 이 검사 도구 없이 동작한다.

## Git·운영 상태

G-야크 폴더를 독립 저장소로 관리하고 지정한 GitHub 저장소의 기본 브랜치 main을 사용한다. 사용자 요청에 따라 최종 화면18을 커밋·푸시했고, 기존 Vercel 프로젝트의 출력 폴더를 바로잡아 공개 재배포한다. PR·병합·실제 결제·주문 접수·개인정보 저장 연결은 이번 작업 범위에 포함하지 않는다. 기존 요금제를 유지하며 새 유료 기능이나 외부 서비스를 추가하지 않는다.
