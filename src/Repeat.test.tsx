import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Repeat } from "./Repeat";

describe("Repeat 组件", () => {
    describe("基本功能", () => {
        test("重复渲染指定次数", () => {
            const html = renderToString(<Repeat times={3}>{(i) => <span key={i}>Item</span>}</Repeat>);
            const matches = html.match(/<span>Item<\/span>/g);
            expect(matches?.length).toBe(3);
        });

        test("传递正确的索引给 children", () => {
            const html = renderToString(<Repeat times={3}>{(i) => <span key={i}>{i}</span>}</Repeat>);
            expect(html).toContain("0");
            expect(html).toContain("1");
            expect(html).toContain("2");
        });

        test("索引从 0 开始", () => {
            const indices: number[] = [];
            renderToString(
                <Repeat times={3}>
                    {(i) => {
                        indices.push(i);
                        return <span key={i}>{i}</span>;
                    }}
                </Repeat>
            );
            expect(indices).toEqual([0, 1, 2]);
        });
    });

    describe("边界情况", () => {
        test("times 为 0 时不渲染任何内容", () => {
            const html = renderToString(<Repeat times={0}>{(i) => <span key={i}>Item</span>}</Repeat>);
            expect(html).toBe("");
        });

        test("times 为负数时不渲染任何内容", () => {
            const html = renderToString(<Repeat times={-5}>{(i) => <span key={i}>Item</span>}</Repeat>);
            expect(html).toBe("");
        });

        test("times 为 1 时渲染一次", () => {
            const html = renderToString(<Repeat times={1}>{(i) => <span key={i}>Single</span>}</Repeat>);
            expect(html).toContain("Single");
            const matches = html.match(/<span>Single<\/span>/g);
            expect(matches?.length).toBe(1);
        });
    });

    describe("复杂渲染", () => {
        test("支持渲染复杂组件", () => {
            const html = renderToString(
                <Repeat times={2}>
                    {(i) => (
                        <div key={i} className="item">
                            <h3>Title {i}</h3>
                            <p>Content {i}</p>
                        </div>
                    )}
                </Repeat>
            );
            expect(html).toContain("Title");
            expect(html).toContain("Content");
            expect(html).toContain("0");
            expect(html).toContain("1");
        });

        test("支持条件渲染", () => {
            const html = renderToString(
                <Repeat times={4}>{(i) => (i % 2 === 0 ? <span key={i}>Even {i}</span> : null)}</Repeat>
            );
            expect(html).toContain("Even");
            expect(html).toContain("0");
            expect(html).toContain("2");
            // 奇数不应出现
            const matches = html.match(/Even/g);
            expect(matches?.length).toBe(2);
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 Repeat", () => {
            const html = renderToString(
                <Repeat times={2}>
                    {(i) => (
                        <div key={i}>
                            Row {i}:<Repeat times={3}>{(j) => <span key={j}>Col {j}</span>}</Repeat>
                        </div>
                    )}
                </Repeat>
            );
            expect(html).toContain("Row");
            expect(html).toContain("Col");
            // 应该有 2 行，每行 3 列
            const rows = html.match(/Row/g);
            const cols = html.match(/Col/g);
            expect(rows?.length).toBe(2);
            expect(cols?.length).toBe(6); // 2 * 3
        });
    });

    describe("实际用例", () => {
        test("渲染星级评分", () => {
            const rating = 4;
            const html = renderToString(
                <div>
                    <Repeat times={rating}>{(i) => <span key={i}>★</span>}</Repeat>
                    <Repeat times={5 - rating}>{(i) => <span key={i}>☆</span>}</Repeat>
                </div>
            );
            const filled = html.match(/★/g);
            const empty = html.match(/☆/g);
            expect(filled?.length).toBe(4);
            expect(empty?.length).toBe(1);
        });

        test("生成占位骨架屏", () => {
            const html = renderToString(
                <Repeat times={3}>
                    {(i) => (
                        <div key={i} className="skeleton">
                            Loading...
                        </div>
                    )}
                </Repeat>
            );
            const skeletons = html.match(/class="skeleton"/g);
            expect(skeletons?.length).toBe(3);
        });
    });
});
