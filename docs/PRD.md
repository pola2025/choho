# 초호펜션 웹사이트 리뉴얼 PRD (Product Requirements Document)

**문서 버전**: 1.0
**작성일**: 2025-12-03
**프로젝트명**: 초호펜션 웹사이트 리뉴얼

---

## 1. 프로젝트 개요

### 1.1 목적

현재 아임웹(imweb.me) 기반으로 운영 중인 초호펜션 웹사이트를 Next.js 기반 독립 웹사이트로 리뉴얼하여 성능, 유지보수성, 확장성을 개선합니다.

### 1.2 현재 사이트 분석

- **플랫폼**: imweb.me (노코드 웹빌더)
- **도메인**: choho.imweb.me
- **주요 기능**: 펜션 소개, 객실 안내, 카페 메뉴, 역사 소개, 공지사항, 위치 안내
- **예약 시스템**: 네이버 예약 (booking.naver.com) 외부 연동

### 1.3 리뉴얼 목표

1. 페이지 로딩 속도 개선 (Core Web Vitals 최적화)
2. SEO 최적화로 검색 노출 향상
3. 모바일 사용자 경험 개선
4. 관리자의 콘텐츠 관리 용이성 확보
5. 향후 기능 확장 가능한 구조 구축

---

## 2. 기술 스택

### 2.1 코어 스택

| 구분 | 기술 | 버전 | 선택 이유 |
|------|------|------|-----------|
| **Framework** | Next.js | 15.x | App Router, RSC, 이미지 최적화 |
| **Language** | TypeScript | 5.x | 타입 안정성, 개발 생산성 |
| **Styling** | Tailwind CSS | 3.x | 빠른 개발, 일관된 디자인 시스템 |
| **UI Components** | shadcn/ui | latest | 커스터마이징 용이, 접근성 |

### 2.2 인프라 스택

| 구분 | 기술 | 용도 |
|------|------|------|
| **Hosting** | Vercel | Next.js 최적화 호스팅, 자동 배포 |
| **CDN** | Cloudflare | 이미지/정적 자산 캐싱, DDoS 방어 |
| **Repository** | GitHub | 소스 코드 관리, CI/CD 연동 |
| **Domain** | Cloudflare DNS | DNS 관리, SSL 인증서 |

### 2.3 추가 필요 스택

| 구분 | 기술 | 용도 | 필수 여부 |
|------|------|------|-----------|
| **CMS** | Sanity.io 또는 Notion API | 공지사항/콘텐츠 관리 | 권장 |
| **Image Storage** | Cloudflare R2 | 이미지 저장소 | 필수 |
| **Analytics** | Google Analytics 4 | 방문자 분석 | 권장 |

### 2.4 개발 도구

| 구분 | 기술 |
|------|------|
| **Linting** | ESLint + Prettier |
| **Testing** | Vitest + Playwright |
| **Package Manager** | pnpm |

---

## 3. 페이지 구조 및 기능 요구사항

### 3.1 사이트맵

```
/                           # 홈페이지 (메인)
├── /rooms                  # 객실 목록
│   ├── /rooms/lakeview     # 호수뷰 객실 상세
│   ├── /rooms/forest       # Forest 객실 상세
│   └── /rooms/forest-mini  # Forest Mini 객실 상세
├── /cafe                   # 초리골164 카페
├── /about                  # 초호 역사/소개
│   └── /about/journal      # 초호 저널 목록
│       └── /about/journal/[id]  # 저널 상세
├── /location               # 찾아오시는 길
└── /auth                   # 인증 (선택)
    ├── /auth/login
    └── /auth/register
```

### 3.2 페이지별 기능 요구사항

#### 3.2.1 홈페이지 (/)

**현재 기능 분석:**

- 알림 배너 (이벤트 공지)
- Welcome 인트로 섹션
- 객실 카드 목록 (필터: 인원/타입)
- 체크인 안내 (4단계 프로세스)
- 단체 조식 서비스 안내
- 바베큐 장소 안내 (이미지 슬라이더)
- 공지사항 목록
- 시설 갤러리

**구현 요구사항:**

- [ ] 반응형 히어로 섹션 (CTA: "실시간 예약 현황 확인")
- [ ] 객실 필터링 (인원수, 객실타입)
- [ ] 이미지 최적화 (next/image)
- [ ] 스켈레톤 로딩 UI
- [ ] 초호 저널/가이드 동적 로딩 (최신 12개)

#### 3.2.2 객실 페이지 (/rooms)

**현재 기능 분석:**

