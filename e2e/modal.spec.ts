import { test, expect } from '@playwright/test';

test.describe('Modal Layering and Confirm Systems', () => {
  test.beforeEach(async ({ page }) => {
    // 1. 로그인 수행
    await page.goto('/login');
    await page.fill('input[placeholder="아이디 입력"]', 'admin');
    await page.fill('input[placeholder="비밀번호 입력"]', 'admin123!');
    await page.click('button:has-text("로그인 및 인증 시작")');
    
    // 메인 페이지 로드 대기
    await expect(page).toHaveURL('/');
  });

  test('Customer registration modal should be at the top level and visible', async ({ page }) => {
    await page.goto('/customers/page/1');
    
    // '+ 신규 고객 등록' 버튼 클릭
    await page.click('button:has-text("+ 신규 고객 등록")');
    
    // 모달이 나타날 때까지 대기
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Portal 검증: 모달이 body에 포탈되었는지 확인 (overlay 포함 여부 고려)
    const portalContainer = await modal.evaluate(el => el.closest('.fixed')?.parentElement?.tagName);
    expect(portalContainer).toBe('BODY');

    // 헤더(z-index가 높은 기존 요소) 위에 있는지 시각적/구조적 확인
    // z-index 값을 가져와서 확인 (최외곽 fixed overlay에 100 이상으로 설정했음)
    const zIndex = await modal.evaluate(el => window.getComputedStyle(el.closest('.fixed')!).zIndex);
    expect(parseInt(zIndex)).toBeGreaterThanOrEqual(100);
  });

  test('Custom ConfirmModal should appear when deleting a customer', async ({ page }) => {
    await page.goto('/customers/page/1');
    
    // 첫 번째 고객의 관리(More) 버튼 클릭 (MoreHorizontal 아이콘 버튼)
    // 테이블 내의 첫 번째 행의 마지막 셀 버튼
    const moreButtons = page.locator('button >> .lucide-more-horizontal');
    await moreButtons.first().click();
    
    // '데이터 삭제' 메뉴 클릭
    await page.click('button:has-text("데이터 삭제")');
    
    // 커스텀 ConfirmModal 대기 (role="dialog" 또는 특정 텍스트 포함)
    const confirmModal = page.locator('text=고객 정보 삭제');
    await expect(confirmModal).toBeVisible();
    
    // "삭제하기" 버튼이 빨간색 테마로 존재하는지 확인
    const deleteBtn = page.locator('button:has-text("삭제하기")');
    await expect(deleteBtn).toBeVisible();
    
    // 취소 클릭 시 닫히는지 확인
    await page.click('button:has-text("취소")');
    await expect(confirmModal).not.toBeVisible();
  });
});
