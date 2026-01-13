import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

// 每个测试后清理
afterEach(() => {
    cleanup();
});

// 抑制 React 错误边界的 console.error 输出
// 注意：React 开发模式下的 stderr 错误堆栈输出无法通过此方式抑制，这是预期行为
const suppressConsoleError = () => {
    const originalError = console.error;
    const spy = spyOn(console, "error").mockImplementation((...args: unknown[]) => {
        const message = args[0];
        if (
            typeof message === "string" &&
            (message.includes("The above error occurred") ||
                message.includes("Error boundaries should implement") ||
                message.includes("React will try to recreate"))
        ) {
            return;
        }
        originalError.apply(console, args);
    });
    return spy;
};

// 用于测试的会抛出错误的组件
function ThrowError({ message }: { message: string }): ReactNode {
    throw new Error(message);
}

// 正常组件
function NormalComponent(): ReactNode {
    return <span>Normal content</span>;
}

// 可控制是否抛出错误的组件
function ConditionalError({ shouldThrow }: { shouldThrow: boolean }): ReactNode {
    if (shouldThrow) {
        throw new Error("Conditional error");
    }
    return <span>No error</span>;
}

describe("ErrorBoundary 组件", () => {
    describe("正常渲染", () => {
        test("正常渲染时显示 children", () => {
            render(
                <ErrorBoundary fallback={<span>Error</span>}>
                    <NormalComponent />
                </ErrorBoundary>
            );
            expect(screen.getByText("Normal content")).toBeTruthy();
            expect(screen.queryByText("Error")).toBeNull();
        });

        test("支持多个子元素", () => {
            render(
                <ErrorBoundary fallback={<span>Error</span>}>
                    <span>First</span>
                    <span>Second</span>
                    <span>Third</span>
                </ErrorBoundary>
            );
            expect(screen.getByText("First")).toBeTruthy();
            expect(screen.getByText("Second")).toBeTruthy();
            expect(screen.getByText("Third")).toBeTruthy();
        });
    });

    describe("错误捕获", () => {
        test("捕获错误时显示 fallback", () => {
            const spy = suppressConsoleError();
            render(
                <ErrorBoundary fallback={<span>Something went wrong</span>}>
                    <ThrowError message="Test error" />
                </ErrorBoundary>
            );
            expect(screen.getByText("Something went wrong")).toBeTruthy();
            spy.mockRestore();
        });

        test("fallback 可以是复杂组件", () => {
            const spy = suppressConsoleError();
            render(
                <ErrorBoundary
                    fallback={
                        <div data-testid="error-container">
                            <h1>Oops!</h1>
                            <p>An error occurred</p>
                        </div>
                    }
                >
                    <ThrowError message="Test error" />
                </ErrorBoundary>
            );
            expect(screen.getByTestId("error-container")).toBeTruthy();
            expect(screen.getByText("Oops!")).toBeTruthy();
            expect(screen.getByText("An error occurred")).toBeTruthy();
            spy.mockRestore();
        });

        test("其中一个子元素抛出错误时显示 fallback", () => {
            const spy = suppressConsoleError();
            render(
                <ErrorBoundary fallback={<span>Error occurred</span>}>
                    <span>Before</span>
                    <ThrowError message="Middle error" />
                    <span>After</span>
                </ErrorBoundary>
            );
            expect(screen.getByText("Error occurred")).toBeTruthy();
            expect(screen.queryByText("Before")).toBeNull();
            expect(screen.queryByText("After")).toBeNull();
            spy.mockRestore();
        });
    });

    describe("render props fallback", () => {
        test("fallback 函数接收 error 对象", () => {
            const spy = suppressConsoleError();
            render(
                <ErrorBoundary fallback={(error) => <span>Error: {error.message}</span>}>
                    <ThrowError message="Custom error message" />
                </ErrorBoundary>
            );
            expect(screen.getByText("Error: Custom error message")).toBeTruthy();
            spy.mockRestore();
        });

        test("fallback 函数接收 reset 函数并可调用", async () => {
            const spy = suppressConsoleError();
            const user = userEvent.setup();

            function TestComponent() {
                const [shouldThrow, setShouldThrow] = useState(true);
                return (
                    <ErrorBoundary
                        fallback={(error, reset) => (
                            <div>
                                <span>Error: {error.message}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShouldThrow(false);
                                        reset();
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    >
                        <ConditionalError shouldThrow={shouldThrow} />
                    </ErrorBoundary>
                );
            }

            render(<TestComponent />);
            expect(screen.getByText("Error: Conditional error")).toBeTruthy();

            await user.click(screen.getByText("Retry"));
            expect(screen.getByText("No error")).toBeTruthy();
            expect(screen.queryByText("Error: Conditional error")).toBeNull();
            spy.mockRestore();
        });
    });

    describe("onError 回调", () => {
        test("错误发生时调用 onError", () => {
            const spy = suppressConsoleError();
            const onError = mock(() => {});
            render(
                <ErrorBoundary fallback={<span>Error</span>} onError={onError}>
                    <ThrowError message="Test error" />
                </ErrorBoundary>
            );
            expect(onError).toHaveBeenCalled();
            spy.mockRestore();
        });

        test("onError 接收 error 和 errorInfo", () => {
            const spy = suppressConsoleError();
            let capturedError: Error | undefined;
            let capturedInfo: { componentStack?: string | null } | undefined;

            render(
                <ErrorBoundary
                    fallback={<span>Error</span>}
                    onError={(error, info) => {
                        capturedError = error;
                        capturedInfo = info;
                    }}
                >
                    <ThrowError message="Captured error" />
                </ErrorBoundary>
            );
            expect(capturedError?.message).toBe("Captured error");
            expect(capturedInfo?.componentStack).toBeDefined();
            spy.mockRestore();
        });

        test("正常渲染时不调用 onError", () => {
            const onError = mock(() => {});
            render(
                <ErrorBoundary fallback={<span>Error</span>} onError={onError}>
                    <NormalComponent />
                </ErrorBoundary>
            );
            expect(onError).not.toHaveBeenCalled();
        });
    });

    describe("resetKey 功能", () => {
        test("resetKey 变化时重置错误状态", () => {
            const spy = suppressConsoleError();

            function TestComponent() {
                const [key, setKey] = useState(1);
                const [shouldThrow, setShouldThrow] = useState(true);

                return (
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setShouldThrow(false);
                                setKey((k) => k + 1);
                            }}
                        >
                            Change Key
                        </button>
                        <ErrorBoundary fallback={<span>Error state</span>} resetKey={key}>
                            <ConditionalError shouldThrow={shouldThrow} />
                        </ErrorBoundary>
                    </div>
                );
            }

            render(<TestComponent />);
            expect(screen.getByText("Error state")).toBeTruthy();

            // 点击按钮改变 key，应该重置错误状态
            userEvent.click(screen.getByText("Change Key"));

            // 等待状态更新
            setTimeout(() => {
                expect(screen.getByText("No error")).toBeTruthy();
                expect(screen.queryByText("Error state")).toBeNull();
            }, 100);

            spy.mockRestore();
        });
    });

    describe("嵌套错误边界", () => {
        test("内层错误边界捕获错误", () => {
            const spy = suppressConsoleError();
            render(
                <ErrorBoundary fallback={<span>Outer error</span>}>
                    <div>
                        <span>Outer content</span>
                        <ErrorBoundary fallback={<span>Inner error</span>}>
                            <ThrowError message="Test" />
                        </ErrorBoundary>
                    </div>
                </ErrorBoundary>
            );
            expect(screen.getByText("Inner error")).toBeTruthy();
            expect(screen.getByText("Outer content")).toBeTruthy();
            expect(screen.queryByText("Outer error")).toBeNull();
            spy.mockRestore();
        });

        test("外层捕获未被内层捕获的错误", () => {
            const spy = suppressConsoleError();

            // 创建一个在外层抛出错误的场景
            function OuterThrow(): ReactNode {
                return (
                    <>
                        <ThrowError message="Outer" />
                        <ErrorBoundary fallback={<span>Inner error</span>}>
                            <NormalComponent />
                        </ErrorBoundary>
                    </>
                );
            }

            render(
                <ErrorBoundary fallback={<span>Outer error</span>}>
                    <OuterThrow />
                </ErrorBoundary>
            );
            expect(screen.getByText("Outer error")).toBeTruthy();
            spy.mockRestore();
        });
    });

    describe("Props 验证", () => {
        test("接受所有 props 组合", () => {
            const spy = suppressConsoleError();
            const onError = mock(() => {});

            render(
                <ErrorBoundary
                    fallback={(error, reset) => (
                        <div>
                            <span>{error.message}</span>
                            <button type="button" onClick={reset}>
                                Reset
                            </button>
                        </div>
                    )}
                    onError={onError}
                    resetKey="test-key"
                >
                    <ThrowError message="Test props" />
                </ErrorBoundary>
            );

            expect(screen.getByText("Test props")).toBeTruthy();
            expect(screen.getByText("Reset")).toBeTruthy();
            expect(onError).toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