- 객실 타입별 하위 페이지 (호수뷰, Forest, Forest Mini)
- 각 객실별 이미지 갤러리 (18~64장)
- 객실 정보 카드 (인원, 면적, 타입)
- 예약 버튼 (네이버 예약 연동)
- 이용 안내 (체크인/아웃, 추가인원, 집기 목록)
- 동절기 바베큐 안내
- 환불 규정
- 유의사항

**구현 요구사항:**

- [ ] 객실 상세 페이지 템플릿 (포토 스토리 형식)
- [ ] 라이트박스 이미지 갤러리 (캡션 포함)
- [ ] 네이버 예약 연동 (플로팅 바: "실시간 예약 확인")
- [ ] 상세 비품 체크리스트 (제공/미제공 구분)
- [ ] TMI 섹션 (주차 거리, 편의점 등)
- [ ] 아코디언 UI (이용안내, 환불규정 등)
- [ ] 객실별 동적 라우팅

#### 3.2.3 카페 페이지 (/cafe)

**현재 기능 분석:**

- 히어로 이미지
- 메뉴판 (COFFEE, LATTE, TEA, ADE, OTHERS)
- 이미지 갤러리 (4x4 그리드 + 더보기)

**구현 요구사항:**

- [ ] 메뉴 테이블 컴포넌트
- [ ] 마스너리 이미지 갤러리
- [ ] 무한스크롤 또는 페이지네이션

#### 3.2.4 소개 페이지 (/about)

**현재 기능 분석:**

- 초호펜션 역사 타임라인 (1947~2025)
- 스토리텔링 섹션
- 공지사항 게시판 (110개 게시글, 페이지네이션)
- 검색 기능

**구현 요구사항:**

- [ ] 수직 타임라인 컴포넌트
- [ ] 초호 저널(구 공지사항) CRUD (CMS 연동)
- [ ] 검색/페이지네이션
- [ ] 조회수 기능
- [ ] 추천 콘텐츠(맛집, 즐기는 법) 섹션

#### 3.2.5 위치 페이지 (/location)

**현재 기능 분석:**

- 주소 정보 (도로명/지번)
- 전화번호
- 차량 이용 안내
- 네이버 지도 이미지 + 링크

**구현 요구사항:**

- [ ] 지도 이미지 표시 (정적 캡처 이미지)
- [ ] 네이버 지도 링크 버튼
- [ ] 복사 기능 (주소, 전화번호)

---

## 4. 비기능 요구사항

### 4.1 성능

- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **이미지 최적화**: WebP/AVIF 포맷, lazy loading

### 4.2 접근성 (WCAG 2.1 AA)

- 키보드 네비게이션 지원
- 스크린 리더 호환
- 색상 대비 4.5:1 이상
- 폼 레이블 연결

### 4.3 SEO

- 메타 태그 최적화
- 구조화된 데이터 (JSON-LD)
- sitemap.xml / robots.txt
- Open Graph / Twitter Card

### 4.4 보안

- HTTPS 강제
- CSP (Content Security Policy)
- XSS/CSRF 방어

---

## 5. 디자인 요구사항

### 5.1 브랜드 컬러

```css
--primary: #4CAF50;        /* 초록색 (메인 컬러) */
--primary-dark: #388E3C;   /* 진한 초록 */
--secondary: #8B4513;      /* 갈색 (우드톤) */
--accent: #FFD700;         /* 골드 (포인트) */
--neutral-dark: #333333;   /* 텍스트 */
--neutral-light: #F5F5F5;  /* 배경 */
```

### 5.2 타이포그래피

- **한글 폰트**: Pretendard
- **영문 폰트**: Inter
- **특수 폰트**: 로고용 (초호 한자체)

### 5.3 반응형 브레이크포인트

- Mobile: 320px ~ 767px
- Tablet: 768px ~ 1023px
- Desktop: 1024px ~ 1439px
- Wide: 1440px+

---

## 6. 데이터 구조

### 6.1 객실 (Room)

```typescript
interface Room {
  id: string;
  name: string;              // "Forest", "Forest Mini", "호수뷰 객실"
  slug: string;              // URL용 슬러그
  type: 'bed' | 'ondol';     // 침대/온돌
  capacity: {
    standard: number;        // 기준 인원
    maximum: number;         // 최대 인원
  };
  area: number;              // 면적 (평)
  description: string;
  images: Image[];           // 캡션 포함
  amenities: {
    provided: string[];      // 제공되는 물품
    notProvided: string[];   // 가져와야 할 물품 (칫솔, 조미료 등)
  };
  tmi: {                     // TMI 정보
    parkingDistance: string; // 주차장 거리
    stairs: boolean;         // 계단 유무
    nearbyStore: string;     // 편의점 거리
  };
  naverBookingUrl: string;   // 네이버 예약 링크
  policies: {
    checkIn: string;         // "15:00 - 22:00"
    checkOut: string;        // "11:00"
    refund: RefundPolicy[];
    notices: string[];
  };
}
```

