"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ExternalLink, Scroll, MapPin, Leaf, Building2, Users, Eye, X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export interface ChorigolHistory {
  id: string;
  year: string;
  title: string;
  content: string;
  source: string;
  sourceUrl: string;
  category: "origin" | "history" | "nature" | "culture" | "development";
  order: number;
  viewCount: number;
  isPublished: boolean;
}

// 카테고리 설정 (마을발전을 첫 번째로)
const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string; activeColor: string }> = {
  development: { label: "마을발전", icon: Users, color: "text-orange-500", bgColor: "bg-orange-50", activeColor: "bg-orange-500" },
  history: { label: "근현대사", icon: Scroll, color: "text-amber-600", bgColor: "bg-amber-50", activeColor: "bg-amber-600" },
  origin: { label: "지명유래", icon: MapPin, color: "text-blue-600", bgColor: "bg-blue-50", activeColor: "bg-blue-600" },
  nature: { label: "자연환경", icon: Leaf, color: "text-green-600", bgColor: "bg-green-50", activeColor: "bg-green-600" },
  culture: { label: "문화유산", icon: Building2, color: "text-purple-600", bgColor: "bg-purple-50", activeColor: "bg-purple-600" },
};

// 카테고리 순서
const categoryOrder = ["development", "history", "origin", "nature", "culture"];

