import type { ReactNode } from 'react';
import { For, type ForProps } from './For';

export interface RepeatProps extends Omit<ForProps<number>, 'each'> {
    /** Number of times to repeat | 重复次数 */
    times: number;
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
export function Repeat({ times, children, ...props }: RepeatProps): ReactNode {
    const indices = times > 0 ? Array.from({ length: times }, (_, i) => i) : [];

    return (
        <For {...props} each={indices}>
            {(i, _i, array) => children(i, array.length, array)}
        </For>
    );
}
