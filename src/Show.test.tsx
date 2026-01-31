import { describe, expect, mock, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Show } from "./Show";

describe("Show 组件", () => {
    describe("基本条件渲染", () => {
        test("condition 为 true 时渲染 children", () => {
            const html = renderToString(
                <Show when={true}>
                    <span>visible</span>
                </Show>
            );
            expect(html).toContain("visible");
        });

        test("condition 为 false 时不渲染 children", () => {
            const html = renderToString(
                <Show when={false}>
                    <span>hidden</span>
                </Show>
            );
            expect(html).not.toContain("hidden");
        });

        test("condition 为 false 时渲染空内容", () => {
            const html = renderToString(
                <Show when={false}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });
    });

    describe("falsy 值处理", () => {
        test("condition 为 null 时不渲染", () => {
            const html = renderToString(
                <Show when={null}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("condition 为 undefined 时不渲染", () => {
            const html = renderToString(
                <Show when={undefined}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("condition 为 0 时不渲染", () => {
            const html = renderToString(
                <Show when={0}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("condition 为空字符串时不渲染", () => {
            const html = renderToString(
                <Show when={""}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("condition 为 NaN 时不渲染", () => {
            const html = renderToString(
                <Show when={Number.NaN}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });
    });

    describe("truthy 值处理", () => {
        test("condition 为非零数字时渲染", () => {
            const html = renderToString(
                <Show when={42}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("content");
        });

        test("condition 为非空字符串时渲染", () => {
            const html = renderToString(
                <Show when={"hello"}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("content");
        });

        test("condition 为非空对象时渲染", () => {
            const html = renderToString(
                <Show when={{ name: "test" }}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("content");
        });

        test("condition 为非空数组时渲染", () => {
            const html = renderToString(
                <Show when={[1, 2, 3]}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("content");
        });

        test("condition 为非空 Map 时渲染", () => {
            const html = renderToString(
                <Show when={new Map([["key", "value"]])}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("content");
        });

        test("condition 为非空 Set 时渲染", () => {
            const html = renderToString(
                <Show when={new Set([1, 2])}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("content");
        });
    });

    describe("复杂类型判空", () => {
        test("condition 为空数组时不渲染", () => {
            const html = renderToString(
                <Show when={[]}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("condition 为空对象时不渲染", () => {
            const html = renderToString(
                <Show when={{}}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("condition 为空 Map 时不渲染", () => {
            const html = renderToString(
                <Show when={new Map()}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("condition 为空 Set 时不渲染", () => {
            const html = renderToString(
                <Show when={new Set()}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });

        test("空数组时渲染 fallback", () => {
            const html = renderToString(
                <Show when={[]} fallback={<span>empty</span>}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("empty");
            expect(html).not.toContain("content");
        });

        test("空对象时渲染 fallback", () => {
            const html = renderToString(
                <Show when={{}} fallback={<span>empty</span>}>
                    <span>content</span>
                </Show>
            );
            expect(html).toContain("empty");
            expect(html).not.toContain("content");
        });
    });

    describe("fallback 功能", () => {
        test("condition 为 false 时渲染 fallback", () => {
            const html = renderToString(
                <Show when={false} fallback={<span>fallback content</span>}>
                    <span>main content</span>
                </Show>
            );
            expect(html).toContain("fallback content");
            expect(html).not.toContain("main content");
        });

        test("condition 为 true 时不渲染 fallback", () => {
            const html = renderToString(
                <Show when={true} fallback={<span>fallback content</span>}>
                    <span>main content</span>
                </Show>
            );
            expect(html).toContain("main content");
            expect(html).not.toContain("fallback content");
        });

        test("fallback 可以是复杂组件", () => {
            const html = renderToString(
                <Show
                    when={false}
                    fallback={
                        <div className="error">
                            <h1>Error</h1>
                            <p>Something went wrong</p>
                        </div>
                    }
                >
                    <span>success</span>
                </Show>
            );
            expect(html).toContain("Error");
            expect(html).toContain("Something went wrong");
        });

        test("未提供 fallback 时返回 null", () => {
            const html = renderToString(
                <Show when={false}>
                    <span>content</span>
                </Show>
            );
            expect(html).toBe("");
        });
    });

    describe("render props 模式", () => {
        test("children 为函数时传递 condition 值", () => {
            const user = { name: "Alice", age: 30 };
            const html = renderToString(<Show when={user}>{(u) => <span>Hello, {u.name}</span>}</Show>);
            expect(html).toContain("Hello");
            expect(html).toContain("Alice");
        });

        test("children 函数接收正确的值类型", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(<Show when={items}>{(arr) => <span>Count: {arr.length}</span>}</Show>);
            expect(html).toContain("Count");
            expect(html).toContain("3");
        });

        test("condition 为 falsy 时不调用 children 函数", () => {
            let called = false;
            renderToString(
                <Show<string | null> when={null}>
                    {() => {
                        called = true;
                        return <span>should not render</span>;
                    }}
                </Show>
            );
            expect(called).toBe(false);
        });

        test("render props 与 fallback 结合使用", () => {
            const user = null as { name: string } | null;
            const html = renderToString(
                <Show<typeof user> when={user} fallback={<span>Please login</span>}>
                    {(u) => <span>Welcome, {u.name}</span>}
                </Show>
            );
            expect(html).toContain("Please login");
            expect(html).not.toContain("Welcome");
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 If 组件", () => {
            const html = renderToString(
                <Show when={true}>
                    <Show when={true}>
                        <span>nested content</span>
                    </Show>
                </Show>
            );
            expect(html).toContain("nested content");
        });

        test("外层 false 时内层不渲染", () => {
            const html = renderToString(
                <Show when={false}>
                    <Show when={true}>
                        <span>nested content</span>
                    </Show>
                </Show>
            );
            expect(html).not.toContain("nested content");
        });
    });

    describe("多个 children", () => {
        test("支持多个子元素", () => {
            const html = renderToString(
                <Show when={true}>
                    <span>first</span>
                    <span>second</span>
                    <span>third</span>
                </Show>
            );
            expect(html).toContain("first");
            expect(html).toContain("second");
            expect(html).toContain("third");
        });

        test("支持文本节点", () => {
            const html = renderToString(<Show when={true}>plain text</Show>);
            expect(html).toContain("plain text");
        });
    });

    describe("onFallback 回调", () => {
        test("条件为假时调用 onFallback", () => {
            const onFallback = mock(() => {});
            renderToString(
                <Show when={false} onFallback={onFallback}>
                    <span>content</span>
                </Show>
            );
            expect(onFallback).toHaveBeenCalledTimes(1);
        });

        test("条件为真时不调用 onFallback", () => {
            const onFallback = mock(() => {});
            renderToString(
                <Show when={true} onFallback={onFallback}>
                    <span>content</span>
                </Show>
            );
            expect(onFallback).not.toHaveBeenCalled();
        });

        test("onFallback 与 fallback 同时使用", () => {
            const onFallback = mock(() => {});
            const html = renderToString(
                <Show when={false} fallback={<span>Fallback</span>} onFallback={onFallback}>
                    <span>content</span>
                </Show>
            );
            expect(onFallback).toHaveBeenCalledTimes(1);
            expect(html).toContain("Fallback");
        });

        test("空数组时调用 onFallback", () => {
            const onFallback = mock(() => {});
            renderToString(
                <Show when={[]} onFallback={onFallback}>
                    <span>content</span>
                </Show>
            );
            expect(onFallback).toHaveBeenCalledTimes(1);
        });

        test("空对象时调用 onFallback", () => {
            const onFallback = mock(() => {});
            renderToString(
                <Show when={{}} onFallback={onFallback}>
                    <span>content</span>
                </Show>
            );
            expect(onFallback).toHaveBeenCalledTimes(1);
        });
    });
});