// 기본 초리골 역사 데이터 (에어테이블 데이터가 없을 때 표시)
export const defaultHistoryData: ChorigolHistory[] = [
  // ===== 지명유래 (origin) - 6개 =====
  {
    id: "1",
    year: "조선시대",
    title: "초리골 지명의 유래 - '꼬리'에서 비롯된 이름",
    content: `파주시 《지명유래집》에 따르면, '초리(礁栮)동, 초릿굴'은 법원4리 지역으로 마을 주변 산골짜기에 풀이 많이 난다 하여 붙은 이름입니다. 중앙일보 《강마을산마을》에서는 초리골이 눈의 꼬리처럼 길다고 해서 꼬리의 옛말인 '초리'에서 이름을 따왔다고 기록하고 있습니다.

마을 뒷 바위 바닥에 암초버섯(현재의 석이버섯)이 많이 달려 '초이골'이라고도 불렸습니다. 석이버섯은 조선시대 귀한 약재이자 진상품으로, 바위에 붙어 자라는 특성상 채취가 어려워 매우 귀하게 여겨졌습니다.

초리골은 비학산과 암산 사이의 깊은 골짜기에 자리 잡고 있어, 마을 형상이 마치 긴 꼬리처럼 뻗어 있습니다. 골짜기 안쪽으로 들어갈수록 점점 좁아지는 지형이 이러한 지명을 낳게 된 배경입니다.

《한국지명총람》과 《파주군지》에도 초리골의 지명 유래가 수록되어 있으며, 지역 노인들 사이에서는 여전히 '초릿굴'이라는 옛 이름이 사용되고 있습니다. 이처럼 초리골이라는 이름에는 자연환경과 지형적 특성이 함께 담겨 있습니다.`,
    source: "파주시 지명유래집, 중앙일보 강마을산마을, 한국지명총람, 파주군지",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "origin",
    order: 1,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "2",
    year: "조선시대",
    title: "천현면(泉峴面)의 역사 - 샘재의 유래",
    content: `현 법원읍 지역은 조선시대에 천현(泉峴, 샘재)의 이름을 따서 천현면이라 불렸습니다. 갈곡리와 삼성대 골짜기에서 내려오는 샘물이 법원리와 대능리 벌판의 자갈과 모래로 덮인 지하 1km 정도로 물줄기가 흘러 가야리 황새말 앞으로 터져 흘러내려 '샘물을 덮어 흐르는 고개(泉峴)'라 하였습니다.

천현면은 조선시대 파주목에 속한 행정구역으로, 1914년 일제의 행정구역 통폐합 당시에도 천현면이라는 이름이 유지되었습니다. 당시 천현면은 법원리, 대능리, 가야리, 갈곡리 등 여러 마을을 관할하였습니다.

'샘재'라는 이름이 말해주듯, 이 지역은 예로부터 수질이 좋은 샘물로 유명했습니다. 산에서 내려오는 물이 자갈층을 통과하며 자연 정화되어, 마을 주민들의 식수원으로 귀하게 여겨졌습니다.

천현면의 중심지였던 지금의 법원리 일대는 조선시대 원(院, 관영 여관)이 있던 곳으로, 한양에서 의주로 향하는 사행길의 중간 기착지 역할을 했습니다. 이러한 역사적 배경이 법원읍이라는 현재 지명에도 영향을 미쳤습니다.`,
    source: "위키백과, 파주시지, 조선왕조실록, 대동지지",
    sourceUrl: "https://ko.wikipedia.org/wiki/법원읍",
    category: "origin",
    order: 2,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "3",
    year: "조선시대",
    title: "법원읍(法院邑) 지명의 유래 - 법의리와 원기리의 합성",
    content: `법원읍이라는 이름은 법의리(法儀里)와 원기리(院基里)에서 한 자씩 따온 것으로, 사법기관 법원(法院)과는 전혀 관련이 없습니다. 많은 사람들이 법원읍에 법원이 있어서 그런 이름이 붙었다고 오해하지만, 이는 역사적 사실과 다릅니다.

법의리(法儀里)는 '예법(禮法)을 지키는 마을'이라는 의미로, 유교적 전통이 강했던 이 지역의 특성을 반영합니다. 조선시대 성리학적 질서가 마을 공동체의 근간이었던 시절, 예의범절을 중시하는 마을이라는 뜻에서 이런 이름이 붙었습니다.

원기리(院基里)는 조선시대 원(院)이 있던 터라는 뜻입니다. 원은 관리들이 공무 여행 중 숙박하던 관영 여관으로, 주요 도로변에 설치되었습니다. 법원읍 지역이 한양에서 의주로 향하는 사행로(使行路)에 위치했기 때문에 이러한 원이 존재했던 것입니다.

1989년 4월 1일 천현면이 읍으로 승격되면서 법원읍이라는 이름이 공식적으로 사용되기 시작했습니다. 이 과정에서 지역의 역사성을 담은 법의리와 원기리의 지명을 결합한 것입니다.`,
    source: "위키백과, 파주시지, 한국지명유래집",
    sourceUrl: "https://ko.wikipedia.org/wiki/법원읍",
    category: "origin",
    order: 3,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "4",
    year: "조선시대",
    title: "비학산(飛鶴山) 지명의 유래 - 학이 날아오르는 산",
    content: `비학산(飛鶴山)은 해발 454m의 산으로, '학이 날아오르는 산'이라는 뜻의 이름을 가지고 있습니다. 산의 형상이 학이 날개를 펴고 날아가는 모습과 닮아 이런 이름이 붙었다고 전해집니다.

풍수지리적으로 비학산은 매우 길한 명당으로 여겨졌습니다. 학은 동양에서 장수와 고귀함의 상징이며, 학이 날아오르는 형상의 산에서 살면 자손이 번창하고 가문이 흥한다고 믿었습니다. 실제로 이 지역에는 오랜 역사를 가진 집성촌들이 형성되어 있습니다.

비학산 주변에는 학바위, 학골 등 학과 관련된 지명이 여럿 남아 있어, 예로부터 이 일대가 학과 깊은 인연이 있었음을 보여줍니다. 조선시대 기록에도 비학산에서 학이 서식했다는 내용이 전해집니다.

현재 비학산은 초리골을 둘러싼 12개 봉우리 중 하나로, 등산객들에게 사랑받는 산입니다. 정상에서는 파주 일대가 한눈에 내려다보이며, 특히 일출 명소로 유명합니다.`,
    source: "파주시지, 한국지명총람, 대동여지도",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "origin",
    order: 4,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "5",
    year: "조선시대",
    title: "장군봉(將軍峰) 지명의 유래 - 장수의 전설이 깃든 봉우리",
    content: `장군봉은 해발 약 400m의 봉우리로, 이름 그대로 장군과 관련된 전설이 전해지는 곳입니다. 가장 널리 알려진 전설은 옛날 한 장수가 이 봉우리에서 거대한 바위들로 공기놀이를 했다는 이야기입니다.

장군봉 인근에는 장군바위라 불리는 거대한 바위가 있는데, 전설에 따르면 장수가 공기놀이에 사용했던 바위라고 합니다. 이 바위들은 실제로 인위적으로 쌓은 듯한 형태를 하고 있어 전설에 신빙성을 더해줍니다.

또 다른 전설에서는 고려시대 몽골 침입 당시 이 지역에서 의병을 이끌던 장군이 이 봉우리를 근거지로 삼았다고 전해집니다. 험준한 지형과 깊은 골짜기는 천연의 요새 역할을 했을 것입니다.

장군봉은 다산수도원에서 좌측 산길로 오르면 장군바위 전망대를 지나 약 200m를 더 올라가면 도달할 수 있습니다. 정상에서는 초리골 마을 전체가 한눈에 내려다보이며, 맑은 날에는 멀리 북한산까지 조망됩니다.`,
    source: "파주위키, 파주시 문화관광포털, 경기도 문화재자료",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "origin",
    order: 5,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "6",
    year: "조선시대",
    title: "삼봉산(三峰山) 지명의 유래 - 세 봉우리의 산",
    content: `삼봉산은 이름 그대로 세 개의 봉우리가 나란히 솟아 있어 붙여진 이름입니다. 초리골 마을의 북쪽을 병풍처럼 감싸고 있는 산으로, 마을의 자연적 경계선 역할을 합니다.

풍수지리에서 삼봉산은 초리골 마을의 주산(主山) 역할을 합니다. 세 봉우리가 마을을 보호하듯 감싸고 있어, 마을이 외부의 흉한 기운으로부터 보호받는다고 여겨졌습니다. 실제로 삼봉산은 북풍을 막아주는 역할을 하여 초리골의 겨울이 다른 지역보다 덜 춥게 느껴지게 합니다.

역사적으로 삼봉산은 1968년 1.21 사태 당시 북한 무장공비들이 휴식을 취하던 장소로 알려져 있습니다. 이때 나무하러 산에 올랐던 우씨 4형제가 공비들과 마주친 것이 바로 이 삼봉산에서였습니다.

현재 삼봉산은 등산로가 잘 정비되어 있어 초리골을 찾는 등산객들의 주요 코스가 되고 있습니다. 특히 봄철 진달래와 가을 단풍이 아름다워 사계절 내내 탐방객이 끊이지 않습니다.`,
    source: "파주위키, 국가기록원, 파주시 등산지도",
    sourceUrl: "https://ko.wikipedia.org/wiki/1·21_사태",
    category: "origin",
    order: 6,
    viewCount: 0,
    isPublished: true,
  },

  // ===== 근현대사 (history) - 8개 =====
  {
    id: "7",
    year: "1900년대 초",
    title: "장군봉 은굴의 은 채광 역사",
    content: `1900년대 초반 일제강점기 때 장군봉 정상 아래 은굴에서 은을 채광했습니다. 굴의 길이는 정확히 알 수 없으나 구전에 의하면 명주실 한 타래 정도로 긴 굴로 추정됩니다. 당시 일제는 조선의 광물 자원을 수탈하기 위해 전국 각지에서 광산 개발을 진행했으며, 초리골의 은굴도 그 일환이었습니다.

채광 과정에서 안전 시설이 부족했던 탓에 비극적인 사고가 발생했습니다. 굴이 붕괴되면서 수십 명의 광부가 목숨을 잃었다고 전해집니다. 당시 희생된 광부들 대부분이 초리골과 인근 마을 주민들이었으며, 이 사고는 마을에 큰 슬픔을 남겼습니다.

은굴의 존재는 초리골이 예로부터 광물 자원이 풍부한 지역이었음을 보여줍니다. 실제로 이 지역의 지질은 은, 금 등 귀금속이 매장되기 좋은 구조를 가지고 있습니다. 일제시대 지질조사 기록에도 이 일대의 광물 분포가 상세히 기록되어 있습니다.

현재 은굴은 군사 보안상의 이유로 입구가 콘크리트로 봉쇄되어 있습니다. 그러나 역사적 가치를 인정받아 향후 역사 탐방 코스로 개발될 가능성도 논의되고 있습니다.`,
    source: "파주위키, 일제강점기 광업조사 기록, 파주시 향토사료",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "history",
    order: 7,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "8",
    year: "1947년",
    title: "초호정의 탄생 - 나눔으로 일궈낸 연못",
    content: `1947년, 일제강점기가 끝난 직후 대한민국은 극심한 식량난에 시달리고 있었습니다. 이 어려운 시기에 초리골의 초호 우종하 선생은 마을 주민들에게 연못 공사를 제안했습니다. 그는 공사에 참여하는 주민들에게 품삯으로 식량을 제공하겠다고 약속했습니다.

당시 중장비가 없던 시절, 마을 주민들은 오직 맨손과 호미, 삽으로 땅을 파고 물길을 터서 연못을 만들었습니다. 수개월에 걸친 고된 노동 끝에 마침내 연못이 완성되었고, 이 연못은 우종하 선생의 호를 따서 '초호정(草湖亭)'이라 명명되었습니다.

초호정은 단순한 연못 그 이상의 의미를 가집니다. 어려운 시기에 나눔의 정신으로 마을 공동체가 하나 되어 일궈낸 결실이자, 주민들이 식량을 얻으며 생계를 이어갈 수 있게 해준 구원의 공간이었습니다. 이런 역사가 있어 초호정은 초리골의 상징으로 자리 잡게 되었습니다.

현재 초호정은 아름다운 정원으로 조성되어 초리골을 찾는 방문객들의 휴식처가 되고 있습니다. 연못 주변에는 우종하 선생의 나눔 정신을 기리는 안내판이 설치되어 있어 그 역사를 전하고 있습니다.`,
    source: "초호펜션, 파주위키, 마을주민 구술 기록",
    sourceUrl: "https://www.chorigol.co.kr",
    category: "history",
    order: 8,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "9",
    year: "1960년대",
    title: "은굴 폐광과 군부대 봉쇄 - 간첩 침투와 안보",
    content: `1960년대까지 간헐적으로 은을 채취하던 장군봉 은굴은 결국 폐광되었습니다. 채굴량 감소와 경제성 문제도 있었지만, 더 결정적인 이유는 안보 문제였습니다. 6.25 전쟁 이후 남북 대치 상황에서 깊고 복잡한 갱도는 간첩 침투의 위험 요소가 되었습니다.

실제로 1960년대 여러 차례 간첩이 은굴을 통해 침투하거나 은신했다는 정보가 있었습니다. 이에 따라 군부대에서 굴 입구를 콘크리트로 완전히 봉쇄하는 조치를 취했습니다. 이 봉쇄는 현재까지 유지되고 있습니다.

은굴 봉쇄는 초리골 일대가 군사적으로 민감한 지역이었음을 보여줍니다. 비무장지대(DMZ)에서 불과 수십 km 떨어진 이 지역은 냉전 시대 내내 경계가 삼엄한 곳이었습니다. 주민들도 야간 통행 제한 등 여러 불편을 감수해야 했습니다.

최근에는 남북 관계 개선과 함께 은굴을 역사 교육 현장으로 활용하자는 논의가 있습니다. 일제 수탈의 역사와 분단의 아픔을 동시에 보여줄 수 있는 공간으로서의 가치가 재조명되고 있습니다.`,
    source: "파주위키, 파주시 문화관광포털, 국방부 기록",
    sourceUrl: "https://tour.paju.go.kr/user/tour/place/BD_tourPlaceInfoView.do?q_gubun=area&areaSe=1001&cntntsSn=547",
    category: "history",
    order: 9,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "10",
    year: "1968년",
    title: "1.21 사태 - 초리골 삼봉산에서 무장공비 발견",
    content: `1968년 1월 21일은 대한민국 역사에서 잊을 수 없는 날입니다. 청와대를 기습하려던 북한 무장공비 31명이 초리골 삼봉산에서 발각된 것입니다. 이 사건은 이른바 '1.21 사태' 또는 '김신조 사건'으로 불리며, 한국 현대사의 중요한 순간으로 기록되었습니다.

그날 아침, 나무를 하러 삼봉산에 올랐던 우씨 4형제(우만수, 우창수, 우영수, 우성제)는 군복을 입은 무장 집단과 마주쳤습니다. 이들은 곧 북한 무장공비임을 알아챘고, 공비들도 형제들을 발견했습니다. 긴박한 상황에서 공비들은 형제들의 처리를 놓고 투표를 진행했습니다.

투표 결과 형제들은 살려주기로 결정되었고, 공비들은 "공화국이 통일되면 식량을 나눠주겠다"며 형제들을 풀어주었습니다. 산에서 내려온 형제들은 곧바로 인근 법원파출소에 신고했고, 이로 인해 대대적인 공비 소탕 작전이 시작되었습니다.

이 사건으로 김신조를 제외한 공비 전원이 사살 또는 자폭했으며, 김신조는 생포되어 전향했습니다. 우씨 4형제의 용감한 신고는 청와대 습격을 막는 데 결정적인 역할을 했습니다.`,
    source: "위키백과, 국가기록원, 대한민국 국방부, 언론 보도",
    sourceUrl: "https://ko.wikipedia.org/wiki/1·21_사태",
    category: "history",
    order: 10,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "11",
    year: "1989년",
    title: "천현면에서 법원읍으로 승격",
    content: `1989년 4월 1일, 경기도 파주군 조례 제1280호에 의해 천현면이 법원읍으로 명칭 변경과 함께 승격되었습니다. 이는 지역 인구 증가와 도시화에 따른 행정 수요 증가를 반영한 조치였습니다.

읍 승격 당시 법원읍의 인구는 약 2만 명에 달했습니다. 특히 서울과의 접근성이 좋아지면서 수도권 베드타운으로서의 역할이 커졌고, 이에 따른 행정 서비스 확대가 필요했습니다.

법원읍이라는 새 이름은 법의리(法儀里)와 원기리(院基里)에서 한 자씩 따온 것입니다. 많은 사람들이 사법기관 법원(法院)과 관련 있다고 오해하지만, 실제로는 조선시대 지명에서 유래한 것입니다.

읍 승격 이후 법원읍은 급격한 발전을 이루었습니다. 읍사무소가 신축되고, 도로가 확장되었으며, 상업 시설이 들어섰습니다. 초리골도 이러한 발전의 영향을 받아 접근성이 크게 개선되었습니다.`,
    source: "위키백과, 파주시 행정기록, 경기도 공보",
    sourceUrl: "https://ko.wikipedia.org/wiki/법원읍",
    category: "history",
    order: 11,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "12",
    year: "조선시대",
    title: "단양우씨 집성촌 - 대대로 이어온 마을 공동체",
    content: `초리골은 조선 초기부터 단양우씨(丹陽禹氏)가 모여 사는 집성촌으로 형성되었습니다. 조선 개국 초 정도전의 탄압을 피해 전국 산간벽지로 흩어진 단양우씨 일가 중 일부가 이 깊은 골짜기에 정착한 것이 시초입니다.

단양우씨가 초리골에 정착하게 된 배경에는 역사적 아픔이 있습니다. 고려 말 충신이었던 우현보(禹玄寶)의 후손들은 고려 왕조에 대한 충절을 지키다가 조선 건국 후 탄압을 받았습니다. 이들은 살아남기 위해 깊은 산속으로 숨어들어야 했고, 그 과정에서 일부가 초리골에 터를 잡게 되었습니다.

600년 이상의 역사를 가진 초리골 단양우씨 집성촌은 독특한 공동체 문화를 발전시켜 왔습니다. 매년 정월이면 마을 제사를 지내고, 대동회를 통해 마을의 중요한 일을 함께 결정합니다. 이러한 전통은 현재까지도 이어지고 있습니다.

2020년 기준 초리골에는 98세대 약 190명이 거주하고 있으며, 이 중 단양우씨가 약 20%를 차지합니다. 비록 다른 성씨의 비율이 높아졌지만, 마을의 역사적 정체성은 여전히 단양우씨 집성촌으로서의 전통에 뿌리를 두고 있습니다.`,
    source: "파주위키, 단양우씨 대종회, 한국족보박물관",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "history",
    order: 12,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "13",
    year: "2025년",
    title: "1.21 사태 생존자 김신조 별세 - 우씨 형제 빈소 방문",
    content: `2025년 4월 9일, 1.21 사태의 유일한 생존자이자 전향자인 김신조가 향년 83세로 세상을 떠났습니다. 그의 별세 소식은 많은 국민들에게 분단의 역사와 화해의 가능성에 대한 성찰의 시간을 선사했습니다.

김신조의 빈소에는 예상치 못한 조문객이 찾아왔습니다. 바로 1968년 초리골 삼봉산에서 무장공비 일행과 마주쳤던 우씨 4형제 중 막내인 우성제 씨였습니다. 당시 갓 스무 살이었던 우성제 씨는 이제 77세의 노인이 되어 있었습니다.

우성제 씨는 언론 인터뷰에서 "57년 전 그날을 잊은 적이 없다"며 "김신조 씨가 전향 후 목사가 되어 평생 참회의 삶을 살았다는 것을 알고 있었다"고 말했습니다. 그는 "원수를 용서하라는 말씀을 실천하고 싶었다"며 조문의 이유를 밝혔습니다.

이 만남은 분단의 상처를 딛고 화해와 용서의 가능성을 보여준 역사적 순간으로 평가받고 있습니다. 초리골은 다시 한번 한국 현대사의 중요한 장소로 주목받게 되었습니다.`,
    source: "언론 보도, 나무위키, 국가기록원",
    sourceUrl: "https://namu.wiki/w/김신조",
    category: "history",
    order: 13,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "14",
    year: "한국전쟁",
    title: "6.25 전쟁과 초리골 - 피난민들의 은신처",
    content: `1950년 6월 25일 한국전쟁이 발발하자, 초리골의 깊은 골짜기는 피난민들의 은신처가 되었습니다. 북한군이 남하하는 동안 인근 지역 주민들과 서울에서 피난 온 사람들이 이 산골짜기로 숨어들었습니다.

초리골이 피난처로 선택된 이유는 그 지형적 특성에 있습니다. 험준한 산세와 복잡한 계곡이 외부로부터의 접근을 어렵게 만들었고, 울창한 숲이 은폐를 도왔습니다. 또한 맑은 계곡물과 야생 식물이 있어 최소한의 생존이 가능했습니다.

전쟁 기간 동안 초리골 주민들은 피난민들을 받아들이고 식량을 나눴습니다. 이미 가난한 산촌이었지만, 어려운 이웃을 외면하지 않는 나눔의 정신을 발휘한 것입니다. 이러한 공동체 정신은 오늘날까지 초리골의 전통으로 이어지고 있습니다.

전쟁이 끝난 후에도 일부 피난민은 초리골에 정착하여 마을의 일원이 되었습니다. 현재 초리골에 다양한 성씨가 함께 사는 것도 이러한 역사적 배경과 관련이 있습니다.`,
    source: "파주시 향토사료, 6.25전쟁 기록, 마을주민 구술",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "history",
    order: 14,
    viewCount: 0,
    isPublished: true,
  },

  // ===== 자연환경 (nature) - 7개 =====
  {
    id: "15",
    year: "현재",
    title: "비학산과 12개 봉우리 - 초리골을 둘러싼 산세",
    content: `비학산(飛鶴山, 해발 454m)은 학이 날개를 펴고 날아가는 형상을 한 산입니다. 이 산을 중심으로 초리골 마을을 둘러싼 12개의 봉우리가 마치 병풍처럼 펼쳐져 있으며, 그 능선의 총 길이는 약 12km에 달합니다.

비학산 정상에는 전망대가 설치되어 있어 탁 트인 조망을 즐길 수 있습니다. 맑은 날에는 직천저수지의 푸른 물빛과 멀리 감악산의 웅장한 자태가 한눈에 들어옵니다. 일출 명소로도 유명하여 새해 첫날이면 많은 등산객이 찾아옵니다.

12개 봉우리는 저마다 고유한 이름과 전설을 가지고 있습니다. 장군봉, 삼봉산, 암산 등 대표적인 봉우리들은 등산객들에게 다양한 코스를 제공합니다. 초보자부터 숙련자까지 자신의 수준에 맞는 등산로를 선택할 수 있습니다.

이 산세는 풍수지리적으로도 매우 좋은 명당으로 평가받습니다. 사방이 산으로 둘러싸여 외부의 흉한 기운을 막아주고, 골짜기로 흐르는 맑은 물이 재물운을 불러온다고 여겨집니다. 이런 지형 덕분에 초리골은 예로부터 살기 좋은 마을로 알려져 왔습니다.`,
    source: "파주위키, 파주시 문화관광포털, 한국등산트레일",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 15,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "16",
    year: "현재",
    title: "초리골의 야생동물 - 도롱뇽, 가재, 노루가 사는 마을",
    content: `초리골은 도시화된 수도권에서 보기 드물게 야생동물이 풍부하게 서식하는 생태 보고입니다. 비학산과 암산 사이의 깊은 골짜기에 자리 잡은 이 마을에서는 도롱뇽, 가재, 노루, 오소리 등 다양한 야생동물을 만날 수 있습니다.

특히 초리골 계곡에는 1급수 청정 지역에서만 사는 도롱뇽과 가재가 서식합니다. 이들의 존재는 이 지역의 수질이 얼마나 깨끗한지를 보여주는 생물학적 지표입니다. 마을 규약으로 수질 오염을 엄격히 금지해 온 덕분에 이러한 청정 환경이 유지되고 있습니다.

산에서는 노루, 고라니, 멧돼지, 오소리, 너구리 등의 야생 포유류가 발견됩니다. 특히 이른 아침이나 해 질 녘에는 노루 무리가 마을 인근까지 내려오는 모습을 볼 수 있습니다. 또한 박새, 딱따구리, 청설모 등 다양한 조류도 관찰됩니다.

초리골의 풍부한 생태계는 1992년 제정된 마을 운영 규약 덕분입니다. 주민들은 공장, 축사 등 환경을 해치는 시설의 설치를 자체적으로 금지하고 자연환경 보전에 힘써왔습니다. 이러한 노력이 30년 넘게 이어져 오늘날의 생태 낙원을 만들었습니다.`,
    source: "파주위키, 환경부 생태조사, 국립생태원",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 16,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "17",
    year: "현재",
    title: "장군봉과 장군바위 - 장수의 전설이 깃든 봉우리",
    content: `다산수도원에서 좌측 산길로 오르면 먼저 장군바위 전망대를 만납니다. 이곳에서 200여 미터를 더 오르면 해발 약 400m의 장군봉에 도달합니다. 장군봉은 옛날 장수가 바위로 공기놀이를 했다는 전설이 전해지는 봉우리입니다.

장군바위는 마치 거인이 쌓아올린 듯한 거대한 바위들로 이루어져 있습니다. 전설에 따르면 옛날 힘이 장사인 장수가 이 바위들을 공기처럼 집어던지며 놀았다고 합니다. 실제로 바위의 형상이 마치 누군가 일부러 쌓은 것처럼 보여 전설에 신빙성을 더합니다.

장군바위 전망대는 초리골 마을 전체가 내려다보이는 최고의 조망점입니다. 병풍처럼 둘러선 산세와 그 사이로 자리 잡은 마을, 굽이치는 계곡이 한 폭의 그림처럼 펼쳐집니다. 특히 가을 단풍철과 겨울 설경이 아름다워 사진작가들에게 인기 있는 장소입니다.

장군봉으로 오르는 등산로는 중급자에게 적합한 난이도입니다. 왕복 약 3시간이 소요되며, 곳곳에 쉼터가 마련되어 있어 천천히 자연을 즐기며 오를 수 있습니다.`,
    source: "파주위키, 파주시 등산지도, 산림청",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 17,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "18",
    year: "현재",
    title: "초리골 계곡 - 1급수 청정 계곡의 사계절",
    content: `초리골 마을을 관통하는 계곡은 연중 맑은 물이 흐르는 1급수 청정 계곡입니다. 비학산과 주변 12개 봉우리에서 발원한 물줄기가 모여 이 계곡을 이루며, 초리골의 생명선 역할을 합니다.

봄이면 계곡 주변으로 산벚꽃과 진달래가 피어나 물 위에 꽃잎을 띄웁니다. 여름에는 시원한 계곡물이 도시의 열기를 피해 찾아온 피서객들을 반깁니다. 가을에는 단풍이 물에 비쳐 황금빛 물결을 이루고, 겨울에는 얼어붙은 계곡이 신비로운 얼음 왕국을 만들어냅니다.

계곡에는 도롱뇽과 가재가 서식하여 수질의 청정함을 증명합니다. 이들 생물은 오염에 극도로 민감하여 깨끗한 물에서만 살 수 있습니다. 초리골 주민들이 30년 넘게 지켜온 환경 보전 노력의 결과물입니다.

여름철이면 많은 가족들이 이 계곡에서 물놀이를 즐깁니다. 얕은 곳은 어린이들도 안전하게 놀 수 있으며, 바위 사이사이 작은 웅덩이는 천연 물놀이 장소가 됩니다. 계곡 주변에는 그늘을 만들어주는 참나무와 소나무가 우거져 있어 피크닉 장소로도 인기가 높습니다.`,
    source: "파주위키, 환경부 수질측정망, 파주시 환경정보",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 18,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "19",
    year: "현재",
    title: "초리골의 사계절 - 파주의 알프스라 불리는 이유",
    content: `초리골은 '파주의 알프스'라는 별명으로 불릴 만큼 아름다운 자연경관을 자랑합니다. 사방이 산으로 둘러싸인 분지 지형과 맑은 계곡, 울창한 숲이 어우러져 마치 스위스의 작은 마을을 연상시킵니다.

봄에는 산벚꽃, 진달래, 철쭉이 산 전체를 물들입니다. 특히 4월 중순 비학산 능선을 따라 핀 진달래 군락은 장관을 이룹니다. 여름에는 울창한 녹음 사이로 흐르는 맑은 계곡물이 천연 에어컨 역할을 하여, 도시보다 평균 5도 이상 서늘한 피서지가 됩니다.

가을의 초리골은 단풍의 향연입니다. 12개 봉우리가 황금빛, 주홍빛, 갈색으로 물들어 마치 자연이 만든 거대한 팔레트 같습니다. 이 시기 많은 사진작가들이 초리골을 찾아 그 아름다움을 카메라에 담습니다.

겨울에는 다른 지역보다 기온이 낮아 눈이 오래 쌓여 있습니다. 하얀 눈으로 덮인 산과 얼어붙은 계곡은 동화 속 겨울왕국을 연상시킵니다. 이런 기후 조건을 활용해 '눈 내리는 초리골' 겨울축제가 매년 개최됩니다.`,
    source: "파주시 문화관광포털, 파이낸셜뉴스, 한국관광공사",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "nature",
    order: 19,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "20",
    year: "현재",
    title: "초리골의 식생 - 참나무와 소나무가 어우러진 숲",
    content: `초리골을 둘러싼 산에는 다양한 수종이 어우러진 건강한 숲 생태계가 형성되어 있습니다. 주요 수종으로는 참나무류(신갈나무, 졸참나무, 굴참나무)와 소나무가 대표적이며, 이 외에도 잣나무, 밤나무, 단풍나무 등이 자생합니다.

참나무 숲은 초리골 생태계의 근간입니다. 가을에 떨어지는 도토리는 다람쥐, 청설모, 멧돼지 등 야생동물의 중요한 먹이원이 됩니다. 또한 참나무의 낙엽은 분해되어 토양을 비옥하게 만들고, 많은 곤충의 서식처를 제공합니다.

소나무 숲에서는 송이버섯이 자랍니다. 매년 가을이면 마을 주민들이 산에 올라 송이를 채취하는 전통이 이어지고 있습니다. 비록 과거만큼 많은 양은 아니지만, 여전히 소나무 숲에서 향긋한 송이를 발견할 수 있습니다.

계곡 주변에는 버드나무, 오리나무 등 습지식물이 자라며, 숲 가장자리에는 개암나무, 산딸기, 머루 등이 자생합니다. 봄에는 취나물, 고사리, 두릅 등 산나물이 풍부하여 마을 주민들의 밥상을 풍요롭게 합니다.`,
    source: "산림청, 국립산림과학원, 파주시 환경정보",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 20,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "21",
    year: "현재",
    title: "암산(巖山)과 바위 지형 - 기암괴석의 향연",
    content: `초리골을 둘러싼 산들 중 암산(巖山)은 그 이름처럼 바위가 많은 산입니다. 크고 작은 바위들이 산 전체에 걸쳐 분포하며, 곳곳에 기암괴석이 독특한 경관을 만들어냅니다.

암산의 바위들은 주로 화강암으로 이루어져 있습니다. 오랜 세월 풍화작용을 거치며 다양한 형상을 갖추게 되었는데, 동물을 닮은 바위, 사람 얼굴을 닮은 바위 등이 있어 상상력을 자극합니다. 주민들 사이에서는 저마다 바위에 이름을 붙이고 전설을 만들어 전해왔습니다.

가장 유명한 바위는 장군바위입니다. 장수가 공기놀이를 했다는 전설이 깃든 이 바위는 여러 개의 거대한 바위가 아슬아슬하게 쌓여 있는 형상입니다. 그 외에도 두꺼비바위, 선녀바위 등 재미있는 이름의 바위들이 산재해 있습니다.

암산은 암벽등반 동호인들에게도 알려진 장소입니다. 적당한 난이도의 암벽 코스가 있어 초보자부터 숙련자까지 암벽등반을 즐길 수 있습니다. 안전 장비를 갖추고 경험자와 함께라면 색다른 등반 체험을 할 수 있습니다.`,
    source: "파주위키, 한국지질자원연구원, 대한산악연맹",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 21,
    viewCount: 0,
    isPublished: true,
  },

  // ===== 문화유산 (culture) - 6개 =====
  {
    id: "22",
    year: "1615년",
    title: "자운서원 건립 - 율곡 이이 선생을 기리다",
    content: `자운서원(紫雲書院)은 조선시대의 대학자 율곡 이이(李珥, 1536~1584)의 학문과 덕행을 추모하고자 광해군 7년(1615)에 건립되었습니다. 율곡 선생이 생전에 이 지역에서 학문을 닦고 제자들을 가르쳤던 인연으로 이곳에 서원이 세워졌습니다.

효종 1년(1650)에는 국왕으로부터 '자운(紫雲)'이라는 사액을 받아 사액서원이 되었습니다. 사액서원은 국가에서 공인한 서원으로, 토지와 노비를 하사받고 서적을 지원받는 등 특별한 대우를 받았습니다. 자운이라는 이름은 상서로운 자주빛 구름을 의미합니다.

숙종 39년(1713)에는 율곡의 수제자였던 김장생(金長生)과 조선 후기 대학자 박세채(朴世采)를 추가로 배향했습니다. 이로써 자운서원은 조선 성리학의 주요 학통을 이어받은 서원으로서의 위상을 갖추게 되었습니다.

그러나 1868년 흥선대원군의 서원철폐령으로 자운서원은 폐쇄되었습니다. 전국 47개 서원만 남기고 모든 서원을 철폐한 이 조치로 자운서원도 문을 닫아야 했습니다. 이후 100년이 지난 1969년에 다시 복원되어 현재에 이르고 있습니다.`,
    source: "위키백과, 파주시 문화관광포털, 한국민족문화대백과, 문화재청",
    sourceUrl: "https://ko.wikipedia.org/wiki/자운서원",
    category: "culture",
    order: 22,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "23",
    year: "현재",
    title: "다산수도원 - 초리골 깊은 곳의 노동피정 공간",
    content: `초리골 계곡의 가장 깊숙한 곳에 자리 잡은 다산수도원은 가톨릭 수도원으로, '노동피정'이라는 독특한 영성 프로그램을 운영하고 있습니다. 1970년대에 설립된 이 수도원은 도시의 번잡함에서 벗어나 노동과 기도로 하느님을 만나는 공간입니다.

수도원 주변에는 약 28만 평(약 93만㎡)의 전답과 양어장, 가축 사육장이 있습니다. 피정 참가자들은 이곳에서 농사일, 가축 돌보기, 청소 등 다양한 육체노동에 참여합니다. 단순 반복적인 노동을 통해 마음을 비우고 내면의 평화를 찾는 것이 노동피정의 핵심입니다.

다산수도원의 수도자들은 자급자족 생활을 실천합니다. 직접 농사지은 채소와 과일, 양어장에서 기른 물고기, 사육장의 가축으로 식탁을 차립니다. 이러한 생활 방식은 자연과 조화를 이루며 살아가는 옛 수도자들의 전통을 계승한 것입니다.

수도원은 종교를 불문하고 마음의 치유가 필요한 누구에게나 열려 있습니다. 특히 번아웃에 시달리는 직장인, 삶의 방향을 고민하는 청년들이 많이 찾습니다. 며칠간의 노동피정을 통해 일상의 스트레스를 풀고 삶의 의미를 재발견하는 사람들이 많습니다.`,
    source: "파주위키, 가톨릭신문, 천주교 수원교구",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "culture",
    order: 23,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "24",
    year: "조선시대",
    title: "율곡 이이와 파주 - 자운서원이 이곳에 세워진 이유",
    content: `율곡 이이(1536~1584)는 조선 중기의 대학자이자 정치가로, 퇴계 이황과 함께 조선 성리학의 양대 산맥으로 평가받습니다. 그가 파주와 인연을 맺게 된 것은 외가와 처가가 이 지역에 있었기 때문입니다.

율곡의 어머니 신사임당은 강릉 출신이지만, 율곡 자신은 파주에서 상당 기간을 보냈습니다. 특히 학문에 전념하던 젊은 시절과 관직에서 물러난 말년에 파주에 머물렀습니다. 그가 세상을 떠난 곳도 파주였습니다.

자운서원이 세워진 자리는 율곡이 생전에 제자들을 가르치던 강학 장소였다고 전해집니다. 율곡은 이곳의 맑은 공기와 고요한 환경이 학문에 전념하기 좋다고 여겼습니다. 서원의 이름 '자운'은 이 지역에 자주 나타나던 상서로운 보라빛 구름에서 따왔습니다.

현재 자운서원 경내에는 율곡을 모신 문성사(文成祠)를 비롯하여 강당인 일신재(日新齋), 학생들이 기거하던 경의재(敬義齋)와 정의재(精義齋) 등의 건물이 복원되어 있습니다. 매년 봄가을에 제향을 올리며 율곡 선생의 학덕을 기립니다.`,
    source: "한국민족문화대백과, 율곡학회, 파주시 문화관광포털",
    sourceUrl: "https://ko.wikipedia.org/wiki/자운서원",
    category: "culture",
    order: 24,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "25",
    year: "현재",
    title: "초리골 마을 제사 - 대동회와 전통 문화",
    content: `초리골에서는 매년 정월이면 마을 제사를 지내는 전통이 이어지고 있습니다. 이 제사는 마을의 안녕과 풍요를 기원하는 의식으로, 수백 년 전부터 전해 내려온 풍습입니다.

제사는 마을 어른들이 주관하며, 온 마을 주민이 참여합니다. 제물은 마을에서 공동으로 준비하며, 떡, 과일, 나물, 술 등 정성스럽게 마련합니다. 제사가 끝나면 모든 주민이 함께 음식을 나누며 한 해의 평안을 빕니다.

대동회(大同會)는 마을의 중요한 일을 결정하는 주민자치 모임입니다. 과거에는 마을 운영에 관한 모든 사항을 이 자리에서 논의했습니다. 현재도 마을 개발 사업, 축제 개최, 환경 보전 문제 등 주요 안건이 대동회에서 다뤄집니다.

이러한 전통적인 공동체 문화는 1992년 마을 운영 규약 제정의 바탕이 되었습니다. 개인의 이익보다 마을 전체의 이익을 우선시하는 전통이 있었기에, 공장·축사 설치 금지 등 환경 보전 규약을 만들고 지킬 수 있었습니다.`,
    source: "파주위키, 파주시 향토문화, 마을주민 구술",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "culture",
    order: 25,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "26",
    year: "1536년",
    title: "율곡 이이의 탄생과 파주의 인연",
    content: `1536년(중종 31년) 강릉 북평촌(현 오죽헌)에서 율곡 이이가 태어났습니다. 어머니 신사임당은 조선 최고의 여성 예술가로 평가받는 인물입니다. 율곡은 어릴 때부터 총명하여 3세에 글을 배우기 시작했고, 8세에 시를 지었다고 전해집니다.

율곡이 파주와 인연을 맺게 된 것은 16세 때 어머니 신사임당이 세상을 떠나면서입니다. 3년상을 마친 후 율곡은 금강산에 들어가 불교를 공부했다가, 다시 유학으로 돌아와 학문에 매진했습니다. 이 시기부터 파주에서 머무는 시간이 많아졌습니다.

23세에 별시 문과에 장원 급제한 율곡은 이후 관직 생활과 낙향을 반복했습니다. 정치적으로 어려운 시기에는 파주에 은거하며 학문 연구와 제자 양성에 힘썼습니다. 《격몽요결》, 《성학집요》 등 그의 주요 저술 중 일부가 이 시기에 집필되었습니다.

1584년(선조 17년) 율곡은 49세의 나이로 파주에서 세상을 떠났습니다. 그의 유해는 파주에 안장되었으며, 사후 문성(文成)이라는 시호를 받았습니다. 1615년 그를 추모하는 자운서원이 건립되어 오늘에 이르고 있습니다.`,
    source: "한국민족문화대백과, 율곡학회, 조선왕조실록",
    sourceUrl: "https://ko.wikipedia.org/wiki/자운서원",
    category: "culture",
    order: 26,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "27",
    year: "현재",
    title: "초리골의 먹거리 문화 - 산골 마을의 맛",
    content: `초리골은 깊은 산골 마을답게 자연에서 얻은 재료로 만든 음식이 발달했습니다. 맑은 계곡물로 키운 송어와 산에서 채취한 나물, 마을에서 재배한 농산물이 초리골 음식의 근간입니다.

봄이면 산에서 취나물, 고사리, 두릅, 달래 등 각종 산나물을 채취합니다. 이 나물들로 무침이나 국을 끓이면 도시에서는 맛볼 수 없는 향긋한 봄의 맛을 느낄 수 있습니다. 특히 초리골의 취나물은 향이 진하고 부드럽기로 유명합니다.

여름에는 시원한 계곡에서 키운 송어가 별미입니다. 마을 인근 양어장에서 깨끗한 물로 기른 송어는 회, 매운탕, 구이 등 다양한 방식으로 조리됩니다. 송어회의 담백한 맛과 쫄깃한 식감은 방문객들에게 인기가 높습니다.

가을에는 산에서 채취한 버섯과 밤, 도토리가 식탁에 오릅니다. 특히 참나무 숲에서 자라는 표고버섯과 도토리묵은 초리골의 대표적인 가을 먹거리입니다. 겨울에는 따뜻한 손두부와 청국장이 산골 마을의 추위를 녹여줍니다.`,
    source: "파주시 문화관광포털, 파주위키, 농촌진흥청",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "culture",
    order: 27,
    viewCount: 0,
    isPublished: true,
  },

  // ===== 마을발전 (development) - 8개 =====
  {
    id: "28",
    year: "1992년",
    title: "초리골 마을 운영 규약 제정 - 자연환경 보전의 시작",
    content: `1992년, 파주시 법원읍 초리골 마을 주민들은 스스로 마을 운영 규약을 만들었습니다. 이 규약은 마을의 자연환경을 보전하고 조화로운 공동체를 유지하기 위한 주민 자치 헌법이라 할 수 있습니다.

규약의 핵심 내용은 환경 보전입니다. 공장, 축사 등 환경을 훼손할 우려가 있는 시설의 신축을 금지했습니다. 또한 2층을 초과하는 건물을 지을 때는 반드시 마을 주민의 동의를 받도록 했습니다. 이는 마을의 경관을 해치는 고층 건물을 막기 위함입니다.

이 규약이 특별한 이유는 법적 강제력이 아닌 주민들의 자발적 합의로 만들어졌다는 점입니다. 개발 이익의 유혹에도 불구하고 주민들은 장기적인 마을의 가치를 선택했습니다. 이러한 선택이 가능했던 것은 대동회라는 전통적인 주민자치 문화가 있었기 때문입니다.

30년이 지난 현재, 규약은 여전히 효력을 발휘하고 있습니다. 덕분에 초리골은 수도권에서 보기 드문 청정 마을로 남아 있으며, '파주의 알프스'라는 별명을 얻을 수 있었습니다. 이 규약은 주민 주도 환경 보전의 모범 사례로 다른 지역에서도 주목받고 있습니다.`,
    source: "파주위키, 파이낸셜뉴스, 경기도 마을공동체 사례집",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 28,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "29",
    year: "2018년",
    title: "초비클럽 결성 - 귀촌민과 원주민이 함께하는 공동체",
    content: `2018년, 초리골 지역의 사업자 15명이 모여 '초비클럽'을 결성했습니다. 초비클럽은 초리골과 비학산의 첫 글자를 딴 이름으로, 마을 발전과 상생을 목표로 하는 자생적 모임입니다.

초비클럽의 가장 큰 특징은 귀촌민과 원주민이 함께한다는 점입니다. 도시에서 초리골로 이주해 펜션, 카페, 음식점 등을 운영하는 귀촌민과, 대대로 이곳에서 살아온 원주민이 협력하여 마을을 함께 만들어갑니다.

초비클럽에서 가장 획기적인 아이디어가 나왔는데, 바로 '눈 내리는 초리골' 겨울축제입니다. 초리골이 다른 지역보다 기온이 낮아 눈이 오래 남는다는 점에 착안하여, 이를 축제로 만들자는 제안이 나온 것입니다. 이 아이디어는 실제로 실현되어 파주시 유일의 겨울축제가 되었습니다.

초비클럽은 정기 모임을 통해 마을의 현안을 논의하고, 공동 마케팅을 진행합니다. 또한 신규 사업자 교육, 품질 관리 등을 통해 초리골 전체의 서비스 수준 향상을 위해 노력하고 있습니다. 이러한 활동은 초리골을 단순한 관광지가 아닌 지속 가능한 마을로 만들어가고 있습니다.`,
    source: "파이낸셜뉴스, 파주시 소식지, 경기도 마을기업 사례",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 29,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "30",
    year: "2018년",
    title: "더 초리골 수영장 개장 - 여름 휴양지로의 변신",
    content: `2018년 여름, 초리골에 특색 있는 수영장 '더 초리골'이 개장했습니다. 이 수영장의 등장으로 초리골은 본격적인 여름 휴양지로 변모하게 되었습니다.

더 초리골 수영장의 가장 큰 특징은 취사가 가능하다는 점입니다. 가족 단위 방문객들이 수영을 즐기면서 바비큐 파티도 할 수 있어, 당일치기 나들이 장소로 인기를 끌고 있습니다. 비학산의 푸른 산세를 배경으로 물놀이를 즐기는 경험은 도시의 수영장에서는 할 수 없는 것입니다.

개장 이후 여름철에는 하루 평균 500여 명이 방문할 정도로 인기가 높습니다. 특히 주말과 휴가철에는 수도권 전역에서 가족 단위 방문객이 몰려듭니다. 이로 인해 인근 펜션, 식당, 카페의 매출도 함께 증가했습니다.

더 초리골 수영장의 성공은 초리골이 등산객만을 위한 마을에서 다양한 즐길거리가 있는 관광지로 진화하는 계기가 되었습니다. 이후 캠핑장, 야외 공연장 등 다양한 시설이 추가되면서 초리골의 관광 인프라는 더욱 풍성해졌습니다.`,
    source: "파이낸셜뉴스, 파주시 문화관광포털",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 30,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "31",
    year: "2019년",
    title: "눈 내리는 초리골 겨울축제 시작",
    content: `2019년 겨울, 파주시 유일의 겨울축제 '눈 내리는 초리골'이 첫 개최되었습니다. 초비클럽에서 시작된 아이디어가 파주시의 지원을 받아 본격적인 축제로 발전한 것입니다.

축제는 초리골의 자연 조건을 최대한 활용합니다. 마을 전체가 깊은 골짜기에 위치해 겨울철 기온이 주변 지역보다 현저히 낮습니다. 덕분에 자연 눈이 오래 유지되고, 인공 설비 없이도 눈썰매장과 얼음썰매장 운영이 가능합니다.

축제 기간에는 눈썰매, 얼음썰매 외에도 빙어잡기, 송어낚시 체험 등 다양한 프로그램이 진행됩니다. 특히 직접 잡은 물고기를 현장에서 회로 떠서 먹을 수 있어 어린이들에게 인기가 높습니다. 밤에는 화톳불 주변에서 군밤과 어묵을 먹으며 겨울밤을 즐길 수 있습니다.

첫해 축제는 예상을 뛰어넘는 방문객이 몰려 대성공을 거두었습니다. 이후 매년 규모가 커져 파주를 대표하는 겨울 축제로 자리 잡았습니다. 겨울에는 한산했던 초리골이 연중 관광객이 찾는 사계절 관광지로 탈바꿈하게 된 것입니다.`,
    source: "파주시 문화관광포털, 경기관광공사, 파이낸셜뉴스",
    sourceUrl: "https://tour.paju.go.kr/user/board/BD_board.view.do?bbsCd=2001&seq=20191231151147883",
    category: "development",
    order: 31,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "32",
    year: "2019년",
    title: "초리골 협동조합 설립 - 마을살리기 프로젝트",
    content: `2019년 11월, 파주형 마을살리기 프로젝트의 일환으로 초리골 협동조합이 공식 설립되었습니다. 이 협동조합은 마을의 발전과 주민 복지를 위해 주민들이 자발적으로 만든 경제 공동체입니다.

초리골 협동조합의 주요 업무는 크게 세 가지입니다. 첫째, 마을 개발 및 복지 증진입니다. 마을 환경 개선 사업, 주민 편의시설 확충 등을 추진합니다. 둘째, 문화 보존 및 육성입니다. 마을의 전통문화를 보존하고 새로운 문화 콘텐츠를 개발합니다. 셋째, 주민 소득사업 추진입니다. 마을 공동 사업을 통해 주민들의 소득을 창출합니다.

협동조합 설립 이후 마을에는 많은 변화가 있었습니다. 공동 브랜드 개발, 통합 마케팅, 공동 구매 등을 통해 개별 사업자들의 경쟁력이 강화되었습니다. 또한 마을 축제 운영, 관광 프로그램 개발 등 공동 사업의 규모와 질이 향상되었습니다.

협동조합은 파주시와 긴밀히 협력하며 다양한 지원 사업에 참여하고 있습니다. 정부와 지자체의 농촌 관광 활성화 정책, 마을기업 육성 사업 등에 적극 참여하여 외부 자원을 마을로 끌어오는 역할도 합니다.`,
    source: "파주위키, 파이낸셜뉴스, 기획재정부 협동조합 포털",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "development",
    order: 32,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "33",
    year: "2020년",
    title: "파주의 알프스 - 소득 주도형 마을로 진화",
    content: `2020년, 초리골은 '파주의 알프스'라는 별명과 함께 전국적으로 알려지기 시작했습니다. 파이낸셜뉴스를 비롯한 주요 언론에서 초리골을 주민 주도 마을 발전의 모범 사례로 소개하면서입니다.

기사는 초리골이 30년 넘게 지켜온 환경 보전 노력과 최근의 관광 사업 성공을 조명했습니다. 자연경관이 수려하여 '파주의 알프스'라 불릴 만하고, 펜션, 캠핑장, 카페, 음식점, 수영장 등 다양한 시설이 조성되어 등산객, 캠핑족, 탐방객들이 즐겨 찾는 숨은 명소가 되었다는 내용입니다.

특히 기사는 주민 스스로 지켜온 아름다운 초리골이 파주형 마을살리기 프로젝트에 힘입어 '소득 주도형' 마을로 진화하고 있다고 평가했습니다. 환경 보전과 경제 발전이 상충하지 않고 함께 갈 수 있음을 보여주는 사례라는 것입니다.

이 기사 이후 초리골에 대한 관심이 높아지면서 방문객이 크게 증가했습니다. 또한 다른 지역에서 마을 발전 모델을 배우기 위해 벤치마킹 방문도 이어지고 있습니다. 초리골의 성공 경험은 농촌 지역 활성화를 고민하는 많은 마을에 희망이 되고 있습니다.`,
    source: "파이낸셜뉴스, 한국관광공사, 행정안전부 마을공동체 사례",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 33,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "34",
    year: "현재",
    title: "초리골의 숙박 시설 - 자연 속 힐링 공간",
    content: `초리골에는 다양한 형태의 숙박 시설이 운영되고 있습니다. 전통 한옥 스타일부터 모던한 펜션, 가족 캠핑장까지, 취향과 목적에 맞는 숙박 옵션을 선택할 수 있습니다.

마을에서 가장 오래된 숙박 시설인 초호펜션은 초호정 연못을 품고 있어 운치 있는 분위기를 자랑합니다. 1947년 마을 주민들이 함께 만든 연못의 역사를 간직한 공간에서 하룻밤을 보내는 것은 특별한 경험입니다. 이 외에도 산자락에 자리 잡은 여러 펜션들이 각각 개성 있는 시설과 서비스를 제공합니다.

캠핑족들을 위한 시설도 잘 갖춰져 있습니다. 오토 캠핑장에서는 차를 바로 옆에 주차하고 텐트를 칠 수 있어 편리합니다. 글램핑 시설도 있어 캠핑 장비가 없는 초보자도 자연 속에서의 밤을 즐길 수 있습니다.

대부분의 숙박 시설이 마을 운영 규약에 따라 2층 이하로 지어져 주변 경관과 조화를 이룹니다. 고층 건물이 없어 밤에는 별이 잘 보이고, 아침에는 새소리에 눈을 뜨는 진정한 힐링을 경험할 수 있습니다.`,
    source: "파주시 문화관광포털, 파주위키",
    sourceUrl: "https://www.chorigol.co.kr",
    category: "development",
    order: 34,
    viewCount: 0,
    isPublished: true,
  },
  {
    id: "35",
    year: "현재",
    title: "초리골 등산 코스 - 12봉 능선 종주",
    content: `초리골을 둘러싼 12개 봉우리를 잇는 능선 종주 코스는 등산 마니아들 사이에서 숨은 명품 코스로 알려져 있습니다. 총 길이 약 12km의 이 코스는 하루에 완주하기 적당하며, 다양한 난이도의 구간이 어우러져 지루할 틈이 없습니다.

종주 코스는 보통 마을 입구에서 시작하여 비학산을 거쳐 장군봉, 삼봉산을 지나 다시 마을로 돌아오는 원형 코스로 구성됩니다. 완주에는 5~7시간이 소요되며, 중간중간 쉼터와 조망점이 있어 체력을 안배하며 걸을 수 있습니다.

각 봉우리마다 다른 풍경을 감상할 수 있는 것이 이 코스의 매력입니다. 비학산에서는 직천저수지와 감악산이, 장군봉에서는 초리골 마을 전체가, 삼봉산에서는 북쪽으로 펼쳐진 파주 일대가 조망됩니다. 맑은 날에는 멀리 북한산까지 보입니다.

초보자를 위한 단축 코스도 있습니다. 비학산만 오르는 코스는 왕복 3시간, 장군봉까지 가는 코스는 왕복 4시간 정도 소요됩니다. 마을의 카페나 식당에서 등산 지도를 무료로 제공하니 방문 전 확인하면 좋습니다.`,
    source: "파주시 등산지도, 한국등산트레일, 산림청",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "development",
    order: 35,
    viewCount: 0,
    isPublished: true,
  },
];

