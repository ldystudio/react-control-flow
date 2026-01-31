import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { Once } from "./Once";

// 每个测试后清理
afterEach(() => {
    cleanup();
});

describe("Once 组件", () => {
    describe("基本渲染", () => {
        test("渲染 children 内容", () => {
            const html = renderToString(
                <Once>
                    <div>Static Content</div>
                </Once>
            );
            expect(html).toContain("Static Content");
        });

        test("渲染字符串 children", () => {
            const html = renderToString(<Once>Hello World</Once>);
            expect(html).toContain("Hello World");
        });

        test("渲染数字 children", () => {
            const html = renderToString(<Once>{42}</Once>);
            expect(html).toContain("42");
        });

        test("渲染复杂组件", () => {
            const html = renderToString(
                <Once>
                    <div className="container">
                        <h1>Title</h1>
                        <p>Description</p>
                    </div>
                </Once>
            );
            expect(html).toContain("Title");
            expect(html).toContain("Description");
        });
    });

    describe("缓存行为（SSR 场景）", () => {
        test("SSR 时正常渲染初始内容", () => {
            const html = renderToString(
                <Once>
                    <span>Initial Value</span>
                </Once>
            );
            expect(html).toContain("Initial Value");
        });

        test("渲染带 props 的组件", () => {
            function Child({ value }: { value: number }) {
                return <span>Value: {value}</span>;
            }
            const html = renderToString(
                <Once>
                    <Child value={100} />
                </Once>
            );
            expect(html).toContain("Value");
            expect(html).toContain("100");
        });
    });

    describe("null 和 undefined 处理", () => {
        test("children 为 null 时返回空", () => {
            const html = renderToString(<Once>{null}</Once>);
            expect(html).toBe("");
        });

        test("children 为 undefined 时返回空", () => {
            const html = renderToString(<Once>{undefined}</Once>);
            expect(html).toBe("");
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 Once 组件", () => {
            const html = renderToString(
                <Once>
                    <div>
                        Outer
                        <Once>
                            <span>Inner</span>
                        </Once>
                    </div>
                </Once>
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
                        <Once>
                            <span>Conditional Content</span>
                        </Once>
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
                        <Once key={item}>
                            <span>{item}</span>
                        </Once>
                    ))}
                </div>
            );
            expect(html).toContain("a");
            expect(html).toContain("b");
            expect(html).toContain("c");
        });
    });

    describe("客户端缓存行为", () => {
        test("父组件重新渲染时保持初始内容", () => {
            function Parent() {
                const [count, setCount] = useState(0);
                return (
                    <div>
                        <button type="button" onClick={() => setCount((c) => c + 1)} data-testid="increment">
                            Count: {count}
                        </button>
                        <Once>
                            <span data-testid="once-content">Initial: {count}</span>
                        </Once>
                    </div>
                );
            }

            const { rerender } = render(<Parent />);
            expect(screen.getByTestId("once-content").textContent).toBe("Initial: 0");

            // 触发重新渲染
            rerender(<Parent />);
            // Once 内容应该保持不变
            expect(screen.getByTestId("once-content").textContent).toBe("Initial: 0");
        });

        test("props 变化时不更新内容", () => {
            function Child({ value }: { value: number }) {
                return <span data-testid="child">Value: {value}</span>;
            }

            function Parent({ value }: { value: number }) {
                return (
                    <Once>
                        <Child value={value} />
                    </Once>
                );
            }

            const { rerender } = render(<Parent value={1} />);
            expect(screen.getByTestId("child").textContent).toBe("Value: 1");

            // 更新 props
            rerender(<Parent value={2} />);
            // Once 内容应该保持初始值
            expect(screen.getByTestId("child").textContent).toBe("Value: 1");
        });

        test("多次重新渲染后仍保持初始内容", () => {
            let renderCount = 0;

            function Parent({ trigger: _trigger }: { trigger: number }) {
                renderCount++;
                return (
                    <Once>
                        <span data-testid="render-count">Render: {renderCount}</span>
                    </Once>
                );
            }

            const { rerender } = render(<Parent trigger={0} />);
            expect(screen.getByTestId("render-count").textContent).toBe("Render: 1");

            // 多次重新渲染
            rerender(<Parent trigger={1} />);
            rerender(<Parent trigger={2} />);
            rerender(<Parent trigger={3} />);

            // Once 内容应该保持第一次渲染的值
            expect(screen.getByTestId("render-count").textContent).toBe("Render: 1");
        });
    });
});
