/**
 * 캠페인 그룹 매핑 설정
 * AI 검색분석 리포트에서 사용
 */

// 캠페인 그룹 타입
export type CampaignGroup = 'place-personal' | 'place-group' | 'power-content';

// 캠페인 그룹 정보
export interface CampaignGroupInfo {
  id: CampaignGroup;
  name: string;
  description: string;
  campaignIds: string[];
  campaignNames: string[];
}

// 실제 캠페인 ID 매핑
export const CAMPAIGN_IDS = {
  // 플레이스 광고 - 개인
  PLACE_PERSONAL: 'cmp-a001-01-000000004743481', // 초호-개인
  // 플레이스 광고 - 단체
  PLACE_GROUP: 'cmp-a001-01-000000004742841', // 단체
  // 플레이스 광고 - 플레이스#1 (추가)
  PLACE_EXTRA: 'cmp-a001-06-000000009059251', // 플레이스#1
  // 파워컨텐츠
  POWER_CONTENT: 'cmp-a001-03-000000005889812', // 파워컨텐츠_단체
} as const;

// 캠페인 그룹 설정
export const CAMPAIGN_GROUPS: CampaignGroupInfo[] = [
  {
    id: 'place-personal',
    name: '플레이스-개인',
    description: '초호펜션 (개인/가족 대상)',
    campaignIds: [CAMPAIGN_IDS.PLACE_PERSONAL],
    campaignNames: ['초호-개인'],
  },
  {
    id: 'place-group',
    name: '플레이스-단체',
    description: '초호쉼터 (단체/기업 대상)',
    campaignIds: [CAMPAIGN_IDS.PLACE_GROUP, CAMPAIGN_IDS.PLACE_EXTRA],
    campaignNames: ['단체', '플레이스#1'],
  },
  {
    id: 'power-content',
    name: '파워컨텐츠',
    description: '네이버 블로그/컨텐츠 광고',
    campaignIds: [CAMPAIGN_IDS.POWER_CONTENT],
    campaignNames: ['파워컨텐츠_단체'],
  },
];

// 캠페인 ID로 그룹 찾기
export function getCampaignGroup(campaignId: string): CampaignGroup | null {
  for (const group of CAMPAIGN_GROUPS) {
    if (group.campaignIds.includes(campaignId)) {
      return group.id;
    }
  }
  return null;
}

// 캠페인 이름으로 그룹 찾기
export function getCampaignGroupByName(campaignName: string): CampaignGroup | null {
  for (const group of CAMPAIGN_GROUPS) {
    if (group.campaignNames.includes(campaignName)) {
      return group.id;
    }
  }
  return null;
}

// 그룹 ID로 그룹 정보 가져오기
export function getCampaignGroupInfo(groupId: CampaignGroup): CampaignGroupInfo | null {
  return CAMPAIGN_GROUPS.find((g) => g.id === groupId) || null;
}

// 그룹별 캠페인 ID 목록 가져오기
export function getCampaignIdsByGroup(groupId: CampaignGroup): string[] {
  const group = CAMPAIGN_GROUPS.find((g) => g.id === groupId);
  return group?.campaignIds || [];
}

// 탭 설정 (UI용)
export const CAMPAIGN_GROUP_TABS = CAMPAIGN_GROUPS.map((group) => ({
  id: group.id,
  label: group.name,
  description: group.description,
}));
