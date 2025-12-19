# 초리골 역사 기록 섹션 PRD (Product Requirements Document)

## 문서 정보
- **작성일**: 2025-12-19
- **버전**: 1.1
- **상태**: 완료
- **배포 URL**: https://www.chorigol.co.kr/about

---

## 1. 프로젝트 개요

### 목적
초리골 마을의 역사, 지명유래, 자연환경, 문화유산, 마을발전 기록을 체계적으로 정리하여 웹사이트에 표시

### 주요 컴포넌트
- **파일 위치**: `src/components/ChorigolHistorySection.tsx`
- **API 위치**: `src/app/api/chorigol-history/route.ts`

---

## 2. 완료된 작업 (2025-12-19)

### 2.1 게시글 형태 모달 UI 추가
- [x] 카드 클릭 시 모달 오픈
- [x] 게시글 스타일 레이아웃 (제목, 본문, 출처)
- [x] 이전/다음 기록 네비게이션 (화살표 키 지원)
- [x] ESC 키로 닫기
- [x] 외부 클릭으로 닫기
- [x] Schema.org Article 마크업 (SEO)
- [x] 출처 섹션 AI 친화적 구조화

### 2.2 데이터 콘텐츠 5배 확장
- [x] 기존 20개 → 35개 항목으로 확장
- [x] 각 항목 content 약 300-500자 → 800-1500자로 확장
- [x] `\n\n`으로 문단 구분하여 가독성 향상

### 2.3 카테고리 보강
| 카테고리 | 기존 | 현재 | 비고 |
|---------|------|------|------|
| origin (지명유래) | 2개 | 6개 | 초리골, 천현면, 법원읍, 비학산, 장군봉, 삼봉산 |
| nature (자연환경) | 3개 | 7개 | 비학산, 야생동물, 장군봉, 계곡, 사계절, 식생, 암산 |
| culture (문화유산) | 2개 | 6개 | 자운서원, 다산수도원, 율곡이이, 마을제사, 율곡탄생, 먹거리 |
| history (근현대사) | 8개 | 8개 | 유지 |
| development (마을발전) | 5개 | 8개 | 마을규약, 초비클럽, 수영장, 겨울축제, 협동조합, 파주알프스, 숙박, 등산 |

### 2.4 다양한 출처 추가
- 파주시 지명유래집
- 중앙일보 강마을산마을
- 한국지명총람
- 파주군지
- 위키백과
- 파주시지
- 조선왕조실록
- 대동지지
- 한국민족문화대백과
- 문화재청
- 산림청
- 환경부
- 국가기록원
- 마을주민 구술 기록

---

## 3. 남은 작업

### 3.1 Airtable 데이터 동기화 (선택)
현재 `defaultHistoryData`에 하드코딩된 데이터를 Airtable로 옮겨 관리

**Airtable 필드 구조:**
```
- id: 고유 ID
- year: 연도/시대
- title: 제목
- content: 본문 (Long text)
- source: 출처 (콤마로 구분)
- sourceUrl: 출처 URL
- category: origin | history | nature | culture | development
- order: 정렬 순서
- viewCount: 조회수
- isPublished: 공개 여부
```

### 3.2 초리골제빵소 관련 내용 확인
- 현재 데이터에서 "초리골제빵소" 직접 언급 없음
- 초호펜션 관련 내용은 유지 (사용자 확인 완료)

---

## 4. 기술 구현 세부사항

### 4.1 모달 컴포넌트 구조
```tsx
// 상태 관리
const [selectedHistory, setSelectedHistory] = useState<ChorigolHistory | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// 모달 열기
const openModal = (history: ChorigolHistory) => {
  setSelectedHistory(history);
  setIsModalOpen(true);
  incrementViewCount(history.id, history.viewCount);
  document.body.style.overflow = 'hidden';
};

// 키보드 네비게이션
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') navigateHistory('prev');
    if (e.key === 'ArrowRight') navigateHistory('next');
  };
  // ...
}, [isModalOpen, selectedHistory]);
```

### 4.2 본문 문단 분리
```tsx
{selectedHistory.content.split('\n\n').map((paragraph, idx) => (
  <p key={idx} className="mb-6 text-base sm:text-lg leading-relaxed">
    {paragraph}
  </p>
))}
```

### 4.3 SEO 구조화 데이터
- JSON-LD ItemList (전체 목록용)
- Schema.org Article (개별 기록용)
- itemProp 속성 (headline, articleBody, citation 등)

---

## 5. 테스트 체크리스트

- [ ] 개발 서버 실행: `pnpm dev`
- [ ] 메인 페이지에서 "초리골 역사 기록" 섹션 확인
- [ ] 카드 클릭 시 모달 오픈 확인
- [ ] 모달에서 이전/다음 버튼 동작 확인
- [ ] 키보드 단축키 (←, →, ESC) 동작 확인
- [ ] 모달 외부 클릭 시 닫힘 확인
- [ ] 각 카테고리 탭 동작 확인
- [ ] 모바일 반응형 레이아웃 확인

---

## 6. 이어서 작업 시 참고사항

### 파일 경로
```
F:\choho_2025\
├── src/
│   ├── components/
│   │   └── ChorigolHistorySection.tsx  # 메인 컴포넌트
│   └── app/
│       └── api/
│           └── chorigol-history/
│               └── route.ts  # API 라우트
├── docs/
│   └── chorigol-history-prd.md  # 이 문서
└── scripts/
    └── seed-chorigol-history.js  # Airtable 시드 스크립트 (있다면)
```

### 주요 변경 사항 요약
1. 기존 확장형 카드 UI → 모달 UI로 변경
2. content 분량 5배 증가 (문단 분리)
3. 카테고리별 항목 수 대폭 증가
4. 출처 다양화 및 구조화

### 빌드 명령어
```bash
cd F:\choho_2025
pnpm dev  # 개발 서버
pnpm build  # 프로덕션 빌드
```

---

## 7. 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-19 | 초기 문서 작성, 모달 UI 추가, 데이터 5배 확장 |

---

## 8. 담당자 메모

- 초리골제빵소 관련 내용은 모두 제외 (사용자 요청)
- 초호펜션/초호정 관련 내용은 유지
- Airtable 연동 시 API 키 확인 필요
