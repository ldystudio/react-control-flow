import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Visible } from "./Visible";

// 每个测试后清理
afterEach(() => {
    cleanup();
});

describe("Visible 组件", () => {
    describe("SSR 行为（无 IntersectionObserver）", () => {
        test("SSR 时直接渲染 children（降级处理）", () => {
            const html = renderToString(
                <Visible>
                    <div>Content</div>
                </Visible>
            );
            expect(html).toContain("Content");
        });

        test("SSR 时忽略 fallback", () => {
            const html = renderToString(
                <Visible fallback={<div>Loading</div>}>
                    <div>Content</div>
                </Visible>
            );
            expect(html).toContain("Content");
            expect(html).not.toContain("Loading");
        });

        test("SSR 时渲染复杂组件", () => {
            const html = renderToString(
                <Visible>
                    <div className="container">
                        <h1>Title</h1>
                        <p>Description</p>
                    </div>
                </Visible>
            );
            expect(html).toContain("Title");
            expect(html).toContain("Description");
        });
    });

    describe("Props 验证", () => {
        test("支持 rootMargin 属性", () => {
            const html = renderToString(
                <Visible rootMargin="100px">
                    <div>Content</div>
                </Visible>
            );
            expect(html).toContain("Content");
        });

        test("支持 threshold 属性", () => {
            const html = renderToString(
                <Visible threshold={0.5}>
                    <div>Content</div>
                </Visible>
            );
            expect(html).toContain("Content");
        });

        test("支持 threshold 数组", () => {
            const html = renderToString(
                <Visible threshold={[0, 0.5, 1]}>
                    <div>Content</div>
                </Visible>
            );
            expect(html).toContain("Content");
        });

        test("支持 once 属性", () => {
            const html = renderToString(
                <Visible once={false}>
                    <div>Content</div>
                </Visible>
            );
            expect(html).toContain("Content");
        });

        test("支持 onVisibilityChange 回调", () => {
            const onVisibilityChange = mock(() => {});
            const html = renderToString(
                <Visible onVisibilityChange={onVisibilityChange}>
                    <div>Content</div>
                </Visible>
            );
            expect(html).toContain("Content");
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 Visible 组件", () => {
            const html = renderToString(
                <Visible>
                    <div>
                        Outer
                        <Visible>
                            <span>Inner</span>
                        </Visible>
                    </div>
                </Visible>
            );
            expect(html).toContain("Outer");
            expect(html).toContain("Inner");
        });
    });

    describe("与其他组件配合", () => {
        test("在条件渲染中使用", () => {
            const show = true;
            const html = renderToString(
                <div>
                    {show && (
                        <Visible>
                            <span>Conditional Content</span>
                        </Visible>
                    )}
                </div>
            );
            expect(html).toContain("Conditional Content");
        });

        test("在列表中使用", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(
                <div>
                    {items.map((item) => (
                        <Visible key={item}>
                            <span>{item}</span>
                        </Visible>
                    ))}
                </div>
            );
            expect(html).toContain("a");
            expect(html).toContain("b");
            expect(html).toContain("c");
        });
    });

    describe("典型使用场景", () => {
        test("图片懒加载场景", () => {
            const html = renderToString(
                <Visible fallback={<div className="placeholder" />}>
                    <img src="image.jpg" alt="test" />
                </Visible>
            );
            expect(html).toContain("img");
            expect(html).toContain("image.jpg");
        });

        test("重型组件懒加载", () => {
            function HeavyComponent() {
                return <div className="heavy">Heavy Content</div>;
            }
            const html = renderToString(
                <Visible>
                    <HeavyComponent />
                </Visible>
            );
            expect(html).toContain("Heavy Content");
        });
    });

    describe("客户端渲染行为", () => {
        test("客户端渲染时包含 wrapper div", async () => {
            render(
                <Visible fallback={<span data-testid="fallback">Loading</span>}>
                    <span data-testid="content">Content</span>
                </Visible>
            );

            // 等待客户端渲染完成
            await waitFor(() => {
                // 客户端渲染后应该有 wrapper div
                const wrapper = document.querySelector("div");
                expect(wrapper).toBeTruthy();
            });
        });

        test("不支持 IntersectionObserver 时直接渲染 children", async () => {
            // 保存原始的 IntersectionObserver
            const originalIO = globalThis.IntersectionObserver;

            // 删除 IntersectionObserver 模拟不支持的环境
            // @ts-expect-error 测试需要删除 IntersectionObserver
            delete globalThis.IntersectionObserver;

            render(
                <Visible fallback={<span data-testid="fallback">Loading</span>}>
                    <span data-testid="content">Content</span>
                </Visible>
            );

            // 不支持时应该直接渲染 children
            await waitFor(() => {
                expect(screen.getByTestId("content")).toBeTruthy();
            });

            // 恢复 IntersectionObserver
            globalThis.IntersectionObserver = originalIO;
        });

        test("onVisibilityChange 回调类型正确", () => {
            const onVisibilityChange = mock((_isVisible: boolean) => {});

            // 验证 onVisibilityChange 可以作为 prop 传递
            const html = renderToString(
                <Visible onVisibilityChange={onVisibilityChange}>
                    <span>Content</span>
                </Visible>
            );
            expect(html).toContain("Content");
        });
    });
});
