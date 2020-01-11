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
        const rootElement = createElementTree({ firstElementId: "a", elements: {} }, "top");
        expect(rootElement).toBeDefined();
        expect(rootElement.getId()).toBe("a");
        expect(rootElement.getColumnIndex()).toBe(2);
        expect(rootElement.getRowCount()).toBe(1);
        expect(rootElement.getPrecedingElements()).toHaveLength(0);
        expect(rootElement.getFollowingElements()).toHaveLength(0);
    });
    it("can handle chained content elements", () => {
        const rootElement = createElementTree(
            {
                firstElementId: "a",
                elements: {
                    a: { nextElementId: "b" },
                    b: { nextElementId: "c" },
                    c: {}
                }
            },
            "top"
        );
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
        expect(endElement.getId()).toBe(null);
        expect(endElement.getColumnIndex()).toBe(5);
        expect(endElement.getRowCount()).toBe(1);
        expect(endElement.getPrecedingElements()).toHaveLength(1);
        expect(endElement.getPrecedingElements()[0]).toBe(cElement);
        expect(endElement.getFollowingElements()).toHaveLength(0);
    });
    it("can handle mixed gateways", () => {
        const rootElement = createElementTree(
            {
                firstElementId: "div-gw-1",
                elements: {
                    "div-gw-1": { nextElements: [{ id: "cont-1" }, { id: "cont-3" }] },
                    "cont-1": { nextElementId: "cont-2" },
                    "cont-2": { nextElementId: "conv-gw-1/div-gw-2" },
                    "cont-3": { nextElementId: "conv-gw-1/div-gw-2" },
                    "conv-gw-1/div-gw-2": { nextElements: [{ id: "cont-4" }, { id: "cont-5" }, { id: "cont-6" }, { id: "cont-7" }] },
                    "cont-4": { nextElementId: "conv-gw-2" },
                    "cont-5": { nextElementId: "conv-gw-2" },
                    "cont-6": { nextElementId: "conv-gw-2" },
                    "cont-7": { nextElementId: "conv-gw-2" },
                    "conv-gw-2": {}
                }
            },
            "bottom"
        );
        expect(rootElement.getFollowingElements()).toHaveLength(2);
        const cont1 = rootElement.getFollowingElements()[0];
        expect(cont1.getFollowingElements()).toHaveLength(1);
        const cont2 = cont1.getFollowingElements()[0];
        expect(cont2.getFollowingElements()).toHaveLength(1);
        const cont3 = rootElement.getFollowingElements()[1];
        expect(cont3.getFollowingElements()).toHaveLength(1);
        const convGw1 = cont2.getFollowingElements()[0];
        expect(cont3.getFollowingElements()[0]).toBe(convGw1);
        expect(convGw1.getFollowingElements()).toHaveLength(4);
        const cont4 = convGw1.getFollowingElements()[0];
        expect(cont4.getFollowingElements()).toHaveLength(1);
        const convGw2 = cont4.getFollowingElements()[0];
        expect(convGw2.getFollowingElements()).toHaveLength(1);
        const cont5 = convGw1.getFollowingElements()[1];
        expect(cont5.getFollowingElements()).toHaveLength(1);
        expect(cont5.getFollowingElements()[0]).toBe(convGw2);
        const cont6 = convGw1.getFollowingElements()[2];
        expect(cont6.getFollowingElements()).toHaveLength(1);
        expect(cont6.getFollowingElements()[0]).toBe(convGw2);
        const cont7 = convGw1.getFollowingElements()[3];
        expect(cont7.getFollowingElements()).toHaveLength(1);
        expect(cont7.getFollowingElements()[0]).toBe(convGw2);
        const end = convGw2.getFollowingElements()[0];

        expect(rootElement.getRowCount()).toBe(4);
        expect(cont1.getRowCount()).toBe(3);
        expect(cont2.getRowCount()).toBe(3);
        expect(cont3.getRowCount()).toBe(1);
        expect(convGw1.getRowCount()).toBe(4);
        expect(cont4.getRowCount()).toBe(1);
        expect(cont5.getRowCount()).toBe(1);
        expect(cont6.getRowCount()).toBe(1);
        expect(cont7.getRowCount()).toBe(1);
        expect(convGw2.getRowCount()).toBe(4);
        expect(end.getRowCount()).toBe(4);
    });
    it("can handle overlapping gateways", () => {
        const element1 = createElementTree(
            {
                firstElementId: "1",
                elements: {
                    "1": {
                        nextElements: [
                            { id: "2.1" },
                            {
                                /*id: "2.2-end"*/
                            },
                            { id: "2.3" }
                        ]
                    },
                    "2.1": { nextElementId: "3.1" },
                    "2.3": {
                        nextElements: [
                            {
                                /*id: "3.3.1-end"*/
                            },
                            { id: "3.3.2" }
                        ]
                    },
                    "3.1": {
                        /*nextElementId: "4.1-end"*/
                    },
                    "3.3.2": {
                        nextElements: [
                            {
                                /*id: "4.3.2.1-end"*/
                            },
                            { id: "4.3.2.2" },
                            {
                                /*id: "4.3.2.3-end"*/
                            }
                        ]
                    },
                    "4.3.2.2": {
                        /*nextElementId: "5.3.2.2-end"*/
                    }
                }
            },
            "top"
        );
        const element21 = element1.getFollowingElements()[0];
        const element31 = element21.getFollowingElements()[0];
        const convGwEnd = element31.getFollowingElements()[0];
        expect(element1.getFollowingElements()[1]).toBe(convGwEnd);
        const element23 = element1.getFollowingElements()[2];
        expect(element23.getFollowingElements()[0]).toBe(convGwEnd);
        const element332 = element23.getFollowingElements()[1];
        expect(element332.getFollowingElements()[0]).toBe(convGwEnd);
        const element4322 = element332.getFollowingElements()[1];
        expect(element332.getFollowingElements()[2]).toBe(convGwEnd);

        // first element taking all six rows
        expect(element1.getRowCount()).toBe(6);
        // one row for the first sub path
        expect(element21.getRowCount()).toBe(1);
        expect(element31.getRowCount()).toBe(1);
        // one row for the direct end connection
        // three rows for the last sub path
        expect(element23.getRowCount()).toBe(4);
        // last sub path: one row for end connection
        // last sub path: one row for one more converging gateway
        expect(element332.getRowCount()).toBe(3);
        // trailing converging gateway: one row for end connection
        // trailing converging gateway: one row for direct connection to final content element
        expect(element4322.getRowCount()).toBe(1);
        // trailing converging gateway: one row for end connection
        // converging gateway before single end node: taking all six rows
        expect(convGwEnd.getRowCount()).toBe(6);
    });
});