interface ChorigolHistorySectionProps {
  data?: ChorigolHistory[];
}

// SEO 구조화 데이터 생성 (Schema.org Article)
function generateJsonLd(histories: ChorigolHistory[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "파주 초리골 역사 기록",
    "description": "경기도 파주시 법원읍 초리골의 역사와 이야기를 기록합니다.",
    "numberOfItems": histories.length,
    "itemListElement": histories.map((history, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": history.title,
        "description": history.content.substring(0, 200),
        "datePublished": history.year,
        "author": {
          "@type": "Organization",
          "name": "초호펜션"
        },
        "publisher": {
          "@type": "Organization",
          "name": "초호펜션",
          "url": "https://www.chorigol.co.kr"
        },
        "about": {
          "@type": "Place",
          "name": "초리골",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "파주시",
            "addressRegion": "경기도",
            "addressCountry": "KR"
          }
        },
        "citation": history.source,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ReadAction",
          "userInteractionCount": history.viewCount
        }
      }
    }))
  };
}

export default function ChorigolHistorySection({ data }: ChorigolHistorySectionProps) {
  const [histories, setHistories] = useState<ChorigolHistory[]>(
    data && data.length > 0 ? data : defaultHistoryData
  );
  // 기본 카테고리: 마을발전 (development)
  const [selectedCategory, setSelectedCategory] = useState<string>("development");
  const [selectedHistory, setSelectedHistory] = useState<ChorigolHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);

  // data prop이 변경되면 histories 업데이트
  useEffect(() => {
    if (data && data.length > 0) {
      setHistories(data);
    }
  }, [data]);

  // 조회수 증가 API 호출
  const incrementViewCount = useCallback(async (id: string, currentCount: number) => {
    if (viewedIds.has(id)) return;

    try {
      const response = await fetch('/api/chorigol-history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          viewCount: currentCount + 1,
        }),
      });

      if (response.ok) {
        setHistories(prev => prev.map(h =>
          h.id === id ? { ...h, viewCount: h.viewCount + 1 } : h
        ));
        setViewedIds(prev => new Set(prev).add(id));
      }
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  }, [viewedIds]);

  // 카테고리별 필터링 + 최신순 정렬 (order 내림차순)
  const filteredHistories = (selectedCategory === "all"
    ? histories
    : histories.filter(h => h.category === selectedCategory)
  ).sort((a, b) => b.order - a.order);

  // 모달 열기
  const openModal = (history: ChorigolHistory) => {
    setSelectedHistory(history);
    setIsModalOpen(true);
    incrementViewCount(history.id, history.viewCount);
    document.body.style.overflow = 'hidden';
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHistory(null);
    document.body.style.overflow = 'unset';
  };

  // 이전/다음 기록으로 이동
  const navigateHistory = (direction: 'prev' | 'next') => {
    if (!selectedHistory) return;
    const currentIndex = filteredHistories.findIndex(h => h.id === selectedHistory.id);
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredHistories.length - 1;
    } else {
      newIndex = currentIndex < filteredHistories.length - 1 ? currentIndex + 1 : 0;
    }
    const newHistory = filteredHistories[newIndex];
    setSelectedHistory(newHistory);
    incrementViewCount(newHistory.id, newHistory.viewCount);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateHistory('prev');
      if (e.key === 'ArrowRight') navigateHistory('next');
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedHistory]);

  // 모달 외부 클릭으로 닫기
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  // JSON-LD 구조화 데이터
  const jsonLd = generateJsonLd(histories);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      {/* SEO 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            초리골 역사 기록
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            경기도 파주시 법원읍 초리골의 역사와 이야기를 기록합니다.
          </p>
        </div>

        {/* Category Filter - 탭 스타일 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8 max-w-3xl mx-auto">
          {categoryOrder.map((key) => {
            const config = categoryConfig[key];
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedCategory(key);
                  closeModal();
                }}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? `${config.activeColor} text-white shadow-md`
                    : "bg-white text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                <config.icon size={14} />
                {config.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setSelectedCategory("all");
              closeModal();
            }}
            className={`py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
              selectedCategory === "all"
                ? "bg-gray-700 text-white shadow-md"
                : "bg-white text-muted-foreground hover:bg-muted border border-border"
            }`}
          >
            전체보기
          </button>
        </div>

        {/* 세로형 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistories.map((history) => {
            const config = categoryConfig[history.category] || categoryConfig.history;

            return (
              <article
                key={history.id}
                onClick={() => openModal(history)}
                className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 transform bg-white shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] group"
              >
                {/* 카테고리 컬러 바 (상단 악센트) */}
                <div className={`h-1.5 ${config.activeColor}`} />

                {/* 카드 헤더 - 년도 강조 */}
                <div className="px-5 pt-4 pb-3 bg-gradient-to-b from-muted/30 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black tracking-tight text-primary">
                      {history.year}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.color}`}>
                      <config.icon size={12} />
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* 카드 바디 */}
                <div className="px-5 pb-5">
                  {/* 제목 */}
                  <h3 className="font-bold leading-snug mb-3 text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {history.title}
                  </h3>

                  {/* 구분선 */}
                  <div className="h-px mb-3 bg-border" />

                  {/* 미리보기 */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {history.content}
                  </p>

                  {/* 푸터 - 조회수 + 더보기 힌트 */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    {history.viewCount > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye size={12} />
                        {history.viewCount.toLocaleString()}
                      </div>
                    ) : (
                      <div />
                    )}
                    <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      <BookOpen size={12} />
                      자세히 보기
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredHistories.length === 0 && (
          <div className="text-center py-12">
            <Scroll className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">해당 카테고리의 기록이 없습니다.</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            ※ 본 기록은 공개된 자료를 바탕으로 정리되었습니다.
          </p>
        </div>
      </div>

      {/* 게시글 형태 모달 */}
      {isModalOpen && selectedHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleModalBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 z-10 bg-white border-b border-border">
              {/* 카테고리 컬러 바 */}
              <div className={`h-2 ${categoryConfig[selectedHistory.category]?.activeColor || 'bg-gray-500'}`} />

              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full ${
                    categoryConfig[selectedHistory.category]?.bgColor || 'bg-gray-100'
                  } ${categoryConfig[selectedHistory.category]?.color || 'text-gray-600'}`}>
                    {(() => {
                      const IconComponent = categoryConfig[selectedHistory.category]?.icon || Scroll;
                      return <IconComponent size={14} />;
                    })()}
                    {categoryConfig[selectedHistory.category]?.label || '기록'}
                  </span>
                  <span className="text-lg font-bold text-primary">{selectedHistory.year}</span>
                </div>

                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="닫기"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* 모달 본문 - 게시글 스타일 */}
            <article className="px-6 py-8 sm:px-10 sm:py-10" itemScope itemType="https://schema.org/Article">
              {/* 제목 */}
              <h1
                id="modal-title"
                className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-6"
                itemProp="headline"
              >
                {selectedHistory.title}
              </h1>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span itemProp="contentLocation">파주시 법원읍 초리골</span>
                </span>
                {selectedHistory.viewCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} />
                    {selectedHistory.viewCount.toLocaleString()}회 조회
                  </span>
                )}
              </div>

              {/* 본문 콘텐츠 */}
              <div
                className="prose prose-lg max-w-none text-foreground/90 leading-relaxed"
                itemProp="articleBody"
              >
                {/* 본문을 문단으로 분리하여 표시 */}
                {selectedHistory.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-6 text-base sm:text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* 출처 섹션 - AI 친화적 구조화 */}
              {selectedHistory.source && (
                <aside className="mt-10 p-6 bg-muted/50 rounded-xl border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BookOpen size={16} />
                    참고 자료 및 출처
                  </h3>
                  <div className="space-y-2" itemProp="citation">
                    {selectedHistory.source.split(',').map((src, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{src.trim()}</span>
                      </div>
                    ))}
                    {selectedHistory.sourceUrl && (
                      <a
                        href={selectedHistory.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
                        itemProp="url"
                      >
                        <ExternalLink size={14} />
                        원문 보기
                      </a>
                    )}
                  </div>
                </aside>
              )}

              {/* SEO용 숨겨진 메타데이터 */}
              <meta itemProp="datePublished" content={selectedHistory.year} />
              <meta itemProp="author" content="초호펜션" />
              <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" className="hidden">
                <meta itemProp="name" content="초호펜션" />
                <meta itemProp="url" content="https://www.chorigol.co.kr" />
              </div>
            </article>

            {/* 모달 푸터 - 네비게이션 */}
            {/* 모바일: 하단 고정 3등분 버튼 */}
            <div className="md:hidden sticky bottom-0 bg-white border-t border-border">
              <div className="grid grid-cols-3 divide-x divide-border">
                <button
                  onClick={() => navigateHistory('prev')}
                  className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <ChevronLeft size={20} />
                  <span>이전</span>
                </button>
                <button
                  onClick={closeModal}
                  className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <X size={20} />
                  <span>닫기</span>
                </button>
                <button
                  onClick={() => navigateHistory('next')}
                  className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <span>다음</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            {/* PC: 기존 스타일 */}
            <div className="hidden md:block sticky bottom-0 bg-white border-t border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateHistory('prev')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} />
                  이전 기록
                </button>

                <span className="text-xs text-muted-foreground">
                  ← → 키로 이동 | ESC로 닫기
                </span>

                <button
                  onClick={() => navigateHistory('next')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  다음 기록
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
