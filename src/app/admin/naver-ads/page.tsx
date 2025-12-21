"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [yearlyStats, setYearlyStats] = useState<{
    currentYear: YearlyStat[];
    previousYear: YearlyStat[];
  }>({ currentYear: [], previousYear: [] });
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [keywords, setKeywords] = useState<KeywordStat[]>([]);

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // 날짜 초기화 (이번 달 1일 ~ 오늘)
  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateRange({
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
  }, []);

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
        dailyRes,
        weeklyRes,
        monthlyRes,
        yearlyRes,
        campaignsRes,
        keywordsRes,
      ] = await Promise.all([
        fetch(`/api/analytics?type=naver-summary&${params}`),
        fetch(`/api/analytics?type=naver-comparison`),
        fetch(`/api/analytics?type=naver-daily&${params}`),
        fetch(`/api/analytics?type=naver-weekly&weeks=8`),
        fetch(`/api/analytics?type=naver-monthly&months=12`),
        fetch(`/api/analytics?type=naver-yearly`),
        fetch(`/api/analytics?type=naver-campaigns&${params}`),
        fetch(`/api/analytics?type=naver-keywords-sync`),
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

      // 일별 통계
      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailyStats(data.daily || []);
      }

      // 주간별 통계
      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyStats(data.weekly || []);
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

        {/* 날짜 선택 (요약 탭에서만 표시) */}
        {activeTab === "summary" && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
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
        )}
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
      </div>

      {/* 요약 탭 */}
      {activeTab === "summary" && (
        <div className="space-y-6">
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

          {/* 키워드 TOP 20 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              키워드 TOP 20 (클릭순)
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
                    {keywords.slice(0, 20).map((kw, index) => (
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
          {/* 일별 광고비/클릭수 복합 차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              일별 광고 성과 추이
            </h2>
            {dailyStats.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={dailyStats.map((stat) => ({
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
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 일별 데이터 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              일별 상세 데이터
            </h2>
            {dailyStats.length > 0 ? (
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">날짜</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">광고비</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">노출수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">클릭수</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">CTR</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...dailyStats].reverse().map((stat) => (
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
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 주간별 탭 */}
      {activeTab === "weekly" && (
        <div className="space-y-6">
          {/* 주간별 그룹 바 차트 */}
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
                      광고비: Math.round(stat.salesAmt / 1000), // 천원 단위
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

          {/* 주간별 데이터 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              주간별 상세 데이터
            </h2>
            {weeklyStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
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
                    {[...weeklyStats].reverse().map((stat) => (
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
              월별 광고비 추이 (최근 12개월)
            </h2>
            {monthlyStats.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyStats.map((stat) => ({
                      월: stat.month.slice(5) + "월", // MM월 형식
                      광고비: Math.round(stat.salesAmt / 10000), // 만원 단위
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
                    {[...monthlyStats].reverse().map((stat) => (
                      <tr key={stat.month} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{stat.monthLabel}</td>
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
          {/* 연간 비교 차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              연간 광고비 비교 (전년 vs 금년)
            </h2>
            {yearlyStats.currentYear.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="monthLabel"
                      type="category"
                      allowDuplicatedCategory={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value) || 0)}
                    />
                    <Legend />
                    <Line
                      data={yearlyStats.currentYear.map((s) => ({
                        monthLabel: s.monthLabel,
                        광고비: s.salesAmt,
                      }))}
                      type="monotone"
                      dataKey="광고비"
                      name={`${yearlyStats.currentYear[0]?.year || new Date().getFullYear()}년`}
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      data={yearlyStats.previousYear.map((s) => ({
                        monthLabel: s.monthLabel,
                        광고비: s.salesAmt,
                      }))}
                      type="monotone"
                      dataKey="광고비"
                      name={`${yearlyStats.previousYear[0]?.year || new Date().getFullYear() - 1}년`}
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 연간 비교 테이블 */}
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
                      <th className="text-right py-3 px-4 font-medium text-gray-600">변화율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyStats.currentYear.map((current) => {
                      const previous = yearlyStats.previousYear.find(
                        (p) => p.month === current.month
                      );
                      const change = previous && previous.salesAmt > 0
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
                            {previous ? <ChangeIndicator value={change} /> : "-"}
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
