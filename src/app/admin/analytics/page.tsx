'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 날짜 유틸리티 함수
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// 기간 프리셋 정의
type PeriodPreset = {
  label: string;
  value: string;
  getRange: () => { startDate: string; endDate: string; days?: number };
};

function getPeriodPresets(): PeriodPreset[] {
  const today = new Date();
  const formatDate = formatDateToString;

  return [
    {
      label: '7일',
      value: '7days',
      getRange: () => ({ days: 7, startDate: '', endDate: '' }),
    },
    {
      label: '30일',
      value: '30days',
      getRange: () => ({ days: 30, startDate: '', endDate: '' }),
    },
    {
      label: '90일',
      value: '90days',
      getRange: () => ({ days: 90, startDate: '', endDate: '' }),
    },
    {
      label: '이번 주',
      value: 'this-week',
      getRange: () => {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        return { startDate: formatDate(start), endDate: formatDate(today) };
      },
    },
    {
      label: '지난 주',
      value: 'last-week',
      getRange: () => {
        const end = new Date(today);
        end.setDate(today.getDate() - today.getDay() - 1);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        return { startDate: formatDate(start), endDate: formatDate(end) };
      },
    },
    {
      label: '이번 달',
      value: 'this-month',
      getRange: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: formatDate(start), endDate: formatDate(today) };
      },
    },
    {
      label: '지난 달',
      value: 'last-month',
      getRange: () => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: formatDate(start), endDate: formatDate(end) };
      },
    },
    {
      label: '3개월',
      value: '3months',
      getRange: () => ({ days: 90, startDate: '', endDate: '' }),
    },
    {
      label: '6개월',
      value: '6months',
      getRange: () => ({ days: 180, startDate: '', endDate: '' }),
    },
    {
      label: '1년',
      value: '1year',
      getRange: () => ({ days: 365, startDate: '', endDate: '' }),
    },
  ];
}

interface AnalyticsSummary {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

interface DailyData {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
}

interface PageData {
  path: string;
  title: string;
  views: number;
}

interface TrafficSource {
  source: string;
  users: number;
  sessions: number;
}

interface SourceMedium {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

interface ChannelGroup {
  channel: string;
  users: number;
  sessions: number;
  pageViews: number;
}

interface LandingPage {
  page: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

interface DeviceData {
  device: string;
  users: number;
  sessions: number;
  pageViews: number;
}

interface CityData {
  city: string;
  users: number;
  sessions: number;
}

interface BrowserData {
  browser: string;
  users: number;
  sessions: number;
}

interface CountryData {
  country: string;
  users: number;
  sessions: number;
}

interface OSData {
  os: string;
  users: number;
  sessions: number;
}

interface UserTypeData {
  userType: string;
  users: number;
  sessions: number;
}

interface HourlyData {
  hour: string;
  users: number;
  sessions: number;
}

interface DayOfWeekData {
  dayOfWeek: string;
  users: number;
  sessions: number;
}

interface ReferrerData {
  referrer: string;
  users: number;
  sessions: number;
}

interface SearchKeyword {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PeriodKeywords {
  thisWeek: SearchKeyword[];
  lastWeek: SearchKeyword[];
  thisMonth: SearchKeyword[];
  lastMonth: SearchKeyword[];
}

interface SearchPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary | null;
  daily: DailyData[];
  pages: PageData[];
  sources: TrafficSource[];
  realtimeUsers: number;
  sourceMedium: SourceMedium[];
  channels: ChannelGroup[];
  landingPages: LandingPage[];
  devices: DeviceData[];
  cities: CityData[];
  browsers: BrowserData[];
  countries: CountryData[];
  osList: OSData[];
  userTypes: UserTypeData[];
  hourly: HourlyData[];
  dayOfWeek: DayOfWeekData[];
  referrers: ReferrerData[];
  searchKeywords: SearchKeyword[];
  searchPages: SearchPage[];
}

// 채널 색상 매핑
const channelColors: Record<string, string> = {
  'Organic Search': 'bg-emerald-600',
  Direct: 'bg-blue-500',
  Referral: 'bg-purple-500',
  'Organic Social': 'bg-pink-500',
  'Paid Search': 'bg-orange-500',
  Display: 'bg-yellow-500',
  Email: 'bg-teal-500',
  Affiliates: 'bg-indigo-500',
  Other: 'bg-gray-500',
};

// 기기 아이콘
const deviceIcons: Record<string, string> = {
  desktop: '🖥️',
  mobile: '📱',
  tablet: '📟',
};

// 누적 데이터 섹션 컴포넌트
function CumulativeDataSection({ daily }: { daily: DailyData[] }) {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (!daily || daily.length === 0) {
    return null;
  }

  // 주별 데이터 계산
  const getWeeklyData = () => {
    const weeklyMap: Record<string, { users: number; sessions: number; pageViews: number; startDate: string; endDate: string }> = {};

    daily.forEach((d) => {
      try {
        const [year, month, day] = d.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return;

        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

        if (!weeklyMap[weekKey]) {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weeklyMap[weekKey] = {
            users: 0,
            sessions: 0,
            pageViews: 0,
            startDate: weekKey,
            endDate: `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`,
          };
        }
        weeklyMap[weekKey].users += d.users;
        weeklyMap[weekKey].sessions += d.sessions;
        weeklyMap[weekKey].pageViews += d.pageViews;
      } catch {
        // Skip invalid dates
      }
    });

    return Object.entries(weeklyMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, data]) => data);
  };

