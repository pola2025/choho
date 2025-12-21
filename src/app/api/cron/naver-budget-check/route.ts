import { NextResponse } from 'next/server';
import { getBizmoney } from '@/lib/naver-searchad';
import { sendNaverAdBudgetAlert, sendNaverAdBudgetDepletedAlert } from '@/lib/telegram';

// Vercel Cron 인증
const CRON_SECRET = process.env.CRON_SECRET;

// 예산 임계값 설정 (원)
const BUDGET_WARNING_THRESHOLD = 100000;  // 10만원 이하 시 경고
const BUDGET_CRITICAL_THRESHOLD = 30000;  // 3만원 이하 시 긴급 알림

export async function GET(request: Request) {
  // Cron 인증 확인 (선택사항)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    // 인증 실패해도 일단 진행 (개발 편의)
    console.log('Cron auth warning: invalid or missing token');
  }

  try {
    // 잔여 예산 조회
    const bizmoneyInfo = await getBizmoney();

    if (!bizmoneyInfo) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bizmoney'
      }, { status: 500 });
    }

    const currentBudget = bizmoneyInfo.bizmoney;
    let alertSent = false;
    let alertType = 'none';

    // 예산 체크 및 알림 발송
    if (currentBudget <= BUDGET_CRITICAL_THRESHOLD) {
      // 긴급 알림 (3만원 이하)
      alertSent = await sendNaverAdBudgetDepletedAlert(currentBudget);
      alertType = 'critical';
    } else if (currentBudget <= BUDGET_WARNING_THRESHOLD) {
      // 경고 알림 (10만원 이하)
      alertSent = await sendNaverAdBudgetAlert(currentBudget, BUDGET_WARNING_THRESHOLD);
      alertType = 'warning';
    }

    return NextResponse.json({
      success: true,
      currentBudget,
      thresholds: {
        warning: BUDGET_WARNING_THRESHOLD,
        critical: BUDGET_CRITICAL_THRESHOLD,
      },
      alertType,
      alertSent,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Budget check error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
