import { Component, type ErrorInfo, type ReactNode } from "react";

export interface ErrorBoundaryProps {
    /** Content to show when error occurs | 发生错误时显示的内容 */
    fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
    /** Child components | 子组件 */
    children: ReactNode;
    /** Callback when error occurs | 错误发生时的回调 */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Key to reset error boundary, auto-resets when key changes | 用于重置错误边界的 key，当 key 变化时自动重置 */
    resetKey?: unknown;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/**
 * Error boundary component, catches JavaScript errors in child component tree
 *
 * 错误边界组件，捕获子组件树中的 JavaScript 错误
 *
 * @example
 * // Basic usage | 基础用法
 * <ErrorBoundary fallback={<ErrorPage />}>
 *   <App />
 * </ErrorBoundary>
 *
 * @example
 * // Using render props for error info and reset function | 使用 render props 获取错误信息和重置函数
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={reset}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <App />
 * </ErrorBoundary>
 *
 * @example
 * // Using resetKey for auto-reset (when key changes) | 使用 resetKey 自动重置（当 key 变化时）
 * <ErrorBoundary fallback={<Error />} resetKey={userId}>
 *   <UserProfile />
 * </ErrorBoundary>
 *
 * @example
 * // With onError for error reporting | 配合 onError 进行错误上报
 * <ErrorBoundary
 *   fallback={<Error />}
 *   onError={(error, info) => reportError(error, info)}
 * >
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.props.onError?.(error, errorInfo);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        // 当 resetKey 变化时，重置错误状态
        if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
            this.reset();
        }
    }

    reset = (): void => {
        this.setState({ error: null });
    };

    render(): ReactNode {
        const { error } = this.state;
        const { fallback, children } = this.props;

        if (error) {
            if (typeof fallback === "function") {
                return fallback(error, this.reset);
            }
            return fallback;
        }

        return children;
    }
}
