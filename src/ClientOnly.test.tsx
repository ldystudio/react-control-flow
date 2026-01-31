import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { ClientOnly } from "./ClientOnly";

// 每个测试后清理
afterEach(() => {
    cleanup();
});

describe("ClientOnly 组件", () => {
    describe("SSR 行为", () => {
        test("SSR 时返回空内容", () => {
            const html = renderToString(
                <ClientOnly>
                    <div>Client Content</div>
                </ClientOnly>
            );
            expect(html).toBe("");
        });

        test("SSR 时渲染 fallback", () => {
            const html = renderToString(
                <ClientOnly fallback={<div>Loading...</div>}>
                    <div>Client Content</div>
                </ClientOnly>
            );
            expect(html).toContain("Loading...");
            expect(html).not.toContain("Client Content");
        });

        test("fallback 可以是复杂组件", () => {
            const html = renderToString(
                <ClientOnly
                    fallback={
                        <div className="skeleton">
                            <div className="skeleton-line" />
                            <div className="skeleton-line" />
                        </div>
                    }
                >
                    <div>Client Content</div>
                </ClientOnly>
            );
            expect(html).toContain("skeleton");
            expect(html).toContain("skeleton-line");
        });

        test("fallback 为 null 时返回空", () => {
            const html = renderToString(
                <ClientOnly fallback={null}>
                    <div>Client Content</div>
                </ClientOnly>
            );
            expect(html).toBe("");
        });
    });

    describe("render function 模式", () => {
        test("SSR 时不调用 children 函数", () => {
            let called = false;
            const html = renderToString(
                <ClientOnly fallback={<div>Loading</div>}>
                    {() => {
                        called = true;
                        return <div>Client Content</div>;
                    }}
                </ClientOnly>
            );
            expect(called).toBe(false);
            expect(html).toContain("Loading");
        });

        test("SSR 时 children 函数不执行（避免访问 window）", () => {
            const html = renderToString(
                <ClientOnly fallback={<span>--:--</span>}>{() => <span>12:34</span>}</ClientOnly>
            );
            expect(html).toContain("--:--");
            expect(html).not.toContain("12:34");
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 ClientOnly 组件", () => {
            const html = renderToString(
                <div>
                    <ClientOnly fallback={<span>Outer Loading</span>}>
                        <div>
                            Outer
                            <ClientOnly fallback={<span>Inner Loading</span>}>
                                <span>Inner</span>
                            </ClientOnly>
                        </div>
                    </ClientOnly>
                </div>
            );
            expect(html).toContain("Outer Loading");
            expect(html).not.toContain("Inner Loading");
        });
    });

    describe("与其他组件配合", () => {
        test("在条件渲染中使用", () => {
            const show = true;
            const html = renderToString(
                <div>
                    {show && (
                        <ClientOnly fallback={<span>Loading</span>}>
                            <span>Content</span>
                        </ClientOnly>
                    )}
                </div>
            );
            expect(html).toContain("Loading");
        });

        test("在列表中使用", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(
                <div>
                    {items.map((item) => (
                        <ClientOnly key={item} fallback={<span>Loading {item}</span>}>
                            <span>Content {item}</span>
                        </ClientOnly>
                    ))}
                </div>
            );
            expect(html).toContain("Loading");
            expect(html).toContain("a");
            expect(html).toContain("b");
            expect(html).toContain("c");
        });
    });

    describe("典型使用场景", () => {
        test("时间显示场景", () => {
            const html = renderToString(
                <div>
                    Current time:{" "}
                    <ClientOnly fallback={<span>--:--:--</span>}>
                        <span>12:34:56</span>
                    </ClientOnly>
                </div>
            );
            expect(html).toContain("--:--:--");
        });

        test("浏览器特定功能场景", () => {
            const html = renderToString(
                <ClientOnly fallback={<div>Browser required</div>}>
                    <div>Browser-specific feature</div>
                </ClientOnly>
            );
            expect(html).toContain("Browser required");
        });
    });

    describe("客户端渲染行为", () => {
        test("客户端渲染后显示 children", async () => {
            render(
                <ClientOnly fallback={<span data-testid="fallback">Loading</span>}>
                    <span data-testid="content">Client Content</span>
                </ClientOnly>
            );

            // 等待 useEffect 执行后显示 children
            await waitFor(() => {
                expect(screen.getByTestId("content")).toBeTruthy();
            });
            expect(screen.queryByTestId("fallback")).toBeNull();
        });

        test("客户端渲染后调用 children 函数", async () => {
            let called = false;
            render(
                <ClientOnly fallback={<span data-testid="fallback">Loading</span>}>
                    {() => {
                        called = true;
                        return <span data-testid="content">Function Content</span>;
                    }}
                </ClientOnly>
            );

            await waitFor(() => {
                expect(called).toBe(true);
            });
            expect(screen.getByTestId("content")).toBeTruthy();
        });

        test("客户端渲染后 fallback 不再显示", async () => {
            render(
                <ClientOnly fallback={<div data-testid="skeleton">Skeleton</div>}>
                    <div data-testid="real-content">Real Content</div>
                </ClientOnly>
            );

            await waitFor(() => {
                expect(screen.getByTestId("real-content")).toBeTruthy();
            });
            expect(screen.queryByTestId("skeleton")).toBeNull();
        });
    });
});
