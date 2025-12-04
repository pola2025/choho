# 초호펜션 UI/UX 리디자인 PRD

**문서 버전**: 1.0
**작성일**: 2025-12-04
**프로젝트**: 초호펜션 웹사이트 디자인 개선

---

## 1. 개요

### 1.1 배경
현재 초호펜션 웹사이트는 기능적으로 완성되어 있으나, 시각적 디자인이 단조롭고 2025년 숙박업 웹사이트 트렌드에 부합하지 않음. 특히 헤더 가시성 문제, 녹색 포인트 컬러 미활용, 인터랙션 부재 등의 개선이 필요함.

### 1.2 목표
- 2025년 럭셔리 숙박업 웹사이트 트렌드 반영
- 자연 친화적 녹색 컬러 팔레트 적용
- 몰입감 있는 시각적 경험 제공
- 예약 전환율 향상

### 1.3 참고 자료
- [Luxury Hotel Website Design - 52 Inspiring Examples](https://mediaboom.com/news/luxury-hotel-website-design/)
- [Hotel Website Design 2025: What Works](https://zorka-solutions.com/blog/hotel-website-design-2025-what-works-and-what-doesnt-work/)
- [Hospitality Color Insights 2025](https://www.shawcontract.com/en-us/details/blog/commercial-interior-design-color-trends-2025-hospitality)
- [Luxury Color Palettes 2025](https://designworklife.com/luxury-color-palettes/)

---

## 2. 현재 상태 분석

### 2.1 문제점

| 영역 | 현재 상태 | 문제 |
|------|----------|------|
| 헤더 | 투명 배경 + 흰색 글자 | 흰색 배경에서 글자 안 보임 |
| 색상 | 단조로운 회색 톤 | 녹색 포인트 컬러 미활용 |
| 카드 | 밋밋한 박스 디자인 | 호버 효과 없음, 시각적 깊이 부족 |
| 애니메이션 | 거의 없음 | 정적이고 단조로운 경험 |
| 타이포그래피 | 기본적인 폰트 사용 | 계층 구조 불명확 |
| 갤러리 | 기본 그리드 | 인터랙션 부족 |

### 2.2 잘 된 점
- 반응형 레이아웃 구현
- 명확한 정보 구조
- 예약 버튼 접근성

---

## 3. 2025 숙박업 디자인 트렌드

### 3.1 핵심 트렌드

#### 1) 몰입형 비주얼 & 스토리텔링
- 풀스크린 비디오/이미지
- 시네마틱 이미지
- 인터랙티브 갤러리
- 감정을 자극하는 시각적 경험

#### 2) 자연 영감 디자인 (Biophilic Design)
- 자연 텍스처 (나무, 돌, 모래)
- 자연 색상 (녹색, 파랑, 모래색, 갈색)
- 자연 사진으로 감성적 깊이 추가

#### 3) 네오-브루탈리즘 요소
- 대비되는 색상
- 기하학적 형태
- 대담한 타이포그래피

#### 4) 미니멀리즘 + 여백
- 심플하고 직관적인 디자인
- 핵심 요소 강조를 위한 여백 활용
- 2-3 클릭 내 정보 접근

#### 5) 마이크로 인터랙션
- 섬세한 애니메이션
- 패럴랙스 스크롤링
- 호버 효과

### 3.2 컬러 트렌드

| 유형 | 색상 | 용도 |
|------|------|------|
| Primary | Deep Emerald, Forest Green | 브랜드 아이덴티티 |
| Secondary | Sage, Olive | 보조 요소 |
| Neutral | Cream, Oatmeal, Soft Beige | 배경 |
| Accent | Gold, Bronze | 고급스러운 포인트 |
| Supporting | Terracotta, Deep Moss | 깊이감 |

---

## 4. 디자인 시스템

### 4.1 컬러 팔레트

```css
:root {
  /* Primary - Forest/Emerald Green */
  --primary-50: #f0fdf4;
  --primary-100: #dcfce7;
  --primary-200: #bbf7d0;
  --primary-300: #86efac;
  --primary-400: #4ade80;
  --primary-500: #22c55e;
  --primary-600: #16a34a;
  --primary-700: #15803d;
  --primary-800: #166534;
  --primary-900: #14532d;
  --primary-950: #052e16;

  /* Secondary - Sage/Olive */
  --sage-50: #f6f7f4;
  --sage-100: #e3e7dd;
  --sage-200: #c8d1bb;
  --sage-300: #a7b592;
  --sage-400: #8a9c72;
  --sage-500: #6d8156;
  --sage-600: #566744;
  --sage-700: #445138;
  --sage-800: #394330;
  --sage-900: #31392a;

  /* Neutral - Warm Cream */
  --cream-50: #fdfcfa;
  --cream-100: #f9f6f0;
  --cream-200: #f3ede3;
  --cream-300: #e8dece;
  --cream-400: #d4c4a8;
  --cream-500: #c2aa87;
  --cream-600: #b0936d;
  --cream-700: #937859;
  --cream-800: #79634c;
  --cream-900: #645240;

  /* Accent - Gold/Bronze */
  --gold-400: #d4a574;
  --gold-500: #c9956a;
  --gold-600: #b8835a;
  --bronze-500: #a67c52;
  --bronze-600: #8b6544;

  /* Dark - For Text */
  --dark-800: #1f2421;
  --dark-700: #2d3830;
  --dark-600: #3d4a40;
}
```

### 4.2 타이포그래피

```css
/* 제목 - 세리프 폰트로 고급스러움 */
--font-display: 'Noto Serif KR', serif;

/* 본문 - 가독성 좋은 산세리프 */
--font-body: 'Pretendard', -apple-system, sans-serif;

/* 크기 스케일 */
--text-hero: clamp(3rem, 8vw, 6rem);
--text-h1: clamp(2.5rem, 5vw, 4rem);
--text-h2: clamp(2rem, 4vw, 3rem);
--text-h3: clamp(1.5rem, 3vw, 2rem);
--text-body-lg: 1.125rem;
--text-body: 1rem;
--text-sm: 0.875rem;
```

### 4.3 그림자 & 깊이

```css
/* Elevation System */
--shadow-sm: 0 1px 2px rgba(20, 83, 45, 0.05);
--shadow-md: 0 4px 6px -1px rgba(20, 83, 45, 0.08),
             0 2px 4px -2px rgba(20, 83, 45, 0.05);
--shadow-lg: 0 10px 15px -3px rgba(20, 83, 45, 0.1),
             0 4px 6px -4px rgba(20, 83, 45, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(20, 83, 45, 0.1),
             0 8px 10px -6px rgba(20, 83, 45, 0.05);

/* Glass Effect */
--glass-bg: rgba(255, 255, 255, 0.8);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: blur(10px);
```

### 4.4 애니메이션

```css
/* Timing Functions */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);

/* Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Scroll Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 5. 컴포넌트 개선 명세

### 5.1 Header (헤더)

**현재 문제**: 투명 배경에 흰색 글자 → 흰색 배경에서 안 보임

**개선안**:
```
- 스크롤 전: 투명 배경 + 흰색 글자 + 텍스트 그림자
- 스크롤 후: Glass morphism 배경 + 어두운 글자
- 전환 애니메이션: 부드러운 배경색/글자색 변경
```

**상세 스펙**:
| 상태 | 배경 | 글자색 | 추가 효과 |
|------|------|--------|----------|
| 상단 (Hero 위) | transparent | white | text-shadow |
| 스크롤 후 | rgba(255,255,255,0.9) | --dark-800 | backdrop-blur |
| 호버 링크 | - | --primary-600 | underline animation |

### 5.2 Hero Section

**현재 문제**: 단순한 텍스트, 임팩트 부족

**개선안**:
```
- 배경: 그라디언트 오버레이 (하단에서 상단으로 어두워짐)
- 텍스트: 세리프 폰트 + 애니메이션 진입
- CTA 버튼: 녹색 그라디언트 + 호버 효과
- 스크롤 인디케이터: 부드러운 바운스 애니메이션
- 패럴랙스: 배경 이미지 살짝 움직임
```

**레이아웃**:
```
┌─────────────────────────────────────┐
│  (투명 헤더)                         │
├─────────────────────────────────────┤
│                                     │
│        Since 1947                   │ ← fade in, delay 0.2s
│                                     │
│         草 湖                        │ ← scale in, delay 0.4s
│       초호펜션                       │ ← fade in, delay 0.6s
│                                     │
│  서울에서 1시간, 자연 속 힐링 공간    │ ← fade in, delay 0.8s
│                                     │
│  [예약하기]  [객실 둘러보기]          │ ← slide up, delay 1s
│                                     │
│           ↓ Scroll                  │ ← bounce animation
└─────────────────────────────────────┘
```

### 5.3 Welcome Section

**개선안**:
```
- 배경: 크림색 (#fdfcfa) 으로 변경
- 아이콘: 녹색 계열로 통일
- 카드: 호버 시 살짝 올라오는 효과 + 그림자
- 인용문: 세리프 폰트 + 이탤릭 + 녹색 포인트
```

### 5.4 Room Cards (객실 카드)

**현재 문제**: 밋밋한 박스, 호버 효과 없음

**개선안**:
```
- 카드 배경: 흰색 → 크림색 그라디언트
- 이미지: 호버 시 살짝 확대 (scale 1.05)
- 오버레이: 녹색 그라디언트 (하단에서)
- 제목: 세리프 폰트
- 태그 (침대/온돌): 녹색 배지
- 버튼: Primary 녹색 + 호버 효과
- 전체 카드: 호버 시 그림자 + 살짝 올라옴
```

**호버 효과**:
```css
.room-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.room-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}
.room-card:hover .room-image {
  transform: scale(1.05);
}
```

### 5.5 Gallery Section

**현재 문제**: 기본 그리드, 인터랙션 없음

**개선안**:
```
- 레이아웃: Masonry 스타일 또는 벤토 그리드
- 호버: 이미지 확대 + 오버레이 + 제목 표시
- 클릭: 라이트박스 모달
- 스크롤: 각 이미지 순차적 fade-in
```

### 5.6 Footer

**개선안**:
```
- 배경: 진한 녹색 그라디언트 (--primary-900 → --primary-950)
- 텍스트: 크림색
- 링크: 호버 시 골드색
- 로고: 녹색 → 크림색
```

---

## 6. 페이지별 개선

### 6.1 메인 페이지 (/)
- [ ] Header 스크롤 효과
- [ ] Hero 애니메이션 + 오버레이
- [ ] Welcome 섹션 배경색 + 아이콘 색상
- [ ] Room Cards 호버 효과
- [ ] Check-in Guide 스텝 애니메이션
- [ ] Facilities 탭 개선
- [ ] Journal 카드 호버 효과
- [ ] Gallery 마소닉 레이아웃
- [ ] Instagram 섹션 그라디언트
- [ ] Footer 다크 테마

### 6.2 객실 페이지 (/rooms)
- [ ] 필터 버튼 녹색 테마
- [ ] 카드 그리드 개선
- [ ] 페이지 진입 애니메이션

### 6.3 객실 상세 (/rooms/[slug])
- [ ] 이미지 갤러리 슬라이더
- [ ] 정보 카드 스타일링
- [ ] 예약 버튼 강조

### 6.4 카페 페이지 (/cafe)
- [ ] 메뉴 카드 스타일
- [ ] 갤러리 섹션

### 6.5 About 페이지 (/about)
- [ ] 타임라인 스타일
- [ ] 팀 소개 카드

### 6.6 Location 페이지 (/location)
- [ ] 지도 스타일링
- [ ] 교통편 카드

---

## 7. 기술 구현

### 7.1 CSS 변수 업데이트
`globals.css`에 새 컬러 팔레트 추가

### 7.2 Tailwind 설정
`tailwind.config.ts`에 커스텀 색상 추가

### 7.3 애니메이션 라이브러리
- CSS 키프레임 애니메이션 (기본)
- Intersection Observer API (스크롤 애니메이션)
- 필요시 Framer Motion 검토

### 7.4 컴포넌트 수정 순서

1. **globals.css** - 컬러 팔레트, 애니메이션 정의
2. **Header.tsx** - 스크롤 감지 + 스타일 변경
3. **Hero.tsx** - 오버레이 + 애니메이션
4. **Welcome.tsx** - 배경색 + 카드 효과
5. **RoomList.tsx** - 카드 스타일 + 호버
6. **Gallery.tsx** - 레이아웃 + 라이트박스
7. **Footer.tsx** - 다크 테마

---

## 8. 성공 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| 첫 인상 (Hero 체류) | - | 5초 이상 |
| 스크롤 깊이 | - | 80% 이상 |
| 예약 버튼 클릭률 | - | 향상 |
| 모바일 사용성 | 양호 | 우수 |
| 페이지 속도 | 2초 | 2초 유지 |

---

## 9. 일정

| 단계 | 작업 | 예상 |
|------|------|------|
| 1 | 컬러 시스템 + globals.css | 30분 |
| 2 | Header 개선 | 30분 |
| 3 | Hero 개선 | 45분 |
| 4 | Welcome + Cards | 45분 |
| 5 | Gallery + Footer | 45분 |
| 6 | 서브 페이지 | 1시간 |
| 7 | 테스트 + 배포 | 30분 |

---

## 10. 승인

- [ ] 컬러 팔레트 승인
- [ ] Hero 디자인 승인
- [ ] 카드 스타일 승인
- [ ] 전체 방향성 승인

---

**작성자**: Claude
**검토자**: -
**승인자**: -
