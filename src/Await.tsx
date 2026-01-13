import { type ReactNode, useEffect, useState } from "react";

/** Promise state | Promise 的状态 */
type PromiseState<T> =
    | { status: "pending" }
    | { status: "fulfilled"; value: T }
    | { status: "rejected"; error: unknown };

export interface AwaitProps<T> {
    /** Promise to wait for | 要等待的 Promise */
    promise: Promise<T> | T;
    /** Content to show when Promise is pending | Promise pending 时显示的内容 */
    loading?: ReactNode;
    /** Content to show when Promise is rejected | Promise rejected 时显示的内容 */
    error?: ReactNode | ((error: unknown) => ReactNode);
    /** Content to render when Promise is fulfilled | Promise fulfilled 时渲染的内容 */
    children: ReactNode | ((data: T) => ReactNode);
}

/**
 * Async await component, handles various Promise states
 *
 * 异步等待组件，用于处理 Promise 的各种状态
 *
 * @example
 * // Basic usage | 基础用法
 * <Await promise={fetchUser()} loading={<Spinner />}>
 *   {(user) => <UserProfile user={user} />}
 * </Await>
 *
 * @example
 * // With error handling | 带错误处理
 * <Await
 *   promise={fetchData()}
 *   loading={<Loading />}
 *   error={(err) => <ErrorMessage message={err.message} />}
 * >
 *   {(data) => <DataView data={data} />}
 * </Await>
 *
 * @example
 * // Static children (doesn't need Promise value) | 静态 children（不需要 Promise 的值）
 * <Await promise={initApp()} loading={<SplashScreen />}>
 *   <App />
 * </Await>
 *
 * @example
 * // Renders immediately for non-Promise values (sync values) | 传入非 Promise 值时直接渲染（同步值）
 * <Await promise={cachedData ?? fetchData()} loading={<Spinner />}>
 *   {(data) => <DataView data={data} />}
 * </Await>
 */
export function Await<T>({ promise, loading = null, error = null, children }: AwaitProps<T>): ReactNode {
    const [state, setState] = useState<PromiseState<T>>(() => {
        // 如果传入的不是 Promise，直接设置为 fulfilled
        if (!(promise instanceof Promise)) {
            return { status: "fulfilled", value: promise };
        }
        return { status: "pending" };
    });

    useEffect(() => {
        // 如果不是 Promise，不需要处理
        if (!(promise instanceof Promise)) {
            setState({ status: "fulfilled", value: promise });
            return;
        }

        // 重置状态
        setState({ status: "pending" });

        let cancelled = false;

        promise
            .then((value) => {
                if (!cancelled) {
                    setState({ status: "fulfilled", value });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({ status: "rejected", error: err });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [promise]);

    // pending 状态
    if (state.status === "pending") {
        return loading;
    }

    // rejected 状态
    if (state.status === "rejected") {
        if (typeof error === "function") {
            return error(state.error);
        }
        return error;
    }

    // fulfilled 状态
    if (typeof children === "function") {
        return children(state.value);
    }

    return children;
}