  // 월별 데이터 계산
  const getMonthlyData = () => {
    const monthlyMap: Record<string, { users: number; sessions: number; pageViews: number; label: string }> = {};

    daily.forEach((d) => {
      const monthKey = d.date.substring(0, 7);
      const [year, month] = monthKey.split('-');

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          users: 0,
          sessions: 0,
          pageViews: 0,
          label: `${year}년 ${parseInt(month)}월`,
        };
      }
      monthlyMap[monthKey].users += d.users;
      monthlyMap[monthKey].sessions += d.sessions;
      monthlyMap[monthKey].pageViews += d.pageViews;
    });

    return Object.entries(monthlyMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, data]) => data);
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  // 전체 합계
  const totals = daily.reduce(
    (acc, d) => ({
      users: acc.users + d.users,
      sessions: acc.sessions + d.sessions,
      pageViews: acc.pageViews + d.pageViews,
    }),
    { users: 0, sessions: 0, pageViews: 0 }
  );

  const formatDateShort = (dateStr: string) => {
    const [, month, day] = dateStr.split('-');
    return `${parseInt(month)}/${parseInt(day)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📈</span> 누적 데이터
          </CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'daily'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              일별
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              주별
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              월별
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 전체 합계 */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-emerald-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500">총 방문자</p>
            <p className="text-xl font-bold text-emerald-700">{totals.users.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">총 세션</p>
            <p className="text-xl font-bold text-emerald-700">{totals.sessions.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">총 페이지뷰</p>
            <p className="text-xl font-bold text-emerald-700">{totals.pageViews.toLocaleString()}</p>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-600">기간</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">방문자</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">세션</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">페이지뷰</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {viewMode === 'daily' &&
                [...daily].sort((a, b) => b.date.localeCompare(a.date)).map((d, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-3">{d.date}</td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-700">
                      {d.users.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">{d.sessions.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{d.pageViews.toLocaleString()}</td>
                  </tr>
                ))}
              {viewMode === 'weekly' &&
                weeklyData.map((w, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span className="font-medium">{formatDateShort(w.startDate)}</span>
                      <span className="text-gray-400 mx-1">~</span>
                      <span className="font-medium">{formatDateShort(w.endDate)}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-700">
                      {w.users.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">{w.sessions.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{w.pageViews.toLocaleString()}</td>
                  </tr>
                ))}
              {viewMode === 'monthly' &&
                monthlyData.map((m, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{m.label}</td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-700">
                      {m.users.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">{m.sessions.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{m.pageViews.toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// 달력 컴포넌트
function DatePickerPopup({
  isOpen,
  onClose,
  startDate,
  endDate,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
}) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (localStart && localEnd) {
      onApply(localStart, localEnd);
      onClose();
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[320px]"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">시작일</label>
            <input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">종료일</label>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              max={formatDateToString(new Date())}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            disabled={!localStart || !localEnd}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('30days');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'keywords' | 'comparison'>('overview');

  const periodPresets = getPeriodPresets();

  // 기간 변경 시 데이터 재조회
  useEffect(() => {
    fetchAnalytics();
  }, [days, startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/analytics';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else {
        url += `?days=${days}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 프리셋 선택 핸들러
  const handlePresetSelect = (preset: PeriodPreset) => {
    setSelectedPreset(preset.value);
    const range = preset.getRange();
    if (range.days) {
      setDays(range.days);
      setStartDate('');
      setEndDate('');
    } else if (range.startDate && range.endDate) {
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      setDays(0);
    }
  };

  // 달력에서 날짜 선택 시
  const handleDatePickerApply = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedPreset('custom');
    setDays(0);
  };

  // 현재 선택된 기간 표시 텍스트
  const getSelectedPeriodLabel = () => {
    if (selectedPreset === 'custom' && startDate && endDate) {
      return `${startDate} ~ ${endDate}`;
    }
    const preset = periodPresets.find(p => p.value === selectedPreset);
    return preset?.label || '30일';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${month}/${day}`;
  };

  // 채널 한글명
  const getChannelKorean = (channel: string) => {
    const map: Record<string, string> = {
      'Organic Search': '자연 검색',
      Direct: '직접 방문',
      Referral: '외부 링크',
      'Organic Social': '소셜 미디어',
      'Paid Search': '유료 검색',
      Display: '디스플레이 광고',
      Email: '이메일',
      Affiliates: '제휴',
      Unassigned: '미분류',
    };
    return map[channel] || channel;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">방문자 통계</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">방문자 통계</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center text-red-500">
            <p className="text-lg font-medium">데이터를 불러오지 못했습니다</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">방문자 통계</h1>
          <div className="flex items-center gap-2">
            {/* Tab 버튼 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white shadow text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('traffic')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'traffic'
                    ? 'bg-white shadow text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                유입 분석
              </button>
              <button
                onClick={() => setActiveTab('keywords')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'keywords'
                    ? 'bg-white shadow text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                검색어
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'comparison'
                    ? 'bg-white shadow text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                방문분석
              </button>
            </div>
            <button
              onClick={fetchAnalytics}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              title="새로고침"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 기간 선택 UI */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 프리셋 버튼들 */}
          <div className="flex flex-wrap gap-1">
            {periodPresets.slice(0, 7).map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  selectedPreset === preset.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 더 보기 드롭다운 */}
          <div className="relative">
            <select
              value={['3months', '6months', '1year'].includes(selectedPreset) ? selectedPreset : ''}
              onChange={(e) => {
                const preset = periodPresets.find(p => p.value === e.target.value);
                if (preset) handlePresetSelect(preset);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="" disabled>더 보기</option>
              <option value="3months">3개월</option>
              <option value="6months">6개월</option>
              <option value="1year">1년</option>
            </select>
          </div>

          {/* 구분선 */}
          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          {/* 달력 버튼 */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors ${
                selectedPreset === 'custom'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {selectedPreset === 'custom' ? getSelectedPeriodLabel() : '날짜 선택'}
            </button>
            <DatePickerPopup
              isOpen={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              startDate={startDate || formatDateToString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))}
              endDate={endDate || formatDateToString(new Date())}
              onApply={handleDatePickerApply}
            />
          </div>

          {/* 현재 선택된 기간 표시 */}
          <span className="text-sm text-gray-500 ml-2">
            {loading ? '로딩 중...' : `조회 기간: ${getSelectedPeriodLabel()}`}
          </span>
        </div>
      </div>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <>
          {/* Realtime Users */}
          {data?.realtimeUsers !== undefined && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-lg">현재 접속자</span>
                <span className="text-3xl font-bold ml-auto">
                  {data.realtimeUsers}명
                </span>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">총 방문자</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.totalUsers.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">신규 방문자</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {summary.newUsers.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">세션 수</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.sessions.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">페이지뷰</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {summary.pageViews.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">평균 체류시간</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {formatDuration(summary.avgSessionDuration)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">이탈률</p>
                  <p className="text-2xl font-bold text-red-500">
                    {summary.bounceRate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">일별 방문자 추이</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.daily && data.daily.length > 0 ? (
                  <div className="space-y-2">
                    <div className="h-48 flex items-end gap-1">
                      {data.daily.slice(-14).map((day, index) => {
                        const maxUsers = Math.max(
                          ...data.daily.slice(-14).map((d) => d.users)
                        );
                        const height =
                          maxUsers > 0 ? (day.users / maxUsers) * 100 : 0;
                        return (
                          <div
                            key={index}
                            className="flex-1 bg-emerald-600 rounded-t hover:bg-emerald-700 transition-colors relative group"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                              {formatDate(day.date)}: {day.users}명
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {formatDate(
                          data.daily[Math.max(0, data.daily.length - 14)]?.date
                        )}
                      </span>
                      <span>
                        {formatDate(data.daily[data.daily.length - 1]?.date)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">트래픽 소스</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.sources && data.sources.length > 0 ? (
                  <div className="space-y-3">
                    {data.sources.slice(0, 5).map((source, index) => {
                      const maxSessions = Math.max(
                        ...data.sources.map((s) => s.sessions)
                      );
                      const width =
                        maxSessions > 0
                          ? (source.sessions / maxSessions) * 100
                          : 0;
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {source.source || '(direct)'}
                            </span>
                            <span className="text-gray-500">
                              {source.sessions} 세션
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">인기 페이지</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.pages && data.pages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">
                          페이지
                        </th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">
                          조회수
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map((page, index) => (
                        <tr
                          key={index}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-3 px-3">
                            <p className="font-medium text-sm truncate max-w-xs">
                              {page.title || page.path}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {page.path}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-semibold text-emerald-700">
                              {page.views.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  데이터가 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* 누적 데이터 섹션 */}
          <CumulativeDataSection daily={data?.daily || []} />

          {/* 하단 여백 */}
          <div className="h-[300px]" />
        </>
      )}

      {/* 유입 분석 탭 */}
      {activeTab === 'traffic' && (
        <>
          {/* 채널 그룹 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📊</span> 트래픽 채널
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.channels && data.channels.length > 0 ? (
                <div className="space-y-4">
                  {/* 채널 비율 바 */}
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    {data.channels.map((channel, index) => {
                      const totalSessions = data.channels.reduce(
                        (sum, c) => sum + c.sessions,
                        0
                      );
                      const width =
                        totalSessions > 0
                          ? (channel.sessions / totalSessions) * 100
                          : 0;
                      return (
                        <div
                          key={index}
                          className={`${channelColors[channel.channel] || 'bg-gray-400'} relative group`}
                          style={{ width: `${width}%` }}
                          title={`${getChannelKorean(channel.channel)}: ${channel.sessions}`}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                            {getChannelKorean(channel.channel)}:{' '}
                            {channel.sessions} ({width.toFixed(1)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* 채널 목록 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {data.channels.map((channel, index) => {
                      const totalSessions = data.channels.reduce(
                        (sum, c) => sum + c.sessions,
                        0
                      );
                      const percent =
                        totalSessions > 0
                          ? (channel.sessions / totalSessions) * 100
                          : 0;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${channelColors[channel.channel] || 'bg-gray-400'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {getChannelKorean(channel.channel)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {channel.sessions}명 ({percent.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  데이터가 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* 소스/매체 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🔗</span> 유입 소스 / 매체
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.sourceMedium && data.sourceMedium.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">
                          소스 / 매체
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          사용자
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          세션
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          이탈률
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sourceMedium.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3">
                            <span className="font-medium text-emerald-700">
                              {item.source}
                            </span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-gray-600">{item.medium}</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {item.users.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {item.sessions.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-500">
                            {item.bounceRate.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  데이터가 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* 랜딩 페이지 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🚪</span> 랜딩 페이지 (첫 진입)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.landingPages && data.landingPages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">
                          페이지
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          세션
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          사용자
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          이탈률
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.landingPages.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3">
                            <span className="font-medium truncate block max-w-xs">
                              {item.page}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-emerald-700">
                            {item.sessions.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {item.users.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-500">
                            {item.bounceRate.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  데이터가 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* 기기, 지역, 브라우저 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 기기별 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📱</span> 기기
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.devices && data.devices.length > 0 ? (
                  <div className="space-y-3">
                    {data.devices.map((device, index) => {
                      const total = data.devices.reduce(
                        (sum, d) => sum + d.sessions,
                        0
                      );
                      const percent =
                        total > 0 ? (device.sessions / total) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-2xl">
                            {deviceIcons[device.device] || '❓'}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium capitalize">
                                {device.device}
                              </span>
                              <span className="text-gray-500">
                                {percent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 도시별 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📍</span> 지역
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.cities && data.cities.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data.cities.slice(0, 10).map((city, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm py-1 border-b last:border-0"
                      >
                        <span className="font-medium">
                          {city.city === '(not set)' ? '알 수 없음' : city.city}
                        </span>
                        <span className="text-gray-500">{city.sessions}명</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 브라우저별 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🌐</span> 브라우저
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.browsers && data.browsers.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data.browsers.map((browser, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm py-1 border-b last:border-0"
                      >
                        <span className="font-medium">{browser.browser}</span>
                        <span className="text-gray-500">
                          {browser.sessions}명
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 추가 분석 - 운영체제, 국가, 신규/재방문 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 운영체제별 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>💻</span> 운영체제
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.osList && data.osList.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data.osList.map((os, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm py-1 border-b last:border-0"
                      >
                        <span className="font-medium">{os.os}</span>
                        <span className="text-gray-500">{os.sessions}명</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 국가별 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🌍</span> 국가
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.countries && data.countries.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data.countries.slice(0, 10).map((country, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm py-1 border-b last:border-0"
                      >
                        <span className="font-medium">
                          {country.country === '(not set)'
                            ? '알 수 없음'
                            : country.country}
                        </span>
                        <span className="text-gray-500">
                          {country.sessions}명
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 신규 vs 재방문 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>👥</span> 신규 vs 재방문
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.userTypes && data.userTypes.length > 0 ? (
                  <div className="space-y-3">
                    {data.userTypes.map((ut, index) => {
                      const total = data.userTypes.reduce(
                        (sum, u) => sum + u.sessions,
                        0
                      );
                      const percent =
                        total > 0 ? (ut.sessions / total) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-2xl">
                            {ut.userType === 'new' ? '🆕' : '🔄'}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">
                                {ut.userType === 'new' ? '신규 방문' : '재방문'}
                              </span>
                              <span className="text-gray-500">
                                {percent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${ut.userType === 'new' ? 'bg-blue-500' : 'bg-amber-500'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 시간대별/요일별 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 시간대별 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>⏰</span> 시간대별 방문
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.hourly && data.hourly.length > 0 ? (
                  <div className="space-y-2">
                    <div className="h-32 flex items-end gap-0.5">
                      {Array.from({ length: 24 }, (_, i) => {
                        const hourData = data.hourly.find(
                          (h) => parseInt(h.hour) === i
                        );
                        const sessions = hourData?.sessions || 0;
                        const maxSessions = Math.max(
                          ...data.hourly.map((h) => h.sessions)
                        );
                        const height =
                          maxSessions > 0 ? (sessions / maxSessions) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-blue-400 hover:bg-blue-500 transition-colors relative group rounded-t"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                              {i}시: {sessions}명
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0시</span>
                      <span>6시</span>
                      <span>12시</span>
                      <span>18시</span>
                      <span>24시</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 요일별 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📅</span> 요일별 방문
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.dayOfWeek && data.dayOfWeek.length > 0 ? (
                  <div className="space-y-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map(
                      (dayName, i) => {
                        const dayData = data.dayOfWeek.find(
                          (d) => parseInt(d.dayOfWeek) === i
                        );
                        const sessions = dayData?.sessions || 0;
                        const maxSessions = Math.max(
                          ...data.dayOfWeek.map((d) => d.sessions)
                        );
                        const width =
                          maxSessions > 0 ? (sessions / maxSessions) * 100 : 0;
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-6 text-sm font-medium text-gray-600">
                              {dayName}
                            </span>
                            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${i === 0 || i === 6 ? 'bg-red-400' : 'bg-emerald-500'}`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <span className="w-12 text-sm text-gray-500 text-right">
                              {sessions}명
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 참조 URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>↩️</span> 유입 경로 (Referrer)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.referrers && data.referrers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">
                          참조 URL
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          사용자
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          세션
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.referrers.slice(0, 10).map((ref, index) => (
                        <tr
                          key={index}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3">
                            <span className="font-medium text-blue-600 truncate block max-w-md">
                              {ref.referrer === '(not set)'
                                ? '직접 방문'
                                : ref.referrer}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {ref.users.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {ref.sessions.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  데이터가 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 검색어 탭 */}
      {activeTab === 'keywords' && (
        <>
          {/* 기간별 검색어 Top5 */}
          <PeriodKeywordsSection />

          {/* 네이버 검색광고 키워드 */}
          <NaverKeywordsSection />

          {/* 검색어 순위 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🔍</span> 유입 검색어 (Search Console)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.searchKeywords && data.searchKeywords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">
                          순위
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">
                          검색어
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          클릭수
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          노출수
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          CTR
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          평균 순위
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.searchKeywords.map((keyword, index) => (
                        <tr
                          key={index}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index < 3
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-medium text-gray-900">
                              {keyword.query}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">
                            {keyword.clicks.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600">
                            {keyword.impressions.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`${keyword.ctr >= 5 ? 'text-emerald-600' : keyword.ctr >= 2 ? 'text-amber-600' : 'text-gray-500'}`}
                            >
                              {keyword.ctr.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`font-medium ${keyword.position <= 3 ? 'text-emerald-600' : keyword.position <= 10 ? 'text-blue-600' : 'text-gray-500'}`}
                            >
                              {keyword.position.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-2">검색어 데이터가 없습니다</p>
                  <p className="text-xs text-gray-400">
                    Search Console 연동을 확인해주세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 검색 유입 페이지 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📄</span> 검색 유입 페이지
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.searchPages && data.searchPages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">
                          페이지
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          클릭수
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          노출수
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          CTR
                        </th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">
                          평균 순위
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.searchPages.map((page, index) => {
                        // URL에서 경로만 추출
                        let displayPath = page.page;
                        try {
                          const url = new URL(page.page);
                          displayPath = url.pathname || '/';
                        } catch {
                          displayPath = page.page;
                        }
                        return (
                          <tr
                            key={index}
                            className="border-b last:border-0 hover:bg-gray-50"
                          >
                            <td className="py-2 px-3">
                              <span
                                className="font-medium text-blue-600 truncate block max-w-sm"
                                title={page.page}
                              >
                                {displayPath}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">
                              {page.clicks.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-600">
                              {page.impressions.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span
                                className={`${page.ctr >= 5 ? 'text-emerald-600' : page.ctr >= 2 ? 'text-amber-600' : 'text-gray-500'}`}
                              >
                                {page.ctr.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span
                                className={`font-medium ${page.position <= 3 ? 'text-emerald-600' : page.position <= 10 ? 'text-blue-600' : 'text-gray-500'}`}
                              >
                                {page.position.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  데이터가 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* 검색어 분석 가이드 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">
                    검색어 분석 가이드
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      <strong>클릭수</strong>: 해당 검색어로 사이트에 방문한
                      횟수
                    </li>
                    <li>
                      <strong>노출수</strong>: 검색 결과에 사이트가 표시된 횟수
                    </li>
                    <li>
                      <strong>CTR</strong>: 클릭률 (클릭수/노출수 × 100)
                    </li>
                    <li>
                      <strong>평균 순위</strong>: 검색 결과에서의 평균 위치 (1에
                      가까울수록 좋음)
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">
                    * 데이터는 Google Search Console 기준이며, 2-3일 지연될 수
                    있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 방문분석 탭 */}
      {activeTab === 'comparison' && (
        <ComparisonTab />
      )}
    </div>
  );
}

// 방문분석 탭 컴포넌트
function ComparisonTab() {
  const [comparisonType, setComparisonType] = useState<'last-week' | 'last-month' | 'last-year' | 'custom'>('last-week');
  const [comparisonData, setComparisonData] = useState<{
    current: {
      totalUsers: number;
      newUsers: number;
      sessions: number;
      pageViews: number;
      avgSessionDuration: number;
      bounceRate: number;
    };
    previous: {
      totalUsers: number;
      newUsers: number;
      sessions: number;
      pageViews: number;
      avgSessionDuration: number;
      bounceRate: number;
    };
    changes: {
      totalUsers: number;
      newUsers: number;
      sessions: number;
      pageViews: number;
      avgSessionDuration: number;
      bounceRate: number;
    };
    currentDaily: DailyData[];
    previousDaily: DailyData[];
    currentChannels: ChannelGroup[];
    previousChannels: ChannelGroup[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 비교 기간 계산
  const getComparisonDates = () => {
    const today = new Date();
    const formatDate = formatDateToString;

    if (comparisonType === 'last-week') {
      // 이번 주 vs 지난 주
      const thisWeekEnd = new Date(today);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

      return {
        currentStart: formatDate(thisWeekStart),
        currentEnd: formatDate(thisWeekEnd),
        previousStart: formatDate(lastWeekStart),
        previousEnd: formatDate(lastWeekEnd),
      };
    } else if (comparisonType === 'last-month') {
      // 이번 달 vs 지난 달
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      return {
        currentStart: formatDate(thisMonthStart),
        currentEnd: formatDate(today),
        previousStart: formatDate(lastMonthStart),
        previousEnd: formatDate(lastMonthEnd),
      };
    } else if (comparisonType === 'last-year') {
      // 올해 vs 작년 (최근 30일 기준)
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const lastYearEnd = new Date(today);
      lastYearEnd.setFullYear(today.getFullYear() - 1);
      const lastYearStart = new Date(thirtyDaysAgo);
      lastYearStart.setFullYear(thirtyDaysAgo.getFullYear() - 1);

      return {
        currentStart: formatDate(thirtyDaysAgo),
        currentEnd: formatDate(today),
        previousStart: formatDate(lastYearStart),
        previousEnd: formatDate(lastYearEnd),
      };
    }

    // 기본값 (지난 주 대비)
    return getComparisonDates();
  };

  // 데이터 조회
  useEffect(() => {
    fetchComparisonData();
  }, [comparisonType]);

  const fetchComparisonData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dates = getComparisonDates();
      const url = `/api/analytics?type=comparison&currentStart=${dates.currentStart}&currentEnd=${dates.currentEnd}&previousStart=${dates.previousStart}&previousEnd=${dates.previousEnd}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch comparison data');
      const result = await response.json();
      setComparisonData(result.comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 채널 한글명
  const getChannelKorean = (channel: string) => {
    const map: Record<string, string> = {
      'Organic Search': '자연 검색',
      Direct: '직접 방문',
      Referral: '외부 링크',
      'Organic Social': '소셜 미디어',
      'Paid Search': '유료 검색',
      Display: '디스플레이 광고',
      Email: '이메일',
      Affiliates: '제휴',
      Unassigned: '미분류',
    };
    return map[channel] || channel;
  };

  // 비교 기간 라벨
  const getComparisonLabel = () => {
    switch (comparisonType) {
      case 'last-week':
        return '지난 주 대비';
      case 'last-month':
        return '지난 달 대비';
      case 'last-year':
        return '전년 동기 대비';
      default:
        return '사용자 지정';
    }
  };

  // 시간 포맷
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">비교 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-red-500">
            <p className="text-lg font-medium">데이터를 불러오지 못했습니다</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={fetchComparisonData}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
            >
              다시 시도
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* 비교 기간 선택 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-600">비교 기간:</span>
            <div className="flex gap-2">
              {[
                { value: 'last-week', label: '지난 주 대비' },
                { value: 'last-month', label: '지난 달 대비' },
                { value: 'last-year', label: '전년 동기 대비' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setComparisonType(option.value as typeof comparisonType)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    comparisonType === option.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {comparisonData && (
        <>
          {/* 비교 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 방문자 */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">방문자</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comparisonData.current.totalUsers.toLocaleString()}
                </p>
                <div className={`flex items-center gap-1 text-sm ${
                  comparisonData.changes.totalUsers >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  <span>{comparisonData.changes.totalUsers >= 0 ? '▲' : '▼'}</span>
                  <span>{Math.abs(comparisonData.changes.totalUsers).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  이전: {comparisonData.previous.totalUsers.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* 신규 방문자 */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">신규 방문자</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comparisonData.current.newUsers.toLocaleString()}
                </p>
                <div className={`flex items-center gap-1 text-sm ${
                  comparisonData.changes.newUsers >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  <span>{comparisonData.changes.newUsers >= 0 ? '▲' : '▼'}</span>
                  <span>{Math.abs(comparisonData.changes.newUsers).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  이전: {comparisonData.previous.newUsers.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* 세션 */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">세션</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comparisonData.current.sessions.toLocaleString()}
                </p>
                <div className={`flex items-center gap-1 text-sm ${
                  comparisonData.changes.sessions >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  <span>{comparisonData.changes.sessions >= 0 ? '▲' : '▼'}</span>
                  <span>{Math.abs(comparisonData.changes.sessions).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  이전: {comparisonData.previous.sessions.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* 페이지뷰 */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">페이지뷰</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comparisonData.current.pageViews.toLocaleString()}
                </p>
                <div className={`flex items-center gap-1 text-sm ${
                  comparisonData.changes.pageViews >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  <span>{comparisonData.changes.pageViews >= 0 ? '▲' : '▼'}</span>
                  <span>{Math.abs(comparisonData.changes.pageViews).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  이전: {comparisonData.previous.pageViews.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* 체류시간 */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">평균 체류시간</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(comparisonData.current.avgSessionDuration)}
                </p>
                <div className={`flex items-center gap-1 text-sm ${
                  comparisonData.changes.avgSessionDuration >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  <span>{comparisonData.changes.avgSessionDuration >= 0 ? '▲' : '▼'}</span>
                  <span>{Math.abs(comparisonData.changes.avgSessionDuration).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  이전: {formatDuration(comparisonData.previous.avgSessionDuration)}
                </p>
              </CardContent>
            </Card>

            {/* 이탈률 */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">이탈률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comparisonData.current.bounceRate.toFixed(1)}%
                </p>
                <div className={`flex items-center gap-1 text-sm ${
                  comparisonData.changes.bounceRate <= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  <span>{comparisonData.changes.bounceRate >= 0 ? '▲' : '▼'}</span>
                  <span>{Math.abs(comparisonData.changes.bounceRate).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  이전: {comparisonData.previous.bounceRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 트렌드 비교 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📈</span> 트렌드 비교
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comparisonData.currentDaily.length > 0 ? (
                <div className="space-y-2">
                  <div className="h-48 flex items-end gap-1">
                    {comparisonData.currentDaily.slice(-14).map((day, index) => {
                      const maxUsers = Math.max(
                        ...comparisonData.currentDaily.slice(-14).map((d) => d.users),
                        ...comparisonData.previousDaily.slice(-14).map((d) => d.users)
                      );
                      const currentHeight = maxUsers > 0 ? (day.users / maxUsers) * 100 : 0;
                      const prevDay = comparisonData.previousDaily[index];
                      const prevHeight = prevDay && maxUsers > 0 ? (prevDay.users / maxUsers) * 100 : 0;

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full flex gap-0.5">
                            {/* 이전 기간 바 */}
                            <div
                              className="flex-1 bg-gray-300 rounded-t relative group"
                              style={{ height: `${Math.max(prevHeight, 2)}%` }}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                이전: {prevDay?.users || 0}명
                              </div>
                            </div>
                            {/* 현재 기간 바 */}
                            <div
                              className="flex-1 bg-emerald-600 rounded-t relative group"
                              style={{ height: `${Math.max(currentHeight, 2)}%` }}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                현재: {day.users}명
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span className="text-gray-600">이전 기간</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                      <span className="text-gray-600">현재 기간</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">데이터가 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* 채널별 변화 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📊</span> 채널별 변화
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comparisonData.currentChannels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">채널</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">현재 세션</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">이전 세션</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">변화</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.currentChannels.map((channel, index) => {
                        const prevChannel = comparisonData.previousChannels.find(
                          (c) => c.channel === channel.channel
                        );
                        const prevSessions = prevChannel?.sessions || 0;
                        const change = prevSessions > 0
                          ? ((channel.sessions - prevSessions) / prevSessions) * 100
                          : channel.sessions > 0 ? 100 : 0;

                        return (
                          <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-2 px-3 font-medium">
                              {getChannelKorean(channel.channel)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">
                              {channel.sessions.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-500">
                              {prevSessions.toLocaleString()}
                            </td>
                            <td className={`py-2 px-3 text-right font-medium ${
                              change >= 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}>
                              <span>{change >= 0 ? '▲' : '▼'}</span>
                              <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">데이터가 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* 인사이트 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-2">주요 인사이트</p>
                  <ul className="space-y-1 list-disc list-inside">
                    {comparisonData.changes.totalUsers > 0 && (
                      <li className="text-emerald-600">
                        방문자가 {comparisonData.changes.totalUsers.toFixed(1)}% 증가했습니다
                      </li>
                    )}
                    {comparisonData.changes.totalUsers < 0 && (
                      <li className="text-red-500">
                        방문자가 {Math.abs(comparisonData.changes.totalUsers).toFixed(1)}% 감소했습니다
                      </li>
                    )}
                    {comparisonData.changes.avgSessionDuration > 10 && (
                      <li className="text-emerald-600">
                        체류시간이 크게 개선되었습니다 (+{comparisonData.changes.avgSessionDuration.toFixed(1)}%)
                      </li>
                    )}
                    {comparisonData.changes.bounceRate < -5 && (
                      <li className="text-emerald-600">
                        이탈률이 개선되었습니다 ({comparisonData.changes.bounceRate.toFixed(1)}%)
                      </li>
                    )}
                    {comparisonData.changes.bounceRate > 10 && (
                      <li className="text-amber-600">
                        이탈률이 증가했습니다 - 콘텐츠 개선이 필요합니다
                      </li>
                    )}
                    {/* 최고 성장 채널 */}
                    {(() => {
                      let maxGrowth = 0;
                      let maxGrowthChannel = '';
                      comparisonData.currentChannels.forEach((ch) => {
                        const prev = comparisonData.previousChannels.find((p) => p.channel === ch.channel);
                        if (prev && prev.sessions > 0) {
                          const growth = ((ch.sessions - prev.sessions) / prev.sessions) * 100;
                          if (growth > maxGrowth) {
                            maxGrowth = growth;
                            maxGrowthChannel = ch.channel;
                          }
                        }
                      });
                      if (maxGrowth > 20) {
                        return (
                          <li className="text-blue-600">
                            {getChannelKorean(maxGrowthChannel)} 채널이 크게 성장했습니다 (+{maxGrowth.toFixed(1)}%)
                          </li>
                        );
                      }
                      return null;
                    })()}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

// 기간별 검색어 Top5 컴포넌트
function PeriodKeywordsSection() {
  const [data, setData] = useState<PeriodKeywords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeriodKeywords();
  }, []);

  const fetchPeriodKeywords = async () => {
    try {
      const response = await fetch('/api/analytics?type=period-keywords');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching period keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-gray-500">기간별 검색어 로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderKeywordList = (keywords: SearchKeyword[], title: string, bgColor: string, textColor: string) => (
    <div className={`rounded-lg p-4 ${bgColor}`}>
      <h4 className={`font-bold mb-3 ${textColor}`}>{title}</h4>
      {keywords.length > 0 ? (
        <div className="space-y-2">
          {keywords.slice(0, 5).map((kw, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                idx === 1 ? 'bg-gray-300 text-gray-700' :
                idx === 2 ? 'bg-amber-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {idx + 1}
              </span>
              <span className="flex-1 text-sm text-gray-800 truncate">{kw.query}</span>
              <span className="text-xs font-medium text-emerald-600">{kw.clicks}회</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">데이터 없음</p>
      )}
    </div>
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>📊</span> 기간별 유입 검색어 Top 5
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderKeywordList(data?.lastWeek || [], '지난 주', 'bg-blue-50', 'text-blue-700')}
          {renderKeywordList(data?.thisWeek || [], '이번 주', 'bg-emerald-50', 'text-emerald-700')}
          {renderKeywordList(data?.lastMonth || [], '지난 달', 'bg-purple-50', 'text-purple-700')}
          {renderKeywordList(data?.thisMonth || [], '이번 달', 'bg-orange-50', 'text-orange-700')}
        </div>
      </CardContent>
    </Card>
  );
}

// 네이버 검색광고 키워드 컴포넌트
interface NaverKeyword {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  cost: number;
  conversions: number;
}

function NaverKeywordsSection() {
  const [data, setData] = useState<NaverKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNaverKeywords();
  }, []);

  const fetchNaverKeywords = async () => {
    try {
      setLoading(true);
      // 먼저 실시간 동기화 시도
      const response = await fetch('/api/analytics?type=naver-keywords-sync');
      const result = await response.json();
      if (result.keywords && result.keywords.length > 0) {
        setData(result.keywords);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching naver keywords:', err);
      setError('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetchNaverKeywords();
    setSyncing(false);
  };

  // 광고비 포맷
  const formatCost = (cost: number) => {
    if (cost >= 10000) {
      return `${(cost / 10000).toFixed(1)}만원`;
    }
    return `${cost.toLocaleString()}원`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🔎</span> 네이버 검색광고 키워드
            <span className="ml-2 text-gray-500 text-sm font-normal">로딩 중...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🔎</span> 네이버 검색광고 키워드
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">
              이번 달
            </span>
          </CardTitle>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {syncing ? '동기화 중...' : '🔄 새로고침'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-xs text-gray-400">네이버 검색광고 API 연결을 확인해주세요</p>
          </div>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-green-50">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">순위</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">키워드</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">클릭</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">노출</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">CTR</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">평균순위</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">광고비</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 20).map((kw, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index < 3
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-gray-900">{kw.keyword}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-green-700">
                      {kw.clicks.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-600">
                      {kw.impressions.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`${kw.ctr >= 5 ? 'text-green-600' : kw.ctr >= 2 ? 'text-amber-600' : 'text-gray-500'}`}
                      >
                        {kw.ctr.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`font-medium ${kw.avgPosition <= 2 ? 'text-green-600' : kw.avgPosition <= 5 ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {kw.avgPosition.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-600">
                      {formatCost(kw.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 20 && (
              <p className="text-center text-xs text-gray-400 mt-3">
                상위 20개 키워드만 표시됩니다 (전체 {data.length}개)
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">네이버 검색광고 키워드 데이터가 없습니다</p>
            <p className="text-xs text-gray-400">광고 캠페인에 등록된 키워드가 있는지 확인해주세요</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
