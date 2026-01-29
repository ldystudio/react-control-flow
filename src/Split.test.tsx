import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Split } from "./Split";

describe("Split", () => {
    test("splits string by separator and renders each part", () => {
        const result = renderToString(
            <Split string="a,b,c" separator=",">
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>a</span>");
        expect(result).toContain("<span>b</span>");
        expect(result).toContain("<span>c</span>");
        expect(result).not.toContain(",");
    });

    test("keeps separator when keepSeparator is true", () => {
        const result = renderToString(
            <Split string="9+5=(9+1)+4" separator="=" keepSeparator>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>9+5</span>");
        expect(result).toContain("<span>=</span>");
        expect(result).toContain("<span>(9+1)+4</span>");
    });

    test("does not keep separator when keepSeparator is false", () => {
        const result = renderToString(
            <Split string="9+5=(9+1)+4" separator="=">
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>9+5</span>");
        expect(result).toContain("<span>(9+1)+4</span>");
        expect(result).not.toContain("<span>=</span>");
    });

    test("supports RegExp separator", () => {
        const result = renderToString(
            <Split string="a1b2c" separator={/\d/}>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>a</span>");
        expect(result).toContain("<span>b</span>");
        expect(result).toContain("<span>c</span>");
    });

    test("supports RegExp separator with keepSeparator", () => {
        const result = renderToString(
            <Split string="a1b2c" separator={/\d/} keepSeparator>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>a</span>");
        expect(result).toContain("<span>1</span>");
        expect(result).toContain("<span>b</span>");
        expect(result).toContain("<span>2</span>");
        expect(result).toContain("<span>c</span>");
    });

    test("provides index to children callback", () => {
        const indices: number[] = [];
        renderToString(
            <Split string="a,b,c" separator=",">
                {(part, index) => {
                    indices.push(index);
                    return <span>{part}</span>;
                }}
            </Split>
        );
        expect(indices).toEqual([0, 1, 2]);
    });

    test("provides array to children callback", () => {
        let capturedArray: string[] | readonly string[] = [];
        renderToString(
            <Split string="x-y-z" separator="-">
                {(part, _index, array) => {
                    capturedArray = array;
                    return <span>{part}</span>;
                }}
            </Split>
        );
        expect(capturedArray).toEqual(["x", "y", "z"]);
    });

    test("renders fallback when string is null", () => {
        const result = renderToString(
            <Split string={null} separator="," fallback={<div>Empty</div>}>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toBe("<div>Empty</div>");
    });

    test("renders fallback when string is undefined", () => {
        const result = renderToString(
            <Split string={undefined} separator="," fallback={<div>Empty</div>}>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toBe("<div>Empty</div>");
    });

    test("renders fallback when string is empty", () => {
        const result = renderToString(
            <Split string="" separator="," fallback={<div>Empty</div>}>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toBe("<div>Empty</div>");
    });

    test("supports custom keyExtractor", () => {
        const result = renderToString(
            <Split string="a,b,c" separator="," keyExtractor={(part) => `key-${part}`}>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>a</span>");
        expect(result).toContain("<span>b</span>");
        expect(result).toContain("<span>c</span>");
    });

    test("supports wrapper element", () => {
        const result = renderToString(
            <Split string="a,b,c" separator="," wrapper={<ul className="list" />}>
                {(part) => <li>{part}</li>}
            </Split>
        );
        expect(result).toBe('<ul class="list"><li>a</li><li>b</li><li>c</li></ul>');
    });

    test("supports reverse rendering", () => {
        const parts: string[] = [];
        renderToString(
            <Split string="a,b,c" separator="," reverse>
                {(part) => {
                    parts.push(part);
                    return <span>{part}</span>;
                }}
            </Split>
        );
        expect(parts).toEqual(["c", "b", "a"]);
    });

    test("reverse preserves original indices in callback", () => {
        const indices: number[] = [];
        renderToString(
            <Split string="a,b,c" separator="," reverse>
                {(part, index) => {
                    indices.push(index);
                    return <span>{part}</span>;
                }}
            </Split>
        );
        expect(indices).toEqual([2, 1, 0]);
    });

    test("escapes special regex characters in string separator", () => {
        const result = renderToString(
            <Split string="a.b.c" separator="." keepSeparator>
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>a</span>");
        expect(result).toContain("<span>.</span>");
        expect(result).toContain("<span>b</span>");
        expect(result).toContain("<span>.</span>");
        expect(result).toContain("<span>c</span>");
    });

    test("handles string with no separator matches", () => {
        const result = renderToString(
            <Split string="hello" separator=",">
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toBe("<span>hello</span>");
    });

    test("handles multiple consecutive separators", () => {
        const result = renderToString(
            <Split string="a,,b" separator=",">
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>a</span>");
        expect(result).toContain("<span></span>");
        expect(result).toContain("<span>b</span>");
    });

    test("handles separator at start and end", () => {
        const result = renderToString(
            <Split string=",a,b," separator=",">
                {(part) => <span>{part}</span>}
            </Split>
        );
        expect(result).toContain("<span>a</span>");
        expect(result).toContain("<span>b</span>");
    });
});
