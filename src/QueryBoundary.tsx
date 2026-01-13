import type { ReactNode } from "react";

/** Query result object type definition | 查询结果对象的类型定义 */
export interface QueryResult<T> {
    /** Data returned by query | 查询返回的数据 */
    data?: T;
    /** Whether loading is in progress | 是否正在加载中 */
    isPending?: boolean;
    /** Whether an error occurred | 是否发生错误 */
    isError?: boolean;
    /** Whether data is empty (optional, for custom empty logic) | 数据是否为空（可选，用于自定义空判断逻辑） */
    isEmpty?: boolean;
}

export interface QueryBoundaryProps<T> {
    /** Query result object, usually from @tanstack/react-query's useQuery | 查询结果对象，通常来自 @tanstack/react-query 的 useQuery */
    query: QueryResult<T> | null | undefined;
    /** Content to show while loading | 加载中时显示的内容 */
    loading?: ReactNode;
    /** Content to show when error occurs | 发生错误时显示的内容 */
    error?: ReactNode;
    /** Content to show when data is empty | 数据为空时显示的内容 */
    empty?: ReactNode;
    /** Content to render on success, supports render props | 成功时渲染的内容，支持 render props 模式 */
    children: ReactNode | ((data: T) => ReactNode);
    /** Custom empty data check function, defaults to checking null/undefined or empty array | 自定义空数据判断函数，默认检查 data 是否为 null/undefined 或空数组 */
    isEmptyFn?: (data: T | undefined) => boolean;
}

/** Default empty data check function | 默认的空数据判断函数 */
function defaultIsEmpty<T>(data: T | undefined): boolean {
    if (data == null) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === "object") return Object.keys(data).length === 0;
    return false;
}

/**
 * Query boundary component, handles various async query states
 *
 * 查询边界组件，用于处理异步查询的各种状态
 *
 * @example
 * // Basic usage - with @tanstack/react-query | 基础用法 - 配合 @tanstack/react-query
 * const query = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
 *
 * <QueryBoundary
 *   query={query}
 *   loading={<Spinner />}
 *   error={<ErrorMessage />}
 *   empty={<NoData />}
 * >
 *   {(users) => <UserList users={users} />}
 * </QueryBoundary>
 *
 * @example
 * // Static children usage | 静态 children 用法
 * <QueryBoundary query={query} loading={<Spinner />}>
 *   <DataDisplay />
 * </QueryBoundary>
 *
 * @example
 * // Custom empty check logic | 自定义空判断逻辑
 * <QueryBoundary
 *   query={query}
 *   isEmptyFn={(data) => !data?.items?.length}
 * >
 *   {(data) => <ItemList items={data.items} />}
 * </QueryBoundary>
 */
export function QueryBoundary<T>({
    query,
    loading = null,
    error = null,
    empty = null,
    children,
    isEmptyFn = defaultIsEmpty,
}: QueryBoundaryProps<T>): ReactNode {
    // query 为 null/undefined 时不渲染任何内容
    if (!query) {
        return null;
    }

    const { data, isPending, isError, isEmpty: queryIsEmpty } = query;

    // 加载中状态
    if (isPending) {
        return loading;
    }

    // 错误状态（仅在没有缓存数据时显示）
    if (isError && isEmptyFn(data)) {
        return error;
    }

    // 空数据状态（优先使用 query 的 isEmpty，否则使用 isEmptyFn 判断）
    const isEmpty = queryIsEmpty ?? isEmptyFn(data);
    if (isEmpty) {
        return empty;
    }

    // 成功状态 - 支持 render props
    if (typeof children === "function") {
        return children(data as T);
    }

    return children;
}