### 6.2 초호 저널 (Journal/Guide)

```typescript
interface Journal {
  id: string;
  category: 'notice' | 'guide' | 'event'; // 공지, 가이드, 이벤트
  title: string;
  content: string;           // 마크다운 또는 HTML
  excerpt: string;           // 요약
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  thumbnail?: Image;
  tags?: string[];           // #맛집 #힐링 #바베큐
}
```

### 6.3 메뉴 (CafeMenu)

```typescript
interface MenuItem {
  id: string;
  category: 'coffee' | 'latte' | 'tea' | 'ade' | 'others';
  name: string;
  priceHot?: number;
  priceIced?: number;
  isNew?: boolean;
}
```

---

## 7. 외부 연동

### 7.1 네이버 예약

- 기존 네이버 예약 시스템 유지
- 객실별 예약 URL 외부 링크 처리
- 예약 현황 API 연동 (선택사항)

### 7.2 위치 안내

- 네이버 지도 캡처 이미지 사용 (API 연동 없음)
- 네이버 지도 외부 링크 버튼

### 7.3 CMS (선택)

- **Sanity.io**: 공지사항, 이벤트 배너 관리
- **Notion API**: 대안 옵션 (간단한 경우)

---

## 8. 마일스톤

### Phase 1: 프로젝트 설정 (Day 1-2)

- [x] Next.js 15 프로젝트 생성
- [x] TypeScript, Tailwind CSS 설정
- [ ] shadcn/ui 설치
- [ ] ESLint, Prettier 설정
- [ ] GitHub 저장소 연결
- [ ] Vercel 배포 설정

### Phase 2: 레이아웃 및 공통 컴포넌트 (Day 3-5)

- [ ] Header 컴포넌트
- [ ] Footer 컴포넌트
- [ ] 모바일 메뉴
- [ ] 기본 UI 컴포넌트 (Button, Card, etc.)

### Phase 3: 메인 페이지 (Day 6-10)

- [ ] 히어로 섹션
- [ ] 객실 목록 + 필터
- [ ] 체크인 안내
- [ ] 부대시설 안내
- [ ] 초호 저널 미리보기
- [ ] 갤러리

### Phase 4: 객실 페이지 (Day 11-15)

- [ ] 객실 목록 페이지
- [ ] 객실 상세 페이지 템플릿
- [ ] 이미지 갤러리
- [ ] 이용안내 아코디언

### Phase 5: 서브 페이지 (Day 16-20)

- [ ] 카페 페이지
- [ ] 소개 페이지 (타임라인)
- [ ] 초호 저널 게시판
- [ ] 위치 페이지

### Phase 6: CMS 연동 (Day 21-25)

- [ ] Sanity.io 설정
- [ ] 초호 저널 CRUD
- [ ] 이미지 마이그레이션

### Phase 7: 최적화 및 테스트 (Day 26-30)

- [ ] SEO 최적화
- [ ] 성능 테스트
- [ ] 접근성 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 프로덕션 배포

---

## 9. 리스크 및 대응방안

| 리스크 | 영향도 | 대응방안 |
|--------|--------|----------|
| 이미지 마이그레이션 | 높음 | Cloudflare R2로 일괄 업로드 스크립트 작성 |
| 네이버 예약 연동 | 중간 | 기존 외부 링크 방식 유지 |
| 초호 저널 데이터 이전 | 중간 | 크롤링 스크립트로 JSON 추출 후 CMS 업로드 |
| SEO 순위 하락 | 중간 | 301 리다이렉트, 기존 URL 구조 유지 |

---

## 10. 참고 자료

### 10.1 현재 사이트 스크린샷

- `/.playwright-mcp/choho-fullpage.png` - 홈페이지
- `/.playwright-mcp/choho-rooms-lakeview.png` - 객실(호수뷰)
- `/.playwright-mcp/choho-cafe.png` - 카페
- `/.playwright-mcp/choho-about.png` - 소개/역사
- `/.playwright-mcp/choho-location.png` - 위치

### 10.2 외부 링크

- 현재 사이트: <https://choho.imweb.me>
- 새 도메인: <https://www.chorigol.co.kr>
- 네이버 예약: <https://booking.naver.com/booking/3/bizes/608360>
- 네이버 지도: <https://map.naver.com/p/entry/place/1149332657>

---

**문서 끝**
