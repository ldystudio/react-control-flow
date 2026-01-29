import { cloneElement, Fragment, isValidElement, type Key, type ReactElement, type ReactNode } from "react";

export interface ForProps<T> {
    /** Array to iterate over | 要遍历的数组 */
    each: T[] | readonly T[] | null | undefined;
    /** Render function for each element, receives item, index and original array | 渲染每个元素的函数，接收元素、索引和原数组 */
    children: (item: T, index: number, array: T[] | readonly T[]) => ReactNode;
    /** Function to extract key from element, defaults to index | 从元素中提取 key 的函数，默认使用索引 */
    keyExtractor?: (item: T, index: number) => Key;
    /** Fallback content when array is empty | 数组为空时渲染的备选内容 */
    fallback?: ReactNode;
    /** Wrapper element for all rendered elements | 包装所有渲染元素的元素 */
    wrapper?: ReactElement;
    /** Reverse the rendering order | 倒序渲染 */
    reverse?: boolean;
}

/**
 * List rendering component, replaces array.map() in JSX
 *
 * 列表渲染组件，用于替代 JSX 中的 array.map()
 *
 * @example
 * // Basic usage | 基础用法
 * <For each={items}>
 *   {(item) => <ListItem {...item} />}
 * </For>
 *
 * @example
 * // With keyExtractor | 带 keyExtractor
 * <For each={users} keyExtractor={(user) => user.id}>
 *   {(user) => <UserCard user={user} />}
 * </For>
 *
 * @example
 * // With fallback | 带 fallback
 * <For each={items} fallback={<EmptyState />}>
 *   {(item, index) => <ListItem key={item.id} item={item} index={index} />}
 * </For>
 *
 * @example
 * // With wrapper element | 使用包装元素
 * <For each={items} wrapper={<ul className="list" />}>
 *   {(item) => <li>{item.name}</li>}
 * </For>
 */
export function For<T>({ each, children, keyExtractor, fallback = null, wrapper, reverse }: ForProps<T>): ReactNode {
    if (!each || each.length === 0) {
        return fallback;
    }

    const items = reverse ? [...each].reverse() : each;
    const elements = items.map((item, i) => {
        const originalIndex = reverse ? each.length - 1 - i : i;
        const key = keyExtractor ? keyExtractor(item, originalIndex) : originalIndex;
        return <Fragment key={key}>{children(item, originalIndex, each)}</Fragment>;
    });

    return wrapper && isValidElement(wrapper) ? cloneElement(wrapper, {}, elements) : elements;
}
