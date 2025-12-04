# PRD: 초호펜션 홈페이지 UI/UX 전면 리디자인

## 1. 개요

### 1.1 프로젝트 목표
현재 초호펜션 홈페이지가 밋밋하고 평범해 보이는 문제를 해결하여, 펜션의 프리미엄 감성과 자연 친화적 이미지를 효과적으로 전달하는 세련된 디자인으로 개선한다.

### 1.2 현재 상태 분석

**문제점:**
- 전체적으로 단조롭고 생동감이 부족함
- 섹션 간 시각적 흐름이 부자연스러움
- 애니메이션/인터랙션이 기본적인 수준
- 색상 활용이 제한적 (녹색 위주)
- 타이포그래피에 계층감 부족
- 여백과 간격이 균일하여 지루함
- 카드, 버튼 등 UI 요소가 평면적

**강점 (유지할 요소):**
- 깔끔한 컴포넌트 구조
- 반응형 레이아웃 기반
- 적절한 색상 체계 (녹색/골드)
- Tailwind CSS + shadcn/ui 기반

---

## 2. 디자인 방향성

### 2.1 컨셉: "자연 속 프리미엄 휴식"
- **Organic Luxury**: 자연스러움 + 고급스러움의 조화
- **Warm & Inviting**: 따뜻하고 환영하는 느낌
- **Subtle Motion**: 은은하지만 효과적인 움직임

### 2.2 키 비주얼 전략
1. **그라디언트 활용**: 단색 → 자연스러운 그라디언트
2. **레이어링**: 깊이감 있는 배경 레이어
3. **마이크로 인터랙션**: hover, scroll 기반 애니메이션
4. **타이포그래피 강화**: 크기/무게 대비 극대화
5. **여백의 리듬**: 불규칙한 여백으로 시각적 흥미

---

## 3. 섹션별 개선 계획

### 3.1 globals.css 스타일 시스템 확장

**추가할 요소:**
```css
/* 그라디언트 정의 */
--gradient-hero: linear-gradient(135deg, hsl(var(--primary-900)) 0%, hsl(var(--primary-700)) 100%)
--gradient-warm: linear-gradient(180deg, hsl(45 30% 96%) 0%, hsl(30 25% 94%) 100%)
--gradient-nature: linear-gradient(to bottom, transparent, hsl(var(--primary-50)))

/* 글래스모피즘 */
--glass-bg: rgba(255, 255, 255, 0.7)
--glass-border: rgba(255, 255, 255, 0.3)

/* 섀도우 확장 */
--shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.08)
--shadow-glow: 0 0 40px rgba(var(--primary), 0.15)

/* 애니메이션 */
@keyframes fadeInUp, float, shimmer, gradient-shift
```

---

### 3.2 Hero 섹션

**현재:** 배경 이미지 + 중앙 텍스트 (기본적)

**개선:**
- [ ] 배경에 부드러운 패럴랙스 효과
- [ ] 텍스트에 stagger 애니메이션 (순차적 등장)
- [ ] "草湖" 타이틀에 그라디언트 텍스트 효과
- [ ] SINCE 1947에 subtle 라인 장식
- [ ] CTA 버튼에 glow 효과 + hover 변형
- [ ] 스크롤 인디케이터에 pulse 애니메이션 강화
- [ ] 배경 오버레이를 그라디언트로 변경 (단색 → 그라디언트)

**예상 결과:** 프리미엄 호텔 웹사이트 수준의 임팩트

---

### 3.3 Welcome 섹션

**현재:** 단순 그리드 카드 나열

**개선:**
- [ ] 섹션 상단에 wave 형태의 SVG 디바이더
- [ ] 제목에 작은 장식 요소 (잎사귀 아이콘 등)
- [ ] 특징 카드에 글래스모피즘 적용
- [ ] 카드 hover 시 아이콘 애니메이션 (bounce/rotate)
- [ ] 카드 진입 시 stagger 애니메이션 (스크롤 트리거)
- [ ] 배경에 subtle한 패턴 또는 텍스처

---

### 3.4 객실 카드 (RoomCard/RoomList)

**현재:** 기본 카드 레이아웃

**개선:**
- [ ] 이미지에 hover 시 overlay + 텍스트 표시
- [ ] 카드 hover 시 전체 lift 효과 (translateY + shadow 증가)
- [ ] "침대/온돌" 뱃지 디자인 개선 (컬러 구분)
- [ ] 가격 또는 추천 태그 추가 영역
- [ ] 버튼 그룹 디자인 개선 (아이콘 포함)
- [ ] 필터 버튼을 pill 스타일로 강화

---

### 3.5 체크인 가이드 (CheckinGuide)

**현재:** 4개 스텝 카드

**개선:**
- [ ] 스텝 간 연결선을 점선 + 애니메이션으로 변경
- [ ] 각 스텝 아이콘에 circular progress 배경
- [ ] 번호 뱃지 디자인 강화 (그라디언트)
- [ ] 카드 hover 시 스케일 업 효과
- [ ] 타임라인 형태의 대안 레이아웃 고려
- [ ] 배경에 subtle 그라디언트

