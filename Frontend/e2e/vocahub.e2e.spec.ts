import { expect, test } from '@playwright/test';

const runE2e = process.env.RUN_E2E === 'true';
test.beforeAll(() => {
  if (!runE2e) throw new Error('E2E is not configured. Start the backend/MySQL and run with RUN_E2E=true.');
});

test('golden path: auth, import, flashcard, quiz, refresh and delete', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.test`;
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('E2e-password-123');
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/import');
  await page.locator('input[type=file]').setInputFiles({
    name: 'words.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('term,meaning\nalpha,nghĩa alpha\nbeta,nghĩa beta\ngamma,nghĩa gamma\ndelta,nghĩa delta\n')
  });
  await expect(page.getByRole('heading', { name: /XEM TRƯỚC DỮ LIỆU/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bỏ chọn dòng 2' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sửa dòng 2' })).toHaveCount(0);
  await page.getByLabel('Tên bộ từ vựng').fill('E2E imported deck');
  await page.getByRole('button', { name: 'Tạo bộ từ' }).click();
  await expect(page).toHaveURL(/\/decks\//);

  await page.getByRole('link', { name: /Học flashcard/ }).click();
  await expect(page.getByRole('button', { name: 'Phát âm alpha' })).toBeVisible();
  await page.getByRole('button', { name: 'Phát âm alpha' }).click();
  await page.getByRole('button', { name: /Lật thẻ để xem nghĩa/ }).click();
  await page.getByRole('button', { name: 'Đã nhớ' }).click();
  await page.getByRole('link', { name: 'Thoát' }).click();
  await expect(page).toHaveURL(/\/decks\//);

  await page.getByRole('link', { name: /Làm quiz/ }).click();
  await expect(page.getByText('Chọn nghĩa đúng')).toBeVisible();
  for (let index = 0; index < 4; index += 1) {
    await page.locator('.answer-option').first().click();
    await page.getByRole('button', { name: /Câu tiếp theo/ }).click();
  }
  await expect(page.getByText('Kết quả kiểm tra')).toBeVisible();
  await page.getByRole('button', { name: 'Xem deck' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'E2E imported deck' })).toBeVisible();

  await page.getByRole('button', { name: 'Xóa' }).click();
  await page.getByRole('button', { name: 'Xóa' }).last().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('E2E imported deck')).not.toBeVisible();
});

test('mobile navigation opens and closes the sidebar', async ({ page }) => {
  const email = `e2e-mobile-${Date.now()}@example.test`;
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('E2e-password-123');
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('textbox', { name: 'Tìm kiếm từ vựng' })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  const menuButton = page.locator('.mobile-menu');
  const sidebar = page.locator('.sidebar');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).toBeHidden();

  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(sidebar).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đóng menu' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).toBeHidden();

  await menuButton.click();
  await page.getByRole('link', { name: 'Import danh sách' }).click();
  await expect(page).toHaveURL(/\/import$/);
  await expect(sidebar).toBeHidden();
});
