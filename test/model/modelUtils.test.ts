import { isDivergingGateway, createElementTree } from "../../src/model/modelUtils";

describe("isDivergingGateway()", () => {
    it.each`
        testDescription              | result   | input
        ${"with empty nextElements"} | ${true}  | ${{ nextElements: [] }}
        ${"with one nextElement"}    | ${true}  | ${{ nextElements: [{}] }}
        ${"with two nextElements"}   | ${true}  | ${{ nextElements: [{}, {}] }}
        ${"that is undefined"}       | ${false} | ${undefined}
        ${"that is null"}            | ${false} | ${null}
        ${"that is empty"}           | ${false} | ${{}}
        ${"without nextElements"}    | ${false} | ${{ nextElementId: "a" }}
    `("returns $result for input $testDescription", ({ result, input }) => {
        expect(isDivergingGateway(input)).toBe(result);
    });
});
describe("createElementTree()", () => {
    it("returns empty element if no matching firstElement found", () => {
        const rootElement = createElementTree({ firstElementId: "a", elements: {} });
        expect(rootElement).toBeDefined();
        expect(rootElement.getId()).toBe("a");
        expect(rootElement.getColumnIndex()).toBe(2);
        expect(rootElement.getRowCount()).toBe(1);
        expect(rootElement.getPrecedingElements()).toHaveLength(0);
        expect(rootElement.getFollowingElements()).toHaveLength(0);
    });
    it("can handle chained content elements", () => {
        const rootElement = createElementTree({ firstElementId: "a", elements: { a: { nextElementId: "b" }, b: { nextElementId: "c" }, c: {} } });
        expect(rootElement).toBeDefined();
        expect(rootElement.getId()).toBe("a");
        expect(rootElement.getColumnIndex()).toBe(2);
        expect(rootElement.getRowCount()).toBe(1);
        expect(rootElement.getPrecedingElements()).toHaveLength(0);
        expect(rootElement.getFollowingElements()).toHaveLength(1);
        const bElement = rootElement.getFollowingElements()[0];
        expect(bElement.getId()).toBe("b");
        expect(bElement.getColumnIndex()).toBe(3);
        expect(bElement.getRowCount()).toBe(1);
        expect(bElement.getPrecedingElements()).toHaveLength(1);
        expect(bElement.getPrecedingElements()[0]).toBe(rootElement);
        expect(bElement.getFollowingElements()).toHaveLength(1);
        const cElement = bElement.getFollowingElements()[0];
        expect(cElement.getId()).toBe("c");
        expect(cElement.getColumnIndex()).toBe(4);
        expect(cElement.getRowCount()).toBe(1);
        expect(cElement.getPrecedingElements()).toHaveLength(1);
        expect(cElement.getPrecedingElements()[0]).toBe(bElement);
        expect(cElement.getFollowingElements()).toHaveLength(1);
        const endElement = cElement.getFollowingElements()[0];
        expect(endElement.getId()).toBeUndefined();
        expect(endElement.getColumnIndex()).toBe(5);
        expect(endElement.getRowCount()).toBe(1);
        expect(endElement.getPrecedingElements()).toHaveLength(1);
        expect(endElement.getPrecedingElements()[0]).toBe(cElement);
        expect(endElement.getFollowingElements()).toHaveLength(0);
    });
});
