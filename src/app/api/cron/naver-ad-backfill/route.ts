import { NextResponse } from 'next/server';
import { getCampaigns, getSingleDayStats, DailyStatRecord } from '@/lib/naver-searchad';
import { sendTelegramMessage, CHAT_IDS } from '@/lib/telegram';

// Vercel Cron 설정
export const maxDuration = 60; // 최대 60초

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const NAVER_AD_DAILY_TABLE = process.env.AIRTABLE_NAVER_AD_DAILY_TABLE;

// Airtable 요청 헬퍼
async function airtableRequest(
  tableId: string,
  method: 'GET' | 'POST' | 'PATCH',
  body?: unknown,
  params?: Record<string, string>
) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// 기존 저장된 날짜 확인
async function getExistingDates(): Promise<Set<string>> {
  if (!NAVER_AD_DAILY_TABLE) return new Set();

  const result = await airtableRequest(NAVER_AD_DAILY_TABLE, 'GET', undefined, {
    'fields[]': 'date',
  });

  return new Set(
    (result.records || []).map((r: { fields: { date: string } }) => r.fields.date)
  );
}

// 레코드 저장
async function saveRecords(records: DailyStatRecord[]): Promise<number> {
  if (!NAVER_AD_DAILY_TABLE || records.length === 0) return 0;

  let saved = 0;

  // 10개씩 배치 처리
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    await airtableRequest(NAVER_AD_DAILY_TABLE, 'POST', {
      records: batch.map((fields) => ({
        fields: {
          date: fields.date,
          impCnt: fields.impCnt,
          clkCnt: fields.clkCnt,
          salesAmt: fields.salesAmt,
          ctr: fields.ctr,
          cpc: fields.cpc,
          ccnt: fields.ccnt,
          syncedAt: new Date().toISOString(),
        },
      })),
    });
    saved += batch.length;

    // Rate limit 방지
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return saved;
}

// 날짜 형식 헬퍼
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  // Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Cron auth warning: invalid or missing token');
  }

  const startTime = Date.now();

  try {
    // 환경변수 확인
    if (!NAVER_AD_DAILY_TABLE) {
      return NextResponse.json(
        { success: false, error: 'AIRTABLE_NAVER_AD_DAILY_TABLE not set' },
        { status: 500 }
      );
    }

    // 1. 캠페인 목록 조회
    const campaigns = await getCampaigns();
    if (campaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No campaigns found',
        saved: 0,
      });
    }

    const campaignIds = campaigns.map((c) => c.nccCampaignId);

    // 2. 기존 저장된 날짜 확인
    const existingDates = await getExistingDates();

    // 3. 최근 7일 중 누락된 날짜 확인
    const today = new Date();
    const missingDates: string[] = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDate(date);
      if (!existingDates.has(dateStr)) {
        missingDates.push(dateStr);
      }
    }

    if (missingDates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All recent data already synced',
        saved: 0,
      });
    }

    // 4. 누락된 날짜 데이터 조회 및 저장
    const recordsToSave: DailyStatRecord[] = [];

    for (const date of missingDates) {
      const stat = await getSingleDayStats(campaignIds, date);
      if (stat && (stat.impCnt > 0 || stat.clkCnt > 0 || stat.salesAmt > 0)) {
        recordsToSave.push(stat);
      }
      // Rate limit 방지
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const savedCount = await saveRecords(recordsToSave);

    const duration = Date.now() - startTime;

    // 텔레그램 알림 (성공 시)
    if (savedCount > 0) {
      await sendTelegramMessage({
        chatId: CHAT_IDS.BACKFILL_ALERT,
        message: `✅ <b>[초호] 네이버 광고 데이터 백필 완료</b>\n\n저장된 날짜: ${savedCount}일\n실행 시간: ${(duration / 1000).toFixed(1)}초`,
        parseMode: 'HTML',
      });
    }

    return NextResponse.json({
      success: true,
      checked: missingDates,
      saved: savedCount,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('Naver Ad backfill error:', error);

    // 텔레그램 알림 (실패 시)
    await sendTelegramMessage({
      chatId: CHAT_IDS.BACKFILL_ALERT,
      message: `❌ <b>[초호] 네이버 광고 데이터 백필 실패</b>\n\n오류: ${String(error)}`,
      parseMode: 'HTML',
    });

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
