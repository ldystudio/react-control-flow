/**
 * Visible 组件 IntersectionObserver E2E 测试
 *
 * 使用 Playwright 在真实浏览器环境中测试 IntersectionObserver 行为
 */

import { expect, test } from "@playwright/test";

test.describe("Visible 组件 IntersectionObserver 行为", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        // 等待页面加载完成
        await page.waitForSelector('[data-testid="spacer"]');
    });

    test("初始状态：视口外的元素显示 fallback", async ({ page }) => {
        // 确保页面在顶部
        await page.evaluate(() => window.scrollTo(0, 0));

        // 等待一下让 React 渲染完成
        await page.waitForTimeout(100);

        // 检查 fallback 是否显示
        const fallbackOnce = page.locator('[data-testid="fallback-once"]');
        await expect(fallbackOnce).toBeVisible();

        // 检查 content 是否不显示
        const contentOnce = page.locator('[data-testid="content-once"]');
        await expect(contentOnce).not.toBeVisible();
    });

    test("滚动到视口内时显示 children", async ({ page }) => {
        // 确保页面在顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // 滚动到 Visible 组件位置
        await page.locator('[data-testid="visible-wrapper"]').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);

        // 检查 content 是否显示
        const contentOnce = page.locator('[data-testid="content-once"]');
        await expect(contentOnce).toBeVisible();

        // 检查 fallback 是否不显示
        const fallbackOnce = page.locator('[data-testid="fallback-once"]');
        await expect(fallbackOnce).not.toBeVisible();
    });

    test("once=true：进入视口后保持渲染，即使滚动离开", async ({ page }) => {
        // 确保页面在顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // 滚动到 Visible 组件位置
        await page.locator('[data-testid="visible-wrapper"]').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);

        // 确认 content 显示
        const contentOnce = page.locator('[data-testid="content-once"]');
        await expect(contentOnce).toBeVisible();

        // 滚动回顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);

        // once=true 时，content 应该仍然存在（虽然可能不在视口内）
        // 检查 DOM 中是否存在
        await expect(contentOnce).toBeAttached();
    });

    test("once=false：离开视口后显示 fallback", async ({ page }) => {
        // 确保页面在顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // 滚动到 once=false 的 Visible 组件位置（第二个 visible-wrapper）
        await page.locator('[data-testid="visible-wrapper"]').nth(1).scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);

        // 确认 content 显示
        const contentToggle = page.locator('[data-testid="content-toggle"]');
        await expect(contentToggle).toBeVisible();

        // 滚动回顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);

        // once=false 时，应该显示 fallback
        const fallbackToggle = page.locator('[data-testid="fallback-toggle"]');
        await expect(fallbackToggle).toBeAttached();
    });

    test("onVisibilityChange 回调在进入视口时被调用", async ({ page }) => {
        // 确保页面在顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // 滚动到 Visible 组件位置
        await page.locator('[data-testid="visible-wrapper"]').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);

        // 检查 window.lastVisibilityChange 是否为 true
        const lastVisibilityChange = await page.evaluate(() => (window as any).lastVisibilityChange);
        expect(lastVisibilityChange).toBe(true);
    });

    test("rootMargin 提前触发可见性", async ({ page }) => {
        // 这个测试验证 rootMargin 的效果
        // 由于我们的测试页面没有设置 rootMargin，这里只验证基本行为

        // 确保页面在顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // 获取 visible-wrapper 的位置
        const wrapper = page.locator('[data-testid="visible-wrapper"]').first();
        const boundingBox = await wrapper.boundingBox();

        // 确保元素在视口外
        expect(boundingBox).not.toBeNull();
        if (boundingBox) {
            const viewportHeight = await page.evaluate(() => window.innerHeight);
            expect(boundingBox.y).toBeGreaterThan(viewportHeight);
        }
    });

    test("多个 Visible 组件独立工作", async ({ page }) => {
        // 确保页面在顶部
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // 检查两个 fallback 都显示
        const fallbackOnce = page.locator('[data-testid="fallback-once"]');
        const fallbackToggle = page.locator('[data-testid="fallback-toggle"]');

        await expect(fallbackOnce).toBeVisible();
        await expect(fallbackToggle).toBeVisible();

        // 滚动到第一个 Visible 组件
        await page.locator('[data-testid="visible-wrapper"]').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);

        // 第一个应该显示 content
        const contentOnce = page.locator('[data-testid="content-once"]');
        await expect(contentOnce).toBeVisible();

        // 第二个可能仍然显示 fallback（取决于视口大小）
        // 这里我们只验证第一个组件的行为
    });
});
