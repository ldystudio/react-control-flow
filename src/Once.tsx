import { type ReactNode, useRef } from "react";

export interface OnceProps {
    /** Content to render only once | 只渲染一次的内容 */
    children: ReactNode;
}

/**
 * Component that renders children only once and ignores subsequent updates
 *
 * 只渲染一次子元素并忽略后续更新的组件
 *
 * Useful for expensive computations or content that should not re-render.
 * The initial render result is cached and returned on subsequent renders.
 *
 * 适用于昂贵的计算或不应重新渲染的内容。
 * 初始渲染结果会被缓存并在后续渲染时返回。
 *
 * @example
 * // Render expensive component only once | 只渲染一次昂贵的组件
 * <Once>
 *   <ExpensiveChart data={data} />
 * </Once>
 *
 * @example
 * // Static content that shouldn't update | 不应更新的静态内容
 * <Once>
 *   <Header title={initialTitle} />
 * </Once>
 *
 * @example
 * // Prevent re-renders from parent updates | 防止父组件更新导致的重新渲染
 * function Parent() {
 *   const [count, setCount] = useState(0);
 *   return (
 *     <div>
 *       <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
 *       <Once>
 *         <Child initialCount={count} />
 *       </Once>
 *     </div>
 *   );
 * }
 */
export function Once({ children }: OnceProps): ReactNode {
    const cachedRef = useRef<{ rendered: boolean; content: ReactNode }>({
        rendered: false,
        content: null,
    });

    if (!cachedRef.current.rendered) {
        cachedRef.current.rendered = true;
        cachedRef.current.content = children;
    }

    return cachedRef.current.content;
}
