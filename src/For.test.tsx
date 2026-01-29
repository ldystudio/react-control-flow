import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { For } from "./For";

describe("For 组件", () => {
    describe("基本列表渲染", () => {
        test("渲染数组中的所有元素", () => {
            const items = ["apple", "banana", "cherry"];
            const html = renderToString(<For each={items}>{(item) => <li>{item}</li>}</For>);
            expect(html).toContain("apple");
            expect(html).toContain("banana");
            expect(html).toContain("cherry");
        });

        test("children 函数接收正确的 index", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(
                <For each={items}>
                    {(item, index) => (
                        <span>
                            {index}: {item}
                        </span>
                    )}
                </For>
            );
            expect(html).toContain("0");
            expect(html).toContain("a");
            expect(html).toContain("1");
            expect(html).toContain("b");
            expect(html).toContain("2");
            expect(html).toContain("c");
        });

        test("渲染对象数组", () => {
            const users = [
                { id: 1, name: "Alice" },
                { id: 2, name: "Bob" },
            ];
            const html = renderToString(<For each={users}>{(user) => <div>{user.name}</div>}</For>);
            expect(html).toContain("Alice");
            expect(html).toContain("Bob");
        });
    });

    describe("空数组和 null/undefined 处理", () => {
        test("空数组返回空内容", () => {
            const html = renderToString(<For each={[]}>{(item: string) => <span>{item}</span>}</For>);
            expect(html).toBe("");
        });

        test("null 返回空内容", () => {
            const html = renderToString(<For each={null}>{(item: string) => <span>{item}</span>}</For>);
            expect(html).toBe("");
        });

        test("undefined 返回空内容", () => {
            const html = renderToString(<For each={undefined}>{(item: string) => <span>{item}</span>}</For>);
            expect(html).toBe("");
        });
    });

    describe("fallback 功能", () => {
        test("空数组时渲染 fallback", () => {
            const html = renderToString(
                <For each={[] as string[]} fallback={<div>No items found</div>}>
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(html).toContain("No items found");
        });

        test("null 时渲染 fallback", () => {
            const html = renderToString(
                <For each={null} fallback={<div>Loading...</div>}>
                    {(item: string) => <span>{item}</span>}
                </For>
            );
            expect(html).toContain("Loading...");
        });

        test("有数据时不渲染 fallback", () => {
            const html = renderToString(
                <For each={["item"]} fallback={<div>Empty</div>}>
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(html).toContain("item");
            expect(html).not.toContain("Empty");
        });

        test("fallback 可以是复杂组件", () => {
            const html = renderToString(
                <For
                    each={[] as string[]}
                    fallback={
                        <div className="empty-state">
                            <h2>No Results</h2>
                            <p>Try adjusting your search</p>
                        </div>
                    }
                >
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(html).toContain("No Results");
            expect(html).toContain("Try adjusting your search");
        });
    });

    describe("keyExtractor 功能", () => {
        test("使用 keyExtractor 提取 key", () => {
            const items = [
                { id: "a1", value: "first" },
                { id: "b2", value: "second" },
            ];
            const html = renderToString(
                <For each={items} keyExtractor={(item) => item.id}>
                    {(item) => <span>{item.value}</span>}
                </For>
            );
            expect(html).toContain("first");
            expect(html).toContain("second");
        });

        test("keyExtractor 可以使用 index", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(
                <For each={items} keyExtractor={(item, index) => `${item}-${index}`}>
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(html).toContain("a");
            expect(html).toContain("b");
            expect(html).toContain("c");
        });

        test("未提供 keyExtractor 时默认使用 index", () => {
            const items = ["x", "y", "z"];
            const html = renderToString(<For each={items}>{(item) => <span>{item}</span>}</For>);
            expect(html).toContain("x");
            expect(html).toContain("y");
            expect(html).toContain("z");
        });
    });

    describe("复杂数据类型", () => {
        test("渲染嵌套对象", () => {
            const data = [{ user: { profile: { name: "Alice" } } }, { user: { profile: { name: "Bob" } } }];
            const html = renderToString(<For each={data}>{(item) => <span>{item.user.profile.name}</span>}</For>);
            expect(html).toContain("Alice");
            expect(html).toContain("Bob");
        });

        test("渲染数字数组", () => {
            const numbers = [1, 2, 3, 4, 5];
            const html = renderToString(<For each={numbers}>{(num) => <span>{num * 2}</span>}</For>);
            expect(html).toContain("2");
            expect(html).toContain("4");
            expect(html).toContain("6");
            expect(html).toContain("8");
            expect(html).toContain("10");
        });

        test("渲染 boolean 数组", () => {
            const flags = [true, false, true];
            const html = renderToString(
                <For each={flags}>
                    {(flag, index) => (
                        <span>
                            {index}: {flag ? "yes" : "no"}
                        </span>
                    )}
                </For>
            );
            expect(html).toContain("0");
            expect(html).toContain("yes");
            expect(html).toContain("1");
            expect(html).toContain("no");
        });
    });

    describe("readonly 数组支持", () => {
        test("支持 readonly 数组", () => {
            const items = ["a", "b", "c"] as const;
            const html = renderToString(<For each={items}>{(item) => <span>{item}</span>}</For>);
            expect(html).toContain("a");
            expect(html).toContain("b");
            expect(html).toContain("c");
        });

        test("支持 Object.freeze 的数组", () => {
            const items = Object.freeze(["x", "y", "z"]);
            const html = renderToString(<For each={items}>{(item) => <span>{item}</span>}</For>);
            expect(html).toContain("x");
            expect(html).toContain("y");
            expect(html).toContain("z");
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 For 组件", () => {
            const matrix = [
                [1, 2],
                [3, 4],
            ];
            const html = renderToString(
                <For each={matrix}>
                    {(row, rowIndex) => (
                        <div>
                            <For each={row}>
                                {(cell, colIndex) => (
                                    <span>
                                        [{rowIndex},{colIndex}]:{cell}
                                    </span>
                                )}
                            </For>
                        </div>
                    )}
                </For>
            );
            expect(html).toContain("[");
            expect(html).toContain("0");
            expect(html).toContain("1");
            expect(html).toContain("2");
            expect(html).toContain("3");
            expect(html).toContain("4");
        });

        test("嵌套 For 各自独立的 fallback", () => {
            const data = [{ items: [] as string[] }, { items: ["a", "b"] }];
            const html = renderToString(
                <For each={data}>
                    {(group, groupIndex) => (
                        <div>
                            Group {groupIndex}:{" "}
                            <For each={group.items} fallback={<span>empty</span>}>
                                {(item) => <span>{item}</span>}
                            </For>
                        </div>
                    )}
                </For>
            );
            expect(html).toContain("Group");
            expect(html).toContain("0");
            expect(html).toContain("empty");
            expect(html).toContain("1");
            expect(html).toContain("a");
            expect(html).toContain("b");
        });
    });

    describe("children 返回值类型", () => {
        test("children 可以返回 null", () => {
            const items = [1, 2, 3];
            const html = renderToString(<For each={items}>{(num) => (num % 2 === 0 ? <span>{num}</span> : null)}</For>);
            expect(html).not.toContain("1");
            expect(html).toContain("2");
            expect(html).not.toContain("3");
        });

        test("children 可以返回字符串", () => {
            const items = ["hello", "world"];
            const html = renderToString(<For each={items}>{(item) => item}</For>);
            expect(html).toContain("hello");
            expect(html).toContain("world");
        });

        test("children 可以返回数字", () => {
            const items = [1, 2, 3];
            const html = renderToString(<For each={items}>{(num) => num}</For>);
            expect(html).toContain("1");
            expect(html).toContain("2");
            expect(html).toContain("3");
        });

        test("children 可以返回 Fragment", () => {
            const items = ["a", "b"];
            const html = renderToString(
                <For each={items}>
                    {(item) => (
                        <span>
                            {item}
                            <span>!</span>
                        </span>
                    )}
                </For>
            );
            expect(html).toContain("a");
            expect(html).toContain("b");
            expect(html).toMatch(/!.*!/);
        });
    });

    describe("大数据量", () => {
        test("能处理大数组", () => {
            const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
            const html = renderToString(<For each={items}>{(item) => <span>{item}</span>}</For>);
            expect(html).toContain("item-0");
            expect(html).toContain("item-500");
            expect(html).toContain("item-999");
        });
    });

    describe("wrapper 功能", () => {
        test("使用 wrapper 包装所有元素", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(
                <For each={items} wrapper={<ul className="list" />}>
                    {(item) => <li>{item}</li>}
                </For>
            );
            expect(html).toContain('<ul class="list">');
            expect(html).toContain("</ul>");
            expect(html).toContain("<li>a</li>");
            expect(html).toContain("<li>b</li>");
            expect(html).toContain("<li>c</li>");
        });

        test("wrapper 可以是带属性的元素", () => {
            const items = [1, 2, 3];
            const html = renderToString(
                <For each={items} wrapper={<div id="container" data-testid="wrapper" />}>
                    {(num) => <span>{num}</span>}
                </For>
            );
            expect(html).toContain('id="container"');
            expect(html).toContain('data-testid="wrapper"');
        });

        test("未提供 wrapper 时直接返回元素数组", () => {
            const items = ["x", "y"];
            const html = renderToString(<For each={items}>{(item) => <span>{item}</span>}</For>);
            // 没有额外的包装元素
            expect(html).toBe("<span>x</span><span>y</span>");
        });

        test("空数组时 wrapper 不渲染，显示 fallback", () => {
            const html = renderToString(
                <For each={[] as string[]} wrapper={<ul />} fallback={<div>Empty</div>}>
                    {(item) => <li>{item}</li>}
                </For>
            );
            expect(html).toContain("Empty");
            expect(html).not.toContain("<ul>");
        });

        test("wrapper 与 keyExtractor 配合使用", () => {
            const users = [
                { id: "u1", name: "Alice" },
                { id: "u2", name: "Bob" },
            ];
            const html = renderToString(
                <For each={users} keyExtractor={(u) => u.id} wrapper={<section className="users" />}>
                    {(user) => <div>{user.name}</div>}
                </For>
            );
            expect(html).toContain('<section class="users">');
            expect(html).toContain("Alice");
            expect(html).toContain("Bob");
        });

        test("嵌套 For 各自独立的 wrapper", () => {
            const data = [
                { group: "A", items: [1, 2] },
                { group: "B", items: [3, 4] },
            ];
            const html = renderToString(
                <For each={data} wrapper={<div className="outer" />}>
                    {(group) => (
                        <div>
                            {group.group}:
                            <For each={group.items} wrapper={<span className="inner" />}>
                                {(item) => <em>{item}</em>}
                            </For>
                        </div>
                    )}
                </For>
            );
            expect(html).toContain('class="outer"');
            expect(html).toContain('class="inner"');
        });
    });

    describe("reverse 功能", () => {
        test("倒序渲染数组元素", () => {
            const items = ["a", "b", "c"];
            const html = renderToString(
                <For each={items} reverse>
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(html).toBe("<span>c</span><span>b</span><span>a</span>");
        });

        test("reverse 时 index 保持原数组位置", () => {
            const items = ["first", "second", "third"];
            const results: Array<{ item: string; index: number }> = [];
            renderToString(
                <For each={items} reverse>
                    {(item, index) => {
                        results.push({ item, index });
                        return (
                            <span>
                                {item}-{index}
                            </span>
                        );
                    }}
                </For>
            );
            expect(results).toEqual([
                { item: "third", index: 2 },
                { item: "second", index: 1 },
                { item: "first", index: 0 },
            ]);
        });

        test("reverse 为 false 时正常顺序", () => {
            const items = [1, 2, 3];
            const html = renderToString(
                <For each={items} reverse={false}>
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(html).toBe("<span>1</span><span>2</span><span>3</span>");
        });

        test("reverse 与 keyExtractor 配合使用", () => {
            const users = [
                { id: "a", name: "Alice" },
                { id: "b", name: "Bob" },
                { id: "c", name: "Carol" },
            ];
            const html = renderToString(
                <For each={users} reverse keyExtractor={(u) => u.id}>
                    {(user) => <div>{user.name}</div>}
                </For>
            );
            // 倒序：Carol, Bob, Alice
            expect(html).toBe("<div>Carol</div><div>Bob</div><div>Alice</div>");
        });

        test("reverse 与 wrapper 配合使用", () => {
            const items = ["x", "y", "z"];
            const html = renderToString(
                <For each={items} reverse wrapper={<ul className="reversed-list" />}>
                    {(item) => <li>{item}</li>}
                </For>
            );
            expect(html).toContain('class="reversed-list"');
            expect(html).toBe('<ul class="reversed-list"><li>z</li><li>y</li><li>x</li></ul>');
        });

        test("空数组时 reverse 不影响 fallback", () => {
            const html = renderToString(
                <For each={[] as string[]} reverse fallback={<div>Empty</div>}>
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(html).toContain("Empty");
        });

        test("reverse 不修改原数组", () => {
            const original = [1, 2, 3];
            const copy = [...original];
            renderToString(
                <For each={original} reverse>
                    {(item) => <span>{item}</span>}
                </For>
            );
            expect(original).toEqual(copy);
        });
    });

    describe("children array 参数", () => {
        test("传递原数组给 children", () => {
            const items = ["a", "b", "c"];
            let receivedArray: string[] | readonly string[] | undefined;
            renderToString(
                <For each={items}>
                    {(item, _index, array) => {
                        receivedArray = array;
                        return <span>{item}</span>;
                    }}
                </For>
            );
            expect(receivedArray).toBe(items);
        });

        test("使用 array 判断首尾元素", () => {
            const items = ["first", "middle", "last"];
            const html = renderToString(
                <For each={items}>
                    {(item, index, array) => (
                        <span>
                            {index === 0 ? "[start]" : ""}
                            {item}
                            {index === array.length - 1 ? "[end]" : ""}
                        </span>
                    )}
                </For>
            );
            expect(html).toContain("[start]");
            expect(html).toContain("first");
            expect(html).toContain("[end]");
            expect(html).toContain("last");
        });

        test("array 与 reverse 配合使用时传递原数组", () => {
            const items = [1, 2, 3];
            const results: Array<{ item: number; index: number; arrayLength: number }> = [];
            renderToString(
                <For each={items} reverse>
                    {(item, index, array) => {
                        results.push({ item, index, arrayLength: array.length });
                        return <span>{item}</span>;
                    }}
                </For>
            );
            expect(results).toEqual([
                { item: 3, index: 2, arrayLength: 3 },
                { item: 2, index: 1, arrayLength: 3 },
                { item: 1, index: 0, arrayLength: 3 },
            ]);
        });

        test("显示项目位置信息", () => {
            const items = ["A", "B", "C", "D"];
            const html = renderToString(
                <For each={items}>
                    {(item, index, array) => (
                        <div>
                            {item} ({index + 1}/{array.length})
                        </div>
                    )}
                </For>
            );
            expect(html).toContain("A");
            expect(html).toContain("1");
            expect(html).toContain("4");
        });

        test("使用 array 计算相邻元素", () => {
            const numbers = [10, 20, 30];
            const results: Array<{ num: number; next: number | undefined }> = [];
            renderToString(
                <For each={numbers}>
                    {(num, index, array) => {
                        const next = array[index + 1];
                        results.push({ num, next });
                        return <span>{num}</span>;
                    }}
                </For>
            );
            expect(results).toEqual([
                { num: 10, next: 20 },
                { num: 20, next: 30 },
                { num: 30, next: undefined },
            ]);
        });
    });
});
