"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  MousePointer,
  Eye,
  Target,
  Wallet,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  LineChartIcon,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";

// 타입 정의
interface AdSummary {
  totalCost: number;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgCpc: number;
  totalConversions: number;
}

interface DailyStat {
  date: string;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

interface WeeklyStat {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

interface MonthlyStat {
  month: string;
  monthLabel: string;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

interface YearlyStat {
  year: number;
  month: number;
  monthLabel: string;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

interface CampaignStat {
  id: string;
  name: string;
  status: string;
  dailyBudget: number;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

interface KeywordStat {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  cost: number;
  conversions: number;
}

interface MonthComparison {
  current: {
    month: string;
    salesAmt: number;
    clkCnt: number;
    impCnt: number;
    ctr: number;
    cpc: number;
  };
  previous: {
    month: string;
    salesAmt: number;
    clkCnt: number;
    impCnt: number;
    ctr: number;
    cpc: number;
  };
  changes: {
    salesAmt: number;
    clkCnt: number;
    impCnt: number;
    ctr: number;
    cpc: number;
  };
}

type TabType = "summary" | "daily" | "weekly" | "monthly" | "yearly";

// 숫자 포맷팅
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

// 금액 포맷팅
function formatCurrency(num: number): string {
  return num.toLocaleString() + "원";
}

// 변화율 표시 컴포넌트
function ChangeIndicator({
  value,
  isPercent = true,
  isInverse = false,
}: {
  value: number;
  isPercent?: boolean;
  isInverse?: boolean;
}) {
  const isPositive = isInverse ? value < 0 : value > 0;
  const isNegative = isInverse ? value > 0 : value < 0;

  if (Math.abs(value) < 0.01) {
    return (
      <span className="flex items-center gap-1 text-gray-400 text-xs">
        <Minus className="w-3 h-3" />
        변동없음
      </span>
    );
  }

  return (
    <span
      className={`flex items-center gap-1 text-xs ${
        isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-400"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {isPercent ? `${Math.abs(value).toFixed(1)}%` : `${value > 0 ? "+" : ""}${value.toFixed(2)}%p`}
    </span>
  );
}

export default function NaverAdsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 상태
  const [summary, setSummary] = useState<AdSummary | null>(null);
  const [comparison, setComparison] = useState<MonthComparison | null>(null);
  const [bizmoney, setBizmoney] = useState<number | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [yearlyStats, setYearlyStats] = useState<{
    currentYear: YearlyStat[];
    previousYear: YearlyStat[];
  }>({ currentYear: [], previousYear: [] });
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [keywords, setKeywords] = useState<KeywordStat[]>([]);

  // 주간별 데이터를 위한 상태
  const [allWeeklyData, setAllWeeklyData] = useState<WeeklyStat[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  // 일별 데이터 월별 접힘 상태 (별도 관리)
  const [expandedDailyMonths, setExpandedDailyMonths] = useState<Set<string>>(new Set());

  // 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // 날짜 초기화 (2024-01-01 ~ 오늘, 전체 데이터 표시)
  useEffect(() => {
    const today = new Date();
    setDateRange({
      startDate: "2024-01-01",
      endDate: today.toISOString().split("T")[0],
    });
  }, []);

  // 주간별 데이터를 월별로 그룹핑
  const weeklyDataByMonth = useMemo(() => {
    const grouped: Record<string, { monthLabel: string; weeks: WeeklyStat[]; totals: { impCnt: number; clkCnt: number; salesAmt: number } }> = {};

    // 최신순으로 정렬 (weekStart 기준 내림차순)
    const sortedData = [...allWeeklyData].sort((a, b) => b.weekStart.localeCompare(a.weekStart));

    for (const week of sortedData) {
      const yearMonth = week.weekStart.slice(0, 7); // YYYY-MM
      const [year, month] = yearMonth.split("-");
      const monthLabel = `${year}년 ${parseInt(month)}월`;

      if (!grouped[yearMonth]) {
        grouped[yearMonth] = {
          monthLabel,
          weeks: [],
          totals: { impCnt: 0, clkCnt: 0, salesAmt: 0 }
        };
      }
      grouped[yearMonth].weeks.push(week);
      grouped[yearMonth].totals.impCnt += week.impCnt;
      grouped[yearMonth].totals.clkCnt += week.clkCnt;
      grouped[yearMonth].totals.salesAmt += week.salesAmt;
    }

    // 월별로 정렬 (최신순)
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, value]) => ({ key, ...value }));
  }, [allWeeklyData]);

  // 월별 합계 계산
  const monthlyTotals = useMemo(() => {
    return monthlyStats.reduce(
      (acc, stat) => ({
        impCnt: acc.impCnt + stat.impCnt,
        clkCnt: acc.clkCnt + stat.clkCnt,
        salesAmt: acc.salesAmt + stat.salesAmt,
        ccnt: acc.ccnt + stat.ccnt,
      }),
      { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
    );
  }, [monthlyStats]);

  // 연도별 월별 데이터 그룹핑 (소계 포함)
  const monthlyByYear = useMemo(() => {
    const grouped: Record<string, { months: MonthlyStat[]; totals: { salesAmt: number; impCnt: number; clkCnt: number } }> = {};

    for (const stat of monthlyStats) {
      const year = stat.month.slice(0, 4);
      if (!grouped[year]) {
        grouped[year] = { months: [], totals: { salesAmt: 0, impCnt: 0, clkCnt: 0 } };
      }
      grouped[year].months.push(stat);
      grouped[year].totals.salesAmt += stat.salesAmt;
      grouped[year].totals.impCnt += stat.impCnt;
      grouped[year].totals.clkCnt += stat.clkCnt;
    }

    // 연도 내림차순, 월 내림차순 정렬
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, data]) => ({
        year,
        months: [...data.months].sort((a, b) => b.month.localeCompare(a.month)),
        totals: data.totals,
      }));
  }, [monthlyStats]);

  // 연간 합계 계산
  const yearlyTotals = useMemo(() => {
    const currentYearTotals = yearlyStats.currentYear.reduce(
      (acc, stat) => ({
        impCnt: acc.impCnt + stat.impCnt,
        clkCnt: acc.clkCnt + stat.clkCnt,
        salesAmt: acc.salesAmt + stat.salesAmt,
      }),
      { impCnt: 0, clkCnt: 0, salesAmt: 0 }
    );

    const previousYearTotals = yearlyStats.previousYear.reduce(
      (acc, stat) => ({
        impCnt: acc.impCnt + stat.impCnt,
        clkCnt: acc.clkCnt + stat.clkCnt,
        salesAmt: acc.salesAmt + stat.salesAmt,
      }),
      { impCnt: 0, clkCnt: 0, salesAmt: 0 }
    );

    return { currentYear: currentYearTotals, previousYear: previousYearTotals };
  }, [yearlyStats]);

  // 월 접기/펼치기 토글 (주간별)
  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  // 일별 월 접기/펼치기 토글
  const toggleDailyMonth = (monthKey: string) => {
    setExpandedDailyMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  // 일별 데이터를 월별로 그룹핑
  const dailyDataByMonth = useMemo(() => {
    const grouped: Record<string, { monthLabel: string; days: DailyStat[]; totals: { impCnt: number; clkCnt: number; salesAmt: number } }> = {};

    // 최신순으로 정렬 (date 기준 내림차순)
    const sortedData = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));

    for (const day of sortedData) {
      const yearMonth = day.date.slice(0, 7); // YYYY-MM
      const [year, month] = yearMonth.split("-");
      const monthLabel = `${year}년 ${parseInt(month)}월`;

      if (!grouped[yearMonth]) {
        grouped[yearMonth] = {
          monthLabel,
          days: [],
          totals: { impCnt: 0, clkCnt: 0, salesAmt: 0 }
        };
      }
      grouped[yearMonth].days.push(day);
      grouped[yearMonth].totals.impCnt += day.impCnt;
      grouped[yearMonth].totals.clkCnt += day.clkCnt;
      grouped[yearMonth].totals.salesAmt += day.salesAmt;
    }

    // 월별로 정렬 (최신순)
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, value]) => ({ key, ...value }));
  }, [dailyStats]);

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      // 병렬로 모든 데이터 로드
      const [
        summaryRes,
        comparisonRes,
        bizmoneyRes,
        dailyRes,
        weeklyRes,
        monthlyRes,
        yearlyRes,
        campaignsRes,
        keywordsRes,
        allWeeklyRes, // 24년~25년 전체 주간 데이터
      ] = await Promise.all([
        fetch(`/api/analytics?type=naver-summary&${params}`),
        fetch(`/api/analytics?type=naver-comparison`),
        fetch(`/api/analytics?type=naver-bizmoney`),
        fetch(`/api/analytics?type=naver-daily&${params}`),
        fetch(`/api/analytics?type=naver-weekly&weeks=8`),
        fetch(`/api/analytics?type=naver-monthly&months=24`), // 24개월로 확장
        fetch(`/api/analytics?type=naver-yearly`),
        fetch(`/api/analytics?type=naver-campaigns&${params}`),
        fetch(`/api/analytics?type=naver-keywords-sync`),
        fetch(`/api/analytics?type=naver-weekly&weeks=100`), // 약 2년치
      ]);

      // 요약 통계
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
      }

      // 전월 대비
      if (comparisonRes.ok) {
        const data = await comparisonRes.json();
        setComparison(data.comparison);
      }

      // 잔여 예산
      if (bizmoneyRes.ok) {
        const data = await bizmoneyRes.json();
        setBizmoney(data.bizmoney?.bizmoney || null);
      }

      // 일별 통계
      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailyStats(data.daily || []);
      }

      // 주간별 통계 (최근 8주)
      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyStats(data.weekly || []);
      }

      // 전체 주간 데이터 (24년~25년)
      if (allWeeklyRes.ok) {
        const data = await allWeeklyRes.json();
        setAllWeeklyData(data.weekly || []);
      }

      // 월별 통계
      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyStats(data.monthly || []);
      }

      // 연간 통계
      if (yearlyRes.ok) {
        const data = await yearlyRes.json();
        setYearlyStats(data.yearly || { currentYear: [], previousYear: [] });
      }

      // 캠페인 통계
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.campaigns || []);
      }

      // 키워드 통계
      if (keywordsRes.ok) {
        const data = await keywordsRes.json();
        setKeywords(data.keywords || []);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 날짜 범위 변경
  const handleDateChange = (type: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  // 상태 뱃지 컬러
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ELIGIBLE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ELIGIBLE":
        return "진행중";
      case "PAUSED":
        return "일시정지";
      case "SUSPENDED":
        return "중지됨";
      default:
        return status;
    }
  };

  // 탭 목록
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "summary", label: "요약", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "daily", label: "일별", icon: <Calendar className="w-4 h-4" /> },
    { id: "weekly", label: "주간별", icon: <LineChartIcon className="w-4 h-4" /> },
    { id: "monthly", label: "월별", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "yearly", label: "연간", icon: <TrendingDown className="w-4 h-4" /> },
  ];

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">네이버 광고 마케팅 분석</h1>
          <p className="text-sm text-gray-500 mt-1">
            네이버 검색광고 성과를 종합적으로 분석합니다
          </p>
        </div>

        {/* 날짜 선택 (모든 탭에서 표시) */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            max={dateRange.endDate || undefined}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            min={dateRange.startDate || undefined}
            max={new Date().toISOString().split("T")[0]}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        {/* 키워드 분석 페이지 링크 */}
        <a
          href="/admin/naver-ads/keywords"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
        >
          <Search className="w-4 h-4" />
          키워드 효율분석
        </a>
      </div>

      {/* 요약 탭 */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* 잔여 예산 배너 */}
          {bizmoney !== null && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">잔여 광고 예산</p>
                  <p className="text-2xl font-bold">{formatCurrency(bizmoney)}</p>
                </div>
              </div>
              <div className="text-right text-sm text-blue-100">
                네이버 검색광고 비즈머니
              </div>
            </div>
          )}

          {/* 요약 카드 (전월 대비 포함) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Wallet className="w-4 h-4" />
                총 광고비
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatCurrency(summary.totalCost) : "-"}
              </p>
              {comparison && (
                <ChangeIndicator value={comparison.changes.salesAmt} />
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <MousePointer className="w-4 h-4" />
                총 클릭수
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatNumber(summary.totalClicks) : "-"}
              </p>
              {comparison && (
                <ChangeIndicator value={comparison.changes.clkCnt} />
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Eye className="w-4 h-4" />
                총 노출수
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatNumber(summary.totalImpressions) : "-"}
              </p>
              {comparison && (
                <ChangeIndicator value={comparison.changes.impCnt} />
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                평균 CTR
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? summary.avgCtr.toFixed(2) + "%" : "-"}
              </p>
              {comparison && (
                <ChangeIndicator value={comparison.changes.ctr} isPercent={false} />
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Target className="w-4 h-4" />
                평균 CPC
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatCurrency(Math.round(summary.avgCpc)) : "-"}
              </p>
              {comparison && (
                <ChangeIndicator value={comparison.changes.cpc} isInverse />
              )}
            </div>
          </div>

          {/* 캠페인별 실적 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              캠페인별 실적
            </h2>
            {campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">캠페인명</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">상태</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">광고비</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">노출수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">클릭수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">CTR</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{campaign.name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(campaign.salesAmt)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatNumber(campaign.impCnt)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatNumber(campaign.clkCnt)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{campaign.ctr.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(Math.round(campaign.cpc))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                캠페인 데이터가 없습니다
              </div>
            )}
          </div>

          {/* 키워드 TOP 10 (클릭순) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              키워드 TOP 10 (클릭순)
            </h2>
            {keywords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">순위</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">키워드</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">클릭수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">노출수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">CTR</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">광고비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.slice(0, 10).map((kw, index) => (
                      <tr key={kw.keyword} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{kw.keyword}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatNumber(kw.clicks)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatNumber(kw.impressions)}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{kw.ctr.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(kw.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                키워드 데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 일별 탭 */}
      {activeTab === "daily" && (
        <div className="space-y-6">
          {/* 일별 광고비/클릭수 복합 차트 (최근 60일) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              일별 광고 성과 추이 (최근 60일)
            </h2>
            {dailyStats.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={dailyStats.slice(-60).map((stat) => ({
                      date: stat.date.slice(5), // MM-DD 형식
                      광고비: Math.round(stat.salesAmt),
                      클릭수: stat.clkCnt,
                      노출수: Math.round(stat.impCnt / 100), // 스케일 조정
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const v = Number(value) || 0;
                        if (name === "광고비") return formatCurrency(v);
                        if (name === "노출수") return formatNumber(v * 100);
                        return formatNumber(v);
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="광고비" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="클릭수" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="노출수" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <p>데이터가 없습니다</p>
                <p className="text-sm mt-2">백필 스크립트를 실행하여 과거 데이터를 동기화해주세요</p>
                <p className="text-xs mt-1 text-gray-300">node scripts/backfill-naver-ad.js</p>
              </div>
            )}
          </div>

          {/* 일별 데이터 테이블 (월별 접힘/펼침) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              일별 상세 데이터 ({dailyStats.length}일)
            </h2>
            {dailyDataByMonth.length > 0 ? (
              <div className="space-y-2">
                {dailyDataByMonth.map(({ key, monthLabel, days, totals }) => (
                  <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* 월 헤더 (클릭하여 접기/펼치기) */}
                    <button
                      onClick={() => toggleDailyMonth(key)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedDailyMonths.has(key) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-900">{monthLabel}</span>
                        <span className="text-sm text-gray-500">({days.length}일)</span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-right">
                          <span className="text-gray-500">광고비: </span>
                          <span className="font-medium text-gray-900">{formatCurrency(totals.salesAmt)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">노출: </span>
                          <span className="font-medium text-gray-900">{formatNumber(totals.impCnt)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">클릭: </span>
                          <span className="font-medium text-gray-900">{formatNumber(totals.clkCnt)}</span>
                        </div>
                      </div>
                    </button>

                    {/* 일별 데이터 테이블 (펼쳤을 때만 표시) */}
                    {expandedDailyMonths.has(key) && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50/50">
                              <th className="text-left py-3 px-4 font-medium text-gray-600">날짜</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">광고비</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">노출수</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">클릭수</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">CTR</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">CPC</th>
                            </tr>
                          </thead>
                          <tbody>
                            {days.map((stat) => (
                              <tr key={stat.date} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{stat.date}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(stat.salesAmt)}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatNumber(stat.impCnt)}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatNumber(stat.clkCnt)}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{stat.ctr.toFixed(2)}%</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(Math.round(stat.cpc))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 주간별 탭 - 월별 그룹핑 */}
      {activeTab === "weekly" && (
        <div className="space-y-6">
          {/* 최근 8주 차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              주간별 광고 성과 (최근 8주)
            </h2>
            {weeklyStats.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyStats.map((stat) => ({
                      주차: stat.weekLabel,
                      광고비: Math.round(stat.salesAmt / 1000),
                      클릭수: stat.clkCnt,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="주차" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        const v = Number(value) || 0;
                        if (name === "광고비") return formatCurrency(v * 1000);
                        return formatNumber(v);
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="광고비" fill="#10b981" radius={[4, 4, 0, 0]} name="광고비 (천원)" />
                    <Bar yAxisId="right" dataKey="클릭수" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 월별로 그룹핑된 주간 데이터 (접기/펼치기) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              주간별 상세 데이터 (2024년~2025년)
            </h2>
            {weeklyDataByMonth.length > 0 ? (
              <div className="space-y-2">
                {weeklyDataByMonth.map(({ key, monthLabel, weeks, totals }) => (
                  <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* 월 헤더 (클릭하여 접기/펼치기) */}
                    <button
                      onClick={() => toggleMonth(key)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedMonths.has(key) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-900">{monthLabel}</span>
                        <span className="text-sm text-gray-500">({weeks.length}주)</span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-right">
                          <span className="text-gray-500">광고비: </span>
                          <span className="font-medium text-gray-900">{formatCurrency(totals.salesAmt)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">노출: </span>
                          <span className="font-medium text-gray-900">{formatNumber(totals.impCnt)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">클릭: </span>
                          <span className="font-medium text-gray-900">{formatNumber(totals.clkCnt)}</span>
                        </div>
                      </div>
                    </button>

                    {/* 주간 데이터 테이블 (펼쳤을 때만 표시) */}
                    {expandedMonths.has(key) && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50/50">
                              <th className="text-left py-3 px-4 font-medium text-gray-600">주차</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">기간</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">광고비</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">노출수</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">클릭수</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">CTR</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">CPC</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weeks.map((stat) => (
                              <tr key={stat.weekStart} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{stat.weekLabel}</td>
                                <td className="py-3 px-4 text-gray-500 text-xs">{stat.weekStart} ~ {stat.weekEnd}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(stat.salesAmt)}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatNumber(stat.impCnt)}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatNumber(stat.clkCnt)}</td>
                                <td className="py-3 px-4 text-right text-gray-700">{stat.ctr.toFixed(2)}%</td>
                                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(Math.round(stat.cpc))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 월별 탭 */}
      {activeTab === "monthly" && (
        <div className="space-y-6">
          {/* 월별 Area 차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              월별 광고비 추이 (최근 24개월)
            </h2>
            {monthlyStats.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyStats.map((stat) => ({
                      월: stat.month.slice(5) + "월",
                      광고비: Math.round(stat.salesAmt / 10000),
                      클릭수: stat.clkCnt,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="월" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        const v = Number(value) || 0;
                        if (name === "광고비") return formatCurrency(v * 10000);
                        return formatNumber(v);
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="광고비"
                      stroke="#10b981"
                      fill="#10b98133"
                      name="광고비 (만원)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="클릭수"
                      stroke="#3b82f6"
                      fill="#3b82f633"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 월별 합계 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
              <div className="flex items-center gap-2 text-green-700 text-sm mb-2">
                <Wallet className="w-4 h-4" />
                전체 광고비 합계
              </div>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(monthlyTotals.salesAmt)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center gap-2 text-blue-700 text-sm mb-2">
                <Eye className="w-4 h-4" />
                전체 노출수 합계
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {formatNumber(monthlyTotals.impCnt)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
              <div className="flex items-center gap-2 text-purple-700 text-sm mb-2">
                <MousePointer className="w-4 h-4" />
                전체 클릭수 합계
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {formatNumber(monthlyTotals.clkCnt)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
              <div className="flex items-center gap-2 text-orange-700 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                평균 CTR
              </div>
              <p className="text-2xl font-bold text-orange-800">
                {monthlyTotals.impCnt > 0
                  ? ((monthlyTotals.clkCnt / monthlyTotals.impCnt) * 100).toFixed(2)
                  : 0}%
              </p>
            </div>
          </div>

          {/* 월별 데이터 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              월별 상세 데이터
            </h2>
            {monthlyStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">월</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">광고비</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">노출수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">클릭수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">CTR</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyByYear.map(({ year, months, totals }) => (
                      <>
                        {/* 연도 헤더 */}
                        <tr key={`year-${year}`} className="bg-gray-100">
                          <td colSpan={6} className="py-2 px-4 font-bold text-gray-800">
                            {year}년
                          </td>
                        </tr>
                        {/* 월별 데이터 */}
                        {months.map((stat) => (
                          <tr key={stat.month} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900 pl-8">{stat.monthLabel}</td>
                            <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(stat.salesAmt)}</td>
                            <td className="py-3 px-4 text-right text-gray-700">{formatNumber(stat.impCnt)}</td>
                            <td className="py-3 px-4 text-right text-gray-700">{formatNumber(stat.clkCnt)}</td>
                            <td className="py-3 px-4 text-right text-gray-700">{stat.ctr.toFixed(2)}%</td>
                            <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(Math.round(stat.cpc))}</td>
                          </tr>
                        ))}
                        {/* 연간 소계 */}
                        <tr key={`subtotal-${year}`} className="bg-blue-50 font-semibold">
                          <td className="py-3 px-4 text-blue-800">{year}년 소계</td>
                          <td className="py-3 px-4 text-right text-blue-800">{formatCurrency(totals.salesAmt)}</td>
                          <td className="py-3 px-4 text-right text-blue-800">{formatNumber(totals.impCnt)}</td>
                          <td className="py-3 px-4 text-right text-blue-800">{formatNumber(totals.clkCnt)}</td>
                          <td className="py-3 px-4 text-right text-blue-800">
                            {totals.impCnt > 0 ? ((totals.clkCnt / totals.impCnt) * 100).toFixed(2) : 0}%
                          </td>
                          <td className="py-3 px-4 text-right text-blue-800">
                            {totals.clkCnt > 0 ? formatCurrency(Math.round(totals.salesAmt / totals.clkCnt)) : "-"}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                  <tfoot className="bg-green-50">
                    <tr className="font-bold">
                      <td className="py-3 px-4 text-green-800">전체 합계</td>
                      <td className="py-3 px-4 text-right text-green-800">{formatCurrency(monthlyTotals.salesAmt)}</td>
                      <td className="py-3 px-4 text-right text-green-800">{formatNumber(monthlyTotals.impCnt)}</td>
                      <td className="py-3 px-4 text-right text-green-800">{formatNumber(monthlyTotals.clkCnt)}</td>
                      <td className="py-3 px-4 text-right text-green-800">
                        {monthlyTotals.impCnt > 0
                          ? ((monthlyTotals.clkCnt / monthlyTotals.impCnt) * 100).toFixed(2)
                          : 0}%
                      </td>
                      <td className="py-3 px-4 text-right text-green-800">
                        {monthlyTotals.clkCnt > 0
                          ? formatCurrency(Math.round(monthlyTotals.salesAmt / monthlyTotals.clkCnt))
                          : "-"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 연간 탭 */}
      {activeTab === "yearly" && (
        <div className="space-y-6">
          {/* 연간 합계 카드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 올해 합계 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {yearlyStats.currentYear[0]?.year || new Date().getFullYear()}년 합계
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">광고비</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(yearlyTotals.currentYear.salesAmt)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">노출수</p>
                  <p className="text-xl font-bold text-blue-600">{formatNumber(yearlyTotals.currentYear.impCnt)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">클릭수</p>
                  <p className="text-xl font-bold text-purple-600">{formatNumber(yearlyTotals.currentYear.clkCnt)}</p>
                </div>
              </div>
            </div>

            {/* 작년 합계 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {yearlyStats.previousYear[0]?.year || new Date().getFullYear() - 1}년 합계
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">광고비</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(yearlyTotals.previousYear.salesAmt)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">노출수</p>
                  <p className="text-xl font-bold text-blue-600">{formatNumber(yearlyTotals.previousYear.impCnt)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">클릭수</p>
                  <p className="text-xl font-bold text-purple-600">{formatNumber(yearlyTotals.previousYear.clkCnt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 연간 비교 차트 - 광고비, 노출, 클릭 모두 표시 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              연간 성과 비교 (전년 vs 금년)
            </h2>
            {yearlyStats.currentYear.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={yearlyStats.currentYear.map((current) => {
                      const previous = yearlyStats.previousYear.find((p) => p.month === current.month);
                      return {
                        월: current.monthLabel,
                        [`${current.year}년 광고비`]: current.salesAmt,
                        [`${current.year - 1}년 광고비`]: previous?.salesAmt || 0,
                        [`${current.year}년 클릭`]: current.clkCnt,
                        [`${current.year - 1}년 클릭`]: previous?.clkCnt || 0,
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="월" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        const v = Number(value) || 0;
                        if (String(name).includes("광고비")) return formatCurrency(v);
                        return formatNumber(v);
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey={`${yearlyStats.currentYear[0]?.year}년 광고비`}
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey={`${yearlyStats.previousYear[0]?.year}년 광고비`}
                      fill="#9ca3af"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={`${yearlyStats.currentYear[0]?.year}년 클릭`}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={`${yearlyStats.previousYear[0]?.year}년 클릭`}
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 연간 비교 테이블 - 노출/클릭 포함 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              월별 전년 대비 비교
            </h2>
            {yearlyStats.currentYear.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">월</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        {yearlyStats.currentYear[0]?.year}년 광고비
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        {yearlyStats.previousYear[0]?.year}년 광고비
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">광고비 변화</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        {yearlyStats.currentYear[0]?.year}년 노출
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        {yearlyStats.previousYear[0]?.year}년 노출
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        {yearlyStats.currentYear[0]?.year}년 클릭
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        {yearlyStats.previousYear[0]?.year}년 클릭
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyStats.currentYear.map((current) => {
                      const previous = yearlyStats.previousYear.find(
                        (p) => p.month === current.month
                      );
                      const costChange = previous && previous.salesAmt > 0
                        ? ((current.salesAmt - previous.salesAmt) / previous.salesAmt) * 100
                        : 0;
                      return (
                        <tr key={current.month} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{current.monthLabel}</td>
                          <td className="py-3 px-4 text-right text-gray-700">
                            {formatCurrency(current.salesAmt)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500">
                            {previous ? formatCurrency(previous.salesAmt) : "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {previous ? <ChangeIndicator value={costChange} /> : "-"}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">
                            {formatNumber(current.impCnt)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500">
                            {previous ? formatNumber(previous.impCnt) : "-"}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">
                            {formatNumber(current.clkCnt)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500">
                            {previous ? formatNumber(previous.clkCnt) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
