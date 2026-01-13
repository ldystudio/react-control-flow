import { Fragment, type Key, type ReactNode } from "react";

export interface ForProps<T> {
    /** 要遍历的数组 */
    each: T[] | readonly T[] | null | undefined;
    /** 渲染每个元素的函数 */
    children: (item: T, index: number) => ReactNode;
    /** 从元素中提取 key 的函数，默认使用索引 */
    keyExtractor?: (item: T, index: number) => Key;
    /** 数组为空时渲染的备选内容 */
    fallback?: ReactNode;
}

/**
 * 列表渲染组件，用于替代 JSX 中的 array.map()
 *
 * @example
 * // 基础用法
 * <For each={items}>
 *   {(item) => <ListItem {...item} />}
 * </For>
 *
 * @example
 * // 带 keyExtractor
 * <For each={users} keyExtractor={(user) => user.id}>
 *   {(user) => <UserCard user={user} />}
 * </For>
 *
 * @example
 * // 带 fallback
 * <For each={items} fallback={<EmptyState />}>
 *   {(item, index) => <ListItem key={item.id} item={item} index={index} />}
 * </For>
 */
export function For<T>({ each, children, keyExtractor, fallback = null }: ForProps<T>): ReactNode {
    if (!each || each.length === 0) {
        return fallback;
    }

    return each.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : index;
        return <Fragment key={key}>{children(item, index)}</Fragment>;
    });
}
