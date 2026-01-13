import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import type { QueryResult } from "./QueryBoundary";
import { QueryBoundary } from "./QueryBoundary";

describe("QueryBoundary 组件", () => {
    describe("query 为 null/undefined", () => {
        test("query 为 null 时不渲染任何内容", () => {
            const html = renderToString(
                <QueryBoundary query={null}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toBe("");
        });

        test("query 为 undefined 时不渲染任何内容", () => {
            const html = renderToString(
                <QueryBoundary query={undefined}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toBe("");
        });
    });

    describe("加载状态", () => {
        test("isPending 为 true 时渲染 loading", () => {
            const query: QueryResult<string> = { isPending: true };
            const html = renderToString(
                <QueryBoundary query={query} loading={<span>Loading...</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("Loading...");
            expect(html).not.toContain("content");
        });

        test("isPending 为 true 且未提供 loading 时渲染空内容", () => {
            const query: QueryResult<string> = { isPending: true };
            const html = renderToString(
                <QueryBoundary query={query}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toBe("");
        });

        test("loading 可以是复杂组件", () => {
            const query: QueryResult<string> = { isPending: true };
            const html = renderToString(
                <QueryBoundary
                    query={query}
                    loading={
                        <div className="spinner">
                            <span>Please wait</span>
                        </div>
                    }
                >
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("spinner");
            expect(html).toContain("Please wait");
        });
    });

    describe("错误状态", () => {
        test("isError 为 true 且无数据时渲染 error", () => {
            const query: QueryResult<string> = { isError: true };
            const html = renderToString(
                <QueryBoundary query={query} error={<span>Error occurred</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("Error occurred");
            expect(html).not.toContain("content");
        });

        test("isError 为 true 但有缓存数据时渲染 children", () => {
            const query: QueryResult<string[]> = {
                isError: true,
                data: ["cached"],
            };
            const html = renderToString(
                <QueryBoundary query={query} error={<span>Error occurred</span>}>
                    {(data) => <span>Data: {data.join(",")}</span>}
                </QueryBoundary>
            );
            expect(html).toContain("Data:");
            expect(html).toContain("cached");
            expect(html).not.toContain("Error occurred");
        });

        test("isError 为 true 且未提供 error 时渲染空内容", () => {
            const query: QueryResult<string> = { isError: true };
            const html = renderToString(
                <QueryBoundary query={query}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toBe("");
        });
    });

    describe("空数据状态", () => {
        test("data 为 undefined 时渲染 empty", () => {
            const query: QueryResult<string[]> = { data: undefined };
            const html = renderToString(
                <QueryBoundary query={query} empty={<span>No data</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("No data");
        });

        test("data 为 null 时渲染 empty", () => {
            const query: QueryResult<string[] | null> = { data: null };
            const html = renderToString(
                <QueryBoundary query={query} empty={<span>No data</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("No data");
        });

        test("data 为空数组时渲染 empty", () => {
            const query: QueryResult<string[]> = { data: [] };
            const html = renderToString(
                <QueryBoundary query={query} empty={<span>Empty list</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("Empty list");
        });

        test("data 为空对象时渲染 empty", () => {
            const query: QueryResult<Record<string, unknown>> = { data: {} };
            const html = renderToString(
                <QueryBoundary query={query} empty={<span>Empty object</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("Empty object");
        });

        test("query.isEmpty 优先于 isEmptyFn 判断", () => {
            const query: QueryResult<string[]> = {
                data: ["item"],
                isEmpty: true,
            };
            const html = renderToString(
                <QueryBoundary query={query} empty={<span>Empty by flag</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("Empty by flag");
        });

        test("未提供 empty 时渲染空内容", () => {
            const query: QueryResult<string[]> = { data: [] };
            const html = renderToString(
                <QueryBoundary query={query}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toBe("");
        });
    });

    describe("自定义 isEmptyFn", () => {
        test("使用自定义 isEmptyFn 判断空数据", () => {
            const query: QueryResult<{ items: string[] }> = {
                data: { items: [] },
            };
            const html = renderToString(
                <QueryBoundary query={query} empty={<span>No items</span>} isEmptyFn={(data) => !data?.items?.length}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("No items");
        });

        test("自定义 isEmptyFn 返回 false 时渲染 children", () => {
            const query: QueryResult<{ items: string[] }> = {
                data: { items: ["a", "b"] },
            };
            const html = renderToString(
                <QueryBoundary query={query} empty={<span>No items</span>} isEmptyFn={(data) => !data?.items?.length}>
                    {(data) => <span>Count: {data.items.length}</span>}
                </QueryBoundary>
            );
            expect(html).toContain("Count:");
            expect(html).toContain("2");
            expect(html).not.toContain("No items");
        });
    });

    describe("成功状态", () => {
        test("有数据时渲染 children", () => {
            const query: QueryResult<string[]> = { data: ["a", "b", "c"] };
            const html = renderToString(
                <QueryBoundary query={query}>
                    <span>Has data</span>
                </QueryBoundary>
            );
            expect(html).toContain("Has data");
        });

        test("支持 render props 模式", () => {
            const query: QueryResult<{ name: string }> = {
                data: { name: "Alice" },
            };
            const html = renderToString(
                <QueryBoundary query={query}>{(data) => <span>Hello, {data.name}</span>}</QueryBoundary>
            );
            expect(html).toContain("Hello,");
            expect(html).toContain("Alice");
        });

        test("render props 接收正确的数据类型", () => {
            const query: QueryResult<number[]> = { data: [1, 2, 3] };
            const html = renderToString(
                <QueryBoundary query={query}>
                    {(data) => <span>Sum: {data.reduce((a, b) => a + b, 0)}</span>}
                </QueryBoundary>
            );
            expect(html).toContain("Sum:");
            expect(html).toContain("6");
        });
    });

    describe("状态优先级", () => {
        test("isPending 优先于 isError", () => {
            const query: QueryResult<string> = {
                isPending: true,
                isError: true,
            };
            const html = renderToString(
                <QueryBoundary query={query} loading={<span>Loading</span>} error={<span>Error</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("Loading");
            expect(html).not.toContain("Error");
        });

        test("isError 优先于 isEmpty（无缓存数据时）", () => {
            const query: QueryResult<string[]> = {
                isError: true,
                isEmpty: true,
            };
            const html = renderToString(
                <QueryBoundary query={query} error={<span>Error</span>} empty={<span>Empty</span>}>
                    <span>content</span>
                </QueryBoundary>
            );
            expect(html).toContain("Error");
            expect(html).not.toContain("Empty");
        });
    });

    describe("复杂场景", () => {
        test("模拟 react-query 完整查询结果", () => {
            interface User {
                id: number;
                name: string;
            }
            const query: QueryResult<User[]> = {
                data: [
                    { id: 1, name: "Alice" },
                    { id: 2, name: "Bob" },
                ],
                isPending: false,
                isError: false,
            };
            const html = renderToString(
                <QueryBoundary
                    query={query}
                    loading={<span>Loading users...</span>}
                    error={<span>Failed to load</span>}
                    empty={<span>No users found</span>}
                >
                    {(users) => (
                        <ul>
                            {users.map((u) => (
                                <li key={u.id}>{u.name}</li>
                            ))}
                        </ul>
                    )}
                </QueryBoundary>
            );
            expect(html).toContain("Alice");
            expect(html).toContain("Bob");
        });

        test("支持嵌套 QueryBoundary", () => {
            const outerQuery: QueryResult<{ id: number }> = {
                data: { id: 1 },
            };
            const innerQuery: QueryResult<string[]> = {
                data: ["nested"],
            };
            const html = renderToString(
                <QueryBoundary query={outerQuery}>
                    {(outer) => (
                        <QueryBoundary query={innerQuery}>
                            {(inner) => (
                                <span>
                                    ID: {outer.id}, Data: {inner.join(",")}
                                </span>
                            )}
                        </QueryBoundary>
                    )}
                </QueryBoundary>
            );
            expect(html).toContain("ID:");
            expect(html).toContain("1");
            expect(html).toContain("Data:");
            expect(html).toContain("nested");
        });
    });
});
