import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { Dynamic } from "./Dynamic";

// 测试用的自定义组件
function Button({ children, onClick }: { children: ReactNode; onClick?: () => void }): ReactNode {
    return (
        <button type="button" onClick={onClick}>
            {children}
        </button>
    );
}

function Link({ children, href }: { children: ReactNode; href: string }): ReactNode {
    return <a href={href}>{children}</a>;
}

function Card({ title, content }: { title: string; content: string }): ReactNode {
    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{content}</p>
        </div>
    );
}

describe("Dynamic 组件", () => {
    describe("基本功能", () => {
        test("渲染原生 HTML 元素", () => {
            const html = renderToString(
                <Dynamic component="div" className="container">
                    Content
                </Dynamic>
            );
            expect(html).toContain("<div");
            expect(html).toContain('class="container"');
            expect(html).toContain("Content");
        });

        test("渲染自定义组件", () => {
            const html = renderToString(
                <Dynamic component={Button} onClick={() => {}}>
                    Click me
                </Dynamic>
            );
            expect(html).toContain("<button");
            expect(html).toContain("Click me");
        });

        test("传递 props 给组件", () => {
            const html = renderToString(
                <Dynamic component={Link} href="https://example.com">
                    Link text
                </Dynamic>
            );
            expect(html).toContain('href="https://example.com"');
            expect(html).toContain("Link text");
        });
    });

    describe("动态选择组件", () => {
        test("根据条件选择不同组件", () => {
            const isButton = true;
            const html = renderToString(
                <Dynamic component={isButton ? Button : Link} href="https://example.com">
                    Dynamic
                </Dynamic>
            );
            expect(html).toContain("<button");
            expect(html).not.toContain("<a");
        });

        test("条件变化时渲染不同组件", () => {
            const isButton = false;
            const html = renderToString(
                <Dynamic component={isButton ? Button : Link} href="https://example.com">
                    Dynamic
                </Dynamic>
            );
            expect(html).toContain("<a");
            expect(html).not.toContain("<button");
        });
    });

    describe("fallback 功能", () => {
        test("component 为 null 时渲染 fallback", () => {
            const html = renderToString(
                <Dynamic component={null} fallback={<span>Fallback content</span>}>
                    Content
                </Dynamic>
            );
            expect(html).toContain("Fallback content");
        });

        test("component 为 undefined 时渲染 fallback", () => {
            const html = renderToString(
                <Dynamic component={undefined} fallback={<span>Fallback content</span>}>
                    Content
                </Dynamic>
            );
            expect(html).toContain("Fallback content");
        });

        test("component 为 false 时渲染 fallback", () => {
            const html = renderToString(
                <Dynamic component={false} fallback={<span>Fallback content</span>}>
                    Content
                </Dynamic>
            );
            expect(html).toContain("Fallback content");
        });

        test("未提供 fallback 时渲染空内容", () => {
            const html = renderToString(<Dynamic component={null}>Content</Dynamic>);
            expect(html).toBe("");
        });
    });

    describe("各种原生元素", () => {
        test("渲染 span 元素", () => {
            const html = renderToString(
                <Dynamic component="span" className="text">
                    Text
                </Dynamic>
            );
            expect(html).toContain("<span");
            expect(html).toContain("</span>");
        });

        test("渲染 a 元素", () => {
            const html = renderToString(
                <Dynamic component="a" href="https://example.com" target="_blank">
                    Link
                </Dynamic>
            );
            expect(html).toContain("<a");
            expect(html).toContain('href="https://example.com"');
            expect(html).toContain('target="_blank"');
        });

        test("渲染 input 元素", () => {
            const html = renderToString(<Dynamic component="input" type="text" placeholder="Enter text" />);
            expect(html).toContain("<input");
            expect(html).toContain('type="text"');
            expect(html).toContain('placeholder="Enter text"');
        });
    });

    describe("复杂场景", () => {
        test("渲染带多个 props 的自定义组件", () => {
            const html = renderToString(<Dynamic component={Card} title="Card Title" content="Card content here" />);
            expect(html).toContain("Card Title");
            expect(html).toContain("Card content here");
            expect(html).toContain('class="card"');
        });

        test("支持嵌套 Dynamic", () => {
            const html = renderToString(
                <Dynamic component="div" className="outer">
                    <Dynamic component="span" className="inner">
                        Nested content
                    </Dynamic>
                </Dynamic>
            );
            expect(html).toContain('class="outer"');
            expect(html).toContain('class="inner"');
            expect(html).toContain("Nested content");
        });

        test("动态选择按钮或链接的实际用例", () => {
            const renderAction = (href?: string) => {
                return renderToString(
                    <Dynamic component={href ? "a" : "button"} href={href} type={href ? undefined : "button"}>
                        Action
                    </Dynamic>
                );
            };

            const buttonHtml = renderAction();
            expect(buttonHtml).toContain("<button");
            expect(buttonHtml).toContain('type="button"');

            const linkHtml = renderAction("https://example.com");
            expect(linkHtml).toContain("<a");
            expect(linkHtml).toContain('href="https://example.com"');
        });
    });
});