---

### 3.6 부대시설 (Facilities)

**현재:** 탭 기반 이미지+설명

**개선:**
- [ ] 탭 디자인 개선 (underline → pill 또는 segment)
- [ ] 탭 전환 시 fade/slide 애니메이션
- [ ] 이미지에 hover 줌 효과
- [ ] 특징 뱃지를 아이콘 포함 형태로 개선
- [ ] 이미지와 텍스트 영역 비율 조정
- [ ] 배경에 subtle 패턴

---

### 3.7 초호 저널 (JournalPreview)

**현재:** 단순 카드 그리드

**개선:**
- [ ] 첫 번째 카드를 featured 크기로 (2x 높이)
- [ ] 카테고리 뱃지에 아이콘 추가
- [ ] 카드 hover 시 그림자 + 테두리 효과
- [ ] 날짜 표시를 더 시각적으로 (아이콘 포함)
- [ ] "더보기" 버튼 디자인 개선
- [ ] 스크롤 진입 애니메이션

---

### 3.8 갤러리 (Gallery)

**현재:** 균일한 그리드

**개선:**
- [ ] Masonry 레이아웃으로 변경 (불규칙 높이)
- [ ] 이미지 hover 시 caption 오버레이
- [ ] 라이트박스 디자인 개선 (blur 배경 강화)
- [ ] 이미지 로딩 시 skeleton 애니메이션
- [ ] 갤러리 필터 기능 (카테고리별)
- [ ] 진입 애니메이션 (fade-in stagger)

---

### 3.9 인스타그램 (InstagramTags)

**현재:** 해시태그 버튼 나열

**개선:**
- [ ] 배경에 Instagram 그라디언트 (subtle)
- [ ] 태그 버튼에 hover 시 그라디언트 테두리
- [ ] 인스타그램 아이콘 애니메이션
- [ ] 팔로우 버튼 디자인 강화
- [ ] 실제 인스타 피드 미리보기 추가 고려

---

### 3.10 Header

**현재:** 기본 고정 헤더

**개선:**
- [ ] 스크롤 시 배경 변화 (투명 → 불투명)
- [ ] 로고에 hover 애니메이션
- [ ] 네비게이션 링크에 underline 애니메이션
- [ ] 예약 버튼에 glow 효과
- [ ] 모바일 메뉴 애니메이션 개선

---

### 3.11 Footer

**현재:** 기본 다크 푸터

**개선:**
- [ ] 상단에 wave SVG 디바이더
- [ ] 로고 영역 강화
- [ ] SNS 아이콘 추가 (Instagram, Naver 등)
- [ ] 링크 hover 효과 개선
- [ ] "맨 위로" 버튼 추가

---

## 4. 기술 구현 사항

### 4.1 애니메이션 라이브러리
- CSS Keyframes (기본)
- Intersection Observer (스크롤 트리거)

### 4.2 새로운 CSS 유틸리티
```css
.animate-fade-in-up
.animate-stagger-children
.animate-float
.glass-effect
.gradient-text
.hover-lift
.hover-glow
```

### 4.3 성능 고려사항
- will-change 적절히 사용
- 복잡한 애니메이션은 GPU 가속
- 이미지 lazy loading 유지
- prefers-reduced-motion 존중

---

## 5. 작업 우선순위

### Phase 1: Foundation (기반)
1. globals.css 스타일 시스템 확장
2. 공통 애니메이션 유틸리티 추가

### Phase 2: High Impact (핵심)
3. Hero 섹션 개선
4. Header 개선
5. Welcome 섹션 개선

### Phase 3: Content Sections (콘텐츠)
6. RoomCard/RoomList 개선
7. CheckinGuide 개선
8. Facilities 개선

### Phase 4: Supporting (보조)
9. JournalPreview 개선
10. Gallery 개선
11. InstagramTags 개선
12. Footer 개선

### Phase 5: Polish (마무리)
13. 전체 테스트 및 미세 조정
14. 모바일 최적화 확인

---

## 6. 성공 지표

- [ ] 시각적 임팩트 증가 (첫인상 개선)
- [ ] 스크롤 시 자연스러운 흐름
- [ ] 인터랙션 피드백 명확
- [ ] 로딩 성능 유지 (LCP < 2.5s)
- [ ] 모바일 UX 유지/개선

---

## 7. 참고 레퍼런스

### 7.1 디자인 영감
- 프리미엄 호텔/리조트 웹사이트
- 자연 친화적 브랜드 사이트
- 모던 펜션/에어비앤비 상세 페이지

### 7.2 기술 참고
- Tailwind CSS 애니메이션
- CSS scroll-driven animations
- Modern glassmorphism techniques

---

**작성일:** 2025-12-04
**작성자:** Claude (AI Assistant)
**상태:** 승인 대기
