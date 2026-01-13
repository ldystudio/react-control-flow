import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Await } from "./Await";

// 每个测试后清理
afterEach(() => {
    cleanup();
});

// 创建一个可控的 Promise
function createControllablePromise<T>() {
    let resolve: (value: T) => void = () => {};
    let reject: (error: unknown) => void = () => {};
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

// 创建延迟 Promise
function delay<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// 创建延迟失败的 Promise
function delayReject(ms: number, error: unknown): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(error), ms));
}

describe("Await 组件", () => {
    describe("pending 状态", () => {
        test("Promise pending 时显示 loading", () => {
            const { promise } = createControllablePromise<string>();
            render(
                <Await promise={promise} loading={<span>Loading...</span>}>
                    {(data) => <span>{data}</span>}
                </Await>
            );
            expect(screen.getByText("Loading...")).toBeTruthy();
        });

        test("未提供 loading 时显示空内容", () => {
            const { promise } = createControllablePromise<string>();
            const { container } = render(<Await promise={promise}>{(data) => <span>{data}</span>}</Await>);
            expect(container.textContent).toBe("");
        });

        test("loading 可以是复杂组件", () => {
            const { promise } = createControllablePromise<string>();
            render(
                <Await
                    promise={promise}
                    loading={
                        <div data-testid="loader">
                            <span>Please wait</span>
                        </div>
                    }
                >
                    {(data) => <span>{data}</span>}
                </Await>
            );
            expect(screen.getByTestId("loader")).toBeTruthy();
            expect(screen.getByText("Please wait")).toBeTruthy();
        });
    });

    describe("fulfilled 状态", () => {
        test("Promise resolve 后渲染 children", async () => {
            const promise = delay(10, "Hello World");
            render(
                <Await promise={promise} loading={<span>Loading...</span>}>
                    {(data) => <span>{data}</span>}
                </Await>
            );

            expect(screen.getByText("Loading...")).toBeTruthy();

            await waitFor(() => {
                expect(screen.getByText("Hello World")).toBeTruthy();
            });
        });

        test("children 函数接收 Promise 的值", async () => {
            const userData = { name: "Alice", age: 30 };
            const promise = delay(10, userData);

            render(
                <Await promise={promise} loading={<span>Loading...</span>}>
                    {(user) => (
                        <div>
                            <span>Name: {user.name}</span>
                            <span>Age: {user.age}</span>
                        </div>
                    )}
                </Await>
            );

            await waitFor(() => {
                expect(screen.getByText("Name: Alice")).toBeTruthy();
                expect(screen.getByText("Age: 30")).toBeTruthy();
            });
        });

        test("静态 children 不需要 Promise 的值", async () => {
            const promise = delay(10, "done");

            render(
                <Await promise={promise} loading={<span>Loading...</span>}>
                    <span>Content loaded</span>
                </Await>
            );

            await waitFor(() => {
                expect(screen.getByText("Content loaded")).toBeTruthy();
            });
        });
    });

    describe("rejected 状态", () => {
        test("Promise reject 后显示 error", async () => {
            const promise = delayReject(10, new Error("Failed"));

            render(
                <Await promise={promise} loading={<span>Loading...</span>} error={<span>Error occurred</span>}>
                    {() => <span>Success</span>}
                </Await>
            );

            await waitFor(() => {
                expect(screen.getByText("Error occurred")).toBeTruthy();
            });
        });

        test("error 函数接收错误对象", async () => {
            const promise = delayReject(10, new Error("Network error"));

            render(
                <Await
                    promise={promise}
                    loading={<span>Loading...</span>}
                    error={(err) => <span>Error: {(err as Error).message}</span>}
                >
                    {() => <span>Success</span>}
                </Await>
            );

            await waitFor(() => {
                expect(screen.getByText("Error: Network error")).toBeTruthy();
            });
        });

        test("未提供 error 时显示空内容", async () => {
            const promise = delayReject(10, new Error("Failed"));

            const { container } = render(
                <Await promise={promise} loading={<span>Loading...</span>}>
                    {() => <span>Success</span>}
                </Await>
            );

            await waitFor(() => {
                expect(screen.queryByText("Loading...")).toBeNull();
                expect(screen.queryByText("Success")).toBeNull();
            });
            expect(container.textContent).toBe("");
        });
    });

    describe("同步值", () => {
        test("传入非 Promise 值时直接渲染", () => {
            const data = { name: "Bob" };

            render(
                <Await promise={data} loading={<span>Loading...</span>}>
                    {(user) => <span>Hello, {user.name}</span>}
                </Await>
            );

            // 应该立即渲染，不显示 loading
            expect(screen.queryByText("Loading...")).toBeNull();
            expect(screen.getByText("Hello, Bob")).toBeTruthy();
        });

        test("传入字符串时直接渲染", () => {
            render(
                <Await promise="Direct value" loading={<span>Loading...</span>}>
                    {(value) => <span>{value}</span>}
                </Await>
            );

            expect(screen.getByText("Direct value")).toBeTruthy();
        });

        test("传入数组时直接渲染", () => {
            const items = ["a", "b", "c"];

            render(
                <Await promise={items} loading={<span>Loading...</span>}>
                    {(arr) => <span>Count: {arr.length}</span>}
                </Await>
            );

            expect(screen.getByText("Count: 3")).toBeTruthy();
        });
    });

    describe("Promise 变化", () => {
        test("Promise 变化时重新等待", async () => {
            const { promise: promise1, resolve: resolve1 } = createControllablePromise<string>();
            const { promise: promise2, resolve: resolve2 } = createControllablePromise<string>();

            const { rerender } = render(
                <Await promise={promise1} loading={<span>Loading...</span>}>
                    {(data) => <span>Data: {data}</span>}
                </Await>
            );

            expect(screen.getByText("Loading...")).toBeTruthy();

            resolve1("First");
            await waitFor(() => {
                expect(screen.getByText("Data: First")).toBeTruthy();
            });

            // 切换到新的 Promise
            rerender(
                <Await promise={promise2} loading={<span>Loading...</span>}>
                    {(data) => <span>Data: {data}</span>}
                </Await>
            );

            // 应该回到 loading 状态
            expect(screen.getByText("Loading...")).toBeTruthy();

            resolve2("Second");
            await waitFor(() => {
                expect(screen.getByText("Data: Second")).toBeTruthy();
            });
        });
    });

    describe("复杂场景", () => {
        test("嵌套 Await", async () => {
            const userPromise = delay(10, { id: 1, name: "Alice" });
            const postsPromise = delay(20, [{ title: "Post 1" }, { title: "Post 2" }]);

            render(
                <Await promise={userPromise} loading={<span>Loading user...</span>}>
                    {(user) => (
                        <div>
                            <h1>User: {user.name}</h1>
                            <Await promise={postsPromise} loading={<span>Loading posts...</span>}>
                                {(posts) => (
                                    <ul>
                                        {posts.map((p) => (
                                            <li key={p.title}>{p.title}</li>
                                        ))}
                                    </ul>
                                )}
                            </Await>
                        </div>
                    )}
                </Await>
            );

            expect(screen.getByText("Loading user...")).toBeTruthy();

            await waitFor(() => {
                expect(screen.getByText("User: Alice")).toBeTruthy();
            });

            await waitFor(() => {
                expect(screen.getByText("Post 1")).toBeTruthy();
                expect(screen.getByText("Post 2")).toBeTruthy();
            });
        });

        test("配合缓存使用", () => {
            const cache = { data: "Cached data" };

            // 有缓存时直接使用缓存
            render(
                <Await promise={cache.data} loading={<span>Loading...</span>}>
                    {(data) => <span>{data}</span>}
                </Await>
            );

            expect(screen.queryByText("Loading...")).toBeNull();
            expect(screen.getByText("Cached data")).toBeTruthy();
        });
    });
});
