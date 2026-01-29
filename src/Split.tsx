import type { ReactNode } from 'react';
import { For, type ForProps } from './For';

export interface SplitProps extends Omit<ForProps<string>, 'each'> {
    /** String to split | 要切割的字符串 */
    string: string | null | undefined;
    /** Separator to split by, can be string or RegExp | 分隔符，可以是字符串或正则表达式 */
    separator: string | RegExp;
    /** Whether to keep separator in result array | 是否在结果数组中保留分隔符 */
    keepSeparator?: boolean;
    /** Render function for each part, receives part, index and original array | 渲染每个部分的函数，接收部分、索引和原数组 */
}

/**
 * String splitting and rendering component, splits a string by separator and renders each part
 *
 * 字符串切割渲染组件，按分隔符切割字符串并渲染每个部分
 *
 * @example
 * // Basic usage | 基础用法
 * <Split string="a,b,c" separator=",">
 *   {(part) => <span>{part}</span>}
 * </Split>
 *
 * @example
 * // Keep separator | 保留分隔符
 * <Split string="9+5=(9+1)+4" separator="=" keepSeparator>
 *   {(part) => <span>{part}</span>}
 * </Split>
 * // Renders: ["9+5", "=", "(9+1)+4"]
 *
 * @example
 * // Without keeping separator | 不保留分隔符
 * <Split string="9+5=(9+1)+4" separator="=">
 *   {(part) => <span>{part}</span>}
 * </Split>
 * // Renders: ["9+5", "(9+1)+4"]
 *
 * @example
 * // With RegExp separator | 使用正则表达式分隔符
 * <Split string="a1b2c3" separator={/\d/} keepSeparator>
 *   {(part) => <span>{part}</span>}
 * </Split>
 * // Renders: ["a", "1", "b", "2", "c", "3"]
 *
 * @example
 * // With wrapper element | 使用包装元素
 * <Split string="hello world" separator=" " wrapper={<div className="words" />}>
 *   {(word) => <span>{word}</span>}
 * </Split>
 */
export function Split({
    string,
    separator,
    keepSeparator = false,
    children,
    ...props
}: SplitProps): ReactNode {
    const parts = splitString(string, separator, keepSeparator);

    return (
        <For {...props} each={parts}>
            {children}
        </For>
    );
}

/** Split string by separator, optionally keeping separator in result | 按分隔符切割字符串，可选择保留分隔符 */
function splitString(
    string: string | null | undefined,
    separator: string | RegExp,
    keepSeparator: boolean
): string[] {
    if (!string) {
        return [];
    }

    if (keepSeparator) {
        // Use capturing group to keep separator in result
        const regex =
            separator instanceof RegExp
                ? new RegExp(
                      `(${separator.source})`,
                      separator.flags.includes('g') ? separator.flags : `${separator.flags}g`
                  )
                : new RegExp(`(${escapeRegExp(separator)})`, 'g');
        return string.split(regex).filter((part) => part !== '');
    }

    return string.split(separator);
}

/** Escape special regex characters in a string | 转义字符串中的正则特殊字符 */
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
