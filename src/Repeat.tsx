import { Fragment, type ReactNode } from "react";

export interface RepeatProps {
    /** Number of times to repeat | 重复次数 */
    times: number;
    /** Render function, receives current index (starting from 0) | 渲染函数，接收当前索引（从 0 开始） */
    children: (index: number) => ReactNode;
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
 */
export function Repeat({ times, children }: RepeatProps): ReactNode {
    if (times <= 0) {
        return null;
    }

    const elements: ReactNode[] = [];
    for (let i = 0; i < times; i++) {
        elements.push(<Fragment key={i}>{children(i)}</Fragment>);
    }

    return elements;
}
