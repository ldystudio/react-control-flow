import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";

export interface RepeatProps {
    /** Number of times to repeat | 重复次数 */
    times: number;
    /** Render function, receives current index and total length | 渲染函数，接收当前索引和总长度 */
    children: (index: number, length: number) => ReactNode;
    /** Wrapper element for all rendered elements | 包装所有渲染元素的元素 */
    wrapper?: ReactElement;
    /** Reverse the rendering order | 倒序渲染 */
    reverse?: boolean;
}

/**
 * Repeat rendering component, replaces Array.from({ length: n }).map()
 *
 * 重复渲染组件，用于替代 Array.from({ length: n }).map()
 *
 * @example
 * // Basic usage - render 5 stars | 基础用法 - 渲染 5 颗星
 * <Repeat times={5}>
 *   {(i) => <Star key={i} />}
 * </Repeat>
 *
 * @example
 * // Render list with index | 渲染带索引的列表
 * <Repeat times={3}>
 *   {(i) => <div key={i}>Item {i + 1}</div>}
 * </Repeat>
 *
 * @example
 * // Dynamic count | 动态次数
 * <Repeat times={rating}>
 *   {(i) => <FilledStar key={i} />}
 * </Repeat>
 *
 * @example
 * // With wrapper element | 使用包装元素
 * <Repeat times={5} wrapper={<div className="stars" />}>
 *   {(i) => <Star key={i} />}
 * </Repeat>
 */
export function Repeat({ times, children, wrapper, reverse }: RepeatProps): ReactNode {
    if (times <= 0) {
        return null;
    }

    const elements: ReactNode[] = [];
    if (reverse) {
        for (let i = times - 1; i >= 0; i--) {
            elements.push(<Fragment key={i}>{children(i, times)}</Fragment>);
        }
    } else {
        for (let i = 0; i < times; i++) {
            elements.push(<Fragment key={i}>{children(i, times)}</Fragment>);
        }
    }

    return wrapper && isValidElement(wrapper) ? cloneElement(wrapper, {}, elements) : elements;
}
