import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { If } from "./If";

describe("If 组件", () => {
    describe("基本条件渲染", () => {
        test("condition 为 true 时渲染 children", () => {
            const html = renderToString(
                <If condition={true}>
                    <span>visible</span>
                </If>
            );
            expect(html).toContain("visible");
        });

        test("condition 为 false 时不渲染 children", () => {
            const html = renderToString(
                <If condition={false}>
                    <span>hidden</span>
                </If>
            );
            expect(html).not.toContain("hidden");
        });

        test("condition 为 false 时渲染空内容", () => {
            const html = renderToString(
                <If condition={false}>
                    <span>content</span>
                </If>
            );
            expect(html).toBe("");
        });
    });

    describe("falsy 值处理", () => {
        test("condition 为 null 时不渲染", () => {
            const html = renderToString(
                <If condition={null}>
                    <span>content</span>
                </If>
            );
            expect(html).toBe("");
        });

        test("condition 为 undefined 时不渲染", () => {
            const html = renderToString(
                <If condition={undefined}>
                    <span>content</span>
                </If>
            );
            expect(html).toBe("");
        });

        test("condition 为 0 时不渲染", () => {
            const html = renderToString(
                <If condition={0}>
                    <span>content</span>
                </If>
            );
            expect(html).toBe("");
        });

        test("condition 为空字符串时不渲染", () => {
            const html = renderToString(
                <If condition={""}>
                    <span>content</span>
                </If>
            );
            expect(html).toBe("");
        });

        test("condition 为 NaN 时不渲染", () => {
            const html = renderToString(
                <If condition={Number.NaN}>
                    <span>content</span>
                </If>
            );
            expect(html).toBe("");
        });
    });

    describe("truthy 值处理", () => {
        test("condition 为非零数字时渲染", () => {
            const html = renderToString(
                <If condition={42}>
                    <span>content</span>
                </If>
            );
            expect(html).toContain("content");
        });

        test("condition 为非空字符串时渲染", () => {
            const html = renderToString(
                <If condition={"hello"}>
                    <span>content</span>
                </If>
            );
            expect(html).toContain("content");
        });

        test("condition 为对象时渲染", () => {
            const html = renderToString(
                <If condition={{ name: "test" }}>
                    <span>content</span>
                </If>
            );
            expect(html).toContain("content");
        });

        test("condition 为数组时渲染", () => {
            const html = renderToString(
                <If condition={[1, 2, 3]}>
                    <span>content</span>
                </If>
            );
            expect(html).toContain("content");
        });

        test("condition 为空数组时渲染（空数组是 truthy）", () => {
            const html = renderToString(
                <If condition={[]}>
                    <span>content</span>
                </If>
            );
            expect(html).toContain("content");
        });

        test("condition 为空对象时渲染（空对象是 truthy）", () => {
            const html = renderToString(
                <If condition={{}}>
                    <span>content</span>
                </If>
            );
            expect(html).toContain("content");
        });
    });

    describe("fallback 功能", () => {
        test("condition 为 false 时渲染 fallback", () => {
            const html = renderToString(
                <If condition={false} fallback={<span>fallback content</span>}>
                    <span>main content</span>
                </If>
            );
            expect(html).toContain("fallback content");
            expect(html).not.toContain("main content");
        });

        test("condition 为 true 时不渲染 fallback", () => {
            const html = renderToString(
                <If condition={true} fallback={<span>fallback content</span>}>
                    <span>main content</span>
                </If>
            );
            expect(html).toContain("main content");
            expect(html).not.toContain("fallback content");
        });

        test("fallback 可以是复杂组件", () => {
            const html = renderToString(
                <If
                    condition={false}
                    fallback={
                        <div className="error">
                            <h1>Error</h1>
                            <p>Something went wrong</p>
                        </div>
                    }
                >
                    <span>success</span>
                </If>
            );
            expect(html).toContain("Error");
            expect(html).toContain("Something went wrong");
        });

        test("未提供 fallback 时返回 null", () => {
            const html = renderToString(
                <If condition={false}>
                    <span>content</span>
                </If>
            );
            expect(html).toBe("");
        });
    });

    describe("render props 模式", () => {
        test("children 为函数时传递 condition 值", () => {
            const user = { name: "Alice", age: 30 };
            const html = renderToString(<If condition={user}>{(u) => <span>Hello, {u.name}</span>}</If>);
            expect(html).toContain("Hello");
            expect(html).toContain("Alice");
        });

        test("children 函数接收正确的值类型", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(<If condition={items}>{(arr) => <span>Count: {arr.length}</span>}</If>);
            expect(html).toContain("Count");
            expect(html).toContain("3");
        });

        test("condition 为 falsy 时不调用 children 函数", () => {
            let called = false;
            renderToString(
                <If<string | null> condition={null}>
                    {() => {
                        called = true;
                        return <span>should not render</span>;
                    }}
                </If>
            );
            expect(called).toBe(false);
        });

        test("render props 与 fallback 结合使用", () => {
            const user = null as { name: string } | null;
            const html = renderToString(
                <If<typeof user> condition={user} fallback={<span>Please login</span>}>
                    {(u) => <span>Welcome, {u.name}</span>}
                </If>
            );
            expect(html).toContain("Please login");
            expect(html).not.toContain("Welcome");
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 If 组件", () => {
            const html = renderToString(
                <If condition={true}>
                    <If condition={true}>
                        <span>nested content</span>
                    </If>
                </If>
            );
            expect(html).toContain("nested content");
        });

        test("外层 false 时内层不渲染", () => {
            const html = renderToString(
                <If condition={false}>
                    <If condition={true}>
                        <span>nested content</span>
                    </If>
                </If>
            );
            expect(html).not.toContain("nested content");
        });
    });

    describe("多个 children", () => {
        test("支持多个子元素", () => {
            const html = renderToString(
                <If condition={true}>
                    <span>first</span>
                    <span>second</span>
                    <span>third</span>
                </If>
            );
            expect(html).toContain("first");
            expect(html).toContain("second");
            expect(html).toContain("third");
        });

        test("支持文本节点", () => {
            const html = renderToString(<If condition={true}>plain text</If>);
            expect(html).toContain("plain text");
        });
    });
});
