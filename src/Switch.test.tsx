import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Default, Match, Switch } from "./Switch";

describe("Switch 组件", () => {
    describe("基本条件匹配", () => {
        test("匹配第一个为真的 Match", () => {
            const html = renderToString(
                <Switch>
                    <Match when={false}>
                        <span>first</span>
                    </Match>
                    <Match when={true}>
                        <span>second</span>
                    </Match>
                    <Match when={true}>
                        <span>third</span>
                    </Match>
                </Switch>
            );
            expect(html).toContain("second");
            expect(html).not.toContain("first");
            expect(html).not.toContain("third");
        });

        test("第一个 Match 为真时直接返回", () => {
            const html = renderToString(
                <Switch>
                    <Match when={true}>
                        <span>first</span>
                    </Match>
                    <Match when={true}>
                        <span>second</span>
                    </Match>
                </Switch>
            );
            expect(html).toContain("first");
            expect(html).not.toContain("second");
        });

        test("所有 Match 为假时返回空", () => {
            const html = renderToString(
                <Switch>
                    <Match when={false}>
                        <span>first</span>
                    </Match>
                    <Match when={false}>
                        <span>second</span>
                    </Match>
                </Switch>
            );
            expect(html).toBe("");
        });
    });

    describe("Default 组件", () => {
        test("所有 Match 为假时渲染 Default", () => {
            const html = renderToString(
                <Switch>
                    <Match when={false}>
                        <span>match</span>
                    </Match>
                    <Default>
                        <span>default</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("default");
            expect(html).not.toContain("match");
        });

        test("有 Match 匹配时不渲染 Default", () => {
            const html = renderToString(
                <Switch>
                    <Match when={true}>
                        <span>match</span>
                    </Match>
                    <Default>
                        <span>default</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("match");
            expect(html).not.toContain("default");
        });

        test("Default 可以放在任意位置", () => {
            const html = renderToString(
                <Switch>
                    <Default>
                        <span>default</span>
                    </Default>
                    <Match when={false}>
                        <span>match</span>
                    </Match>
                </Switch>
            );
            expect(html).toContain("default");
        });
    });

    describe("fallback 属性", () => {
        test("使用 fallback 作为默认内容", () => {
            const html = renderToString(
                <Switch fallback={<span>fallback</span>}>
                    <Match when={false}>
                        <span>match</span>
                    </Match>
                </Switch>
            );
            expect(html).toContain("fallback");
        });

        test("Default 优先于 fallback", () => {
            const html = renderToString(
                <Switch fallback={<span>fallback</span>}>
                    <Match when={false}>
                        <span>match</span>
                    </Match>
                    <Default>
                        <span>default</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("default");
            expect(html).not.toContain("fallback");
        });
    });

    describe("render props 模式", () => {
        test("Match 支持 render props", () => {
            const user = { name: "Alice" };
            const html = renderToString(
                <Switch>
                    <Match when={user}>{(u) => <span>Hello, {u.name}</span>}</Match>
                </Switch>
            );
            expect(html).toContain("Hello");
            expect(html).toContain("Alice");
        });

        test("条件值传递给 render props", () => {
            const data = { count: 42 };
            const html = renderToString(
                <Switch>
                    <Match when={null as { count: number } | null}>{(d) => <span>Count: {d.count}</span>}</Match>
                    <Match when={data}>{(d) => <span>Data: {d.count}</span>}</Match>
                </Switch>
            );
            expect(html).toContain("Data");
            expect(html).toContain("42");
        });
    });

    describe("truthy/falsy 值处理", () => {
        test("0 被视为 falsy", () => {
            const html = renderToString(
                <Switch>
                    <Match when={0}>
                        <span>zero</span>
                    </Match>
                    <Default>
                        <span>default</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("default");
        });

        test("空字符串被视为 falsy", () => {
            const html = renderToString(
                <Switch>
                    <Match when={""}>
                        <span>empty</span>
                    </Match>
                    <Default>
                        <span>default</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("default");
        });

        test("非空对象被视为 truthy", () => {
            const html = renderToString(
                <Switch>
                    <Match when={{}}>
                        <span>object</span>
                    </Match>
                    <Default>
                        <span>default</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("object");
        });

        test("空数组被视为 truthy", () => {
            const html = renderToString(
                <Switch>
                    <Match when={[]}>
                        <span>array</span>
                    </Match>
                    <Default>
                        <span>default</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("array");
        });
    });

    describe("实际使用场景", () => {
        test("状态机模式", () => {
            type Status = "loading" | "error" | "success";
            const status: Status = "error";

            const html = renderToString(
                <Switch>
                    {/* @ts-expect-error 此比较似乎是无意的，因为类型“"error"”和“"loading"”没有重叠。 */}
                    <Match when={status === "loading"}>
                        <span>Loading...</span>
                    </Match>
                    <Match when={status === "error"}>
                        <span>Error occurred</span>
                    </Match>
                    {/* @ts-expect-error 此比较似乎是无意的，因为类型“"error"”和“"success"”没有重叠。 */}
                    <Match when={status === "success"}>
                        <span>Success!</span>
                    </Match>
                </Switch>
            );
            expect(html).toContain("Error occurred");
        });

        test("类型守卫模式", () => {
            type Result = { type: "user"; name: string } | { type: "guest"; id: number } | null;
            const result: Result = { type: "user", name: "Bob" };

            const html = renderToString(
                <Switch>
                    <Match when={result?.type === "user" ? result : null}>
                        {(user) => <span>User: {user.name}</span>}
                    </Match>
                    {/* @ts-expect-error 此比较似乎是无意的，因为类型“"user"”和“"guest"”没有重叠。 */}
                    <Match when={result?.type === "guest" ? result : null}>
                        {/* @ts-expect-error 类型“never”上不存在属性“id”。 */}
                        {(guest) => <span>Guest: {guest.id}</span>}
                    </Match>
                    <Default>
                        <span>Unknown</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("User");
            expect(html).toContain("Bob");
        });

        test("多条件替代嵌套 If", () => {
            const isAdmin = false;
            const isModerator = true;
            const isUser = true;

            const html = renderToString(
                <Switch>
                    <Match when={isAdmin}>
                        <span>Admin Panel</span>
                    </Match>
                    <Match when={isModerator}>
                        <span>Moderator Panel</span>
                    </Match>
                    <Match when={isUser}>
                        <span>User Dashboard</span>
                    </Match>
                    <Default>
                        <span>Login Required</span>
                    </Default>
                </Switch>
            );
            expect(html).toContain("Moderator Panel");
        });
    });
});
