import { Children, type ReactElement, type ReactNode } from "react";

export interface MatchProps<T> {
    /** 条件表达式 */
    when: T;
    /** 条件为真时渲染的内容 */
    children: ReactNode | ((value: NonNullable<T>) => ReactNode);
}

export interface DefaultProps {
    /** 所有 Match 都不匹配时渲染的内容 */
    children: ReactNode;
}

export interface SwitchProps {
    /** Match 和 Default 组件 */
    children: ReactNode;
    /** 所有条件都不匹配时的备选内容（也可用 Default 组件） */
    fallback?: ReactNode;
}

/**
 * 条件匹配组件，配合 Switch 使用
 * 注意：Match 组件不能单独使用，必须作为 Switch 的子组件
 */
export function Match<T>(_props: MatchProps<T>): ReactElement | null {
    // Match 组件本身不渲染，由 Switch 处理
    return null;
}

/**
 * 默认匹配组件，配合 Switch 使用
 * 当所有 Match 都不匹配时渲染
 */
export function Default(_props: DefaultProps): ReactElement | null {
    // Default 组件本身不渲染，由 Switch 处理
    return null;
}

// 用于类型检查的标记
Match.__isMatch = true;
Default.__isDefault = true;

type MatchElement<T = unknown> = ReactElement<MatchProps<T>> & {
    type: typeof Match & { __isMatch: boolean };
};

type DefaultElement = ReactElement<DefaultProps> & {
    type: typeof Default & { __isDefault: boolean };
};

function isMatchElement(child: ReactNode): child is MatchElement {
    return (
        child !== null &&
        typeof child === "object" &&
        "type" in child &&
        typeof child.type === "function" &&
        "__isMatch" in child.type &&
        child.type.__isMatch === true
    );
}

function isDefaultElement(child: ReactNode): child is DefaultElement {
    return (
        child !== null &&
        typeof child === "object" &&
        "type" in child &&
        typeof child.type === "function" &&
        "__isDefault" in child.type &&
        child.type.__isDefault === true
    );
}

/**
 * 多条件分支组件，用于替代嵌套的 if-else if-else
 *
 * @example
 * // 基础用法
 * <Switch>
 *   <Match when={status === 'loading'}>
 *     <Loading />
 *   </Match>
 *   <Match when={status === 'error'}>
 *     <Error />
 *   </Match>
 *   <Match when={status === 'success'}>
 *     <Success />
 *   </Match>
 *   <Default>
 *     <Unknown />
 *   </Default>
 * </Switch>
 *
 * @example
 * // 使用 render props 获取类型安全的值
 * <Switch>
 *   <Match when={user}>
 *     {(user) => <UserProfile name={user.name} />}
 *   </Match>
 *   <Match when={guest}>
 *     {(guest) => <GuestProfile id={guest.id} />}
 *   </Match>
 * </Switch>
 *
 * @example
 * // 使用 fallback 属性
 * <Switch fallback={<NotFound />}>
 *   <Match when={page === 'home'}><Home /></Match>
 *   <Match when={page === 'about'}><About /></Match>
 * </Switch>
 */
export function Switch({ children, fallback = null }: SwitchProps): ReactNode {
    const childArray = Children.toArray(children);

    let defaultContent: ReactNode = fallback;

    for (const child of childArray) {
        // 检查是否是 Default 组件
        if (isDefaultElement(child)) {
            defaultContent = child.props.children;
            continue;
        }

        // 检查是否是 Match 组件
        if (isMatchElement(child)) {
            const { when, children: matchChildren } = child.props;

            if (when) {
                // 条件为真，渲染此 Match
                if (typeof matchChildren === "function") {
                    return matchChildren(when as NonNullable<typeof when>);
                }
                return matchChildren;
            }
        }
    }

    // 所有 Match 都不匹配，返回 Default 内容
    return defaultContent;
}
