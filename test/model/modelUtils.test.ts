import { isDivergingGateway, createElementTree } from "../../src/model/modelUtils";
import {
    ContentNode,
    ConvergingGatewayBranch,
    ConvergingGatewayNode,
    DivergingGatewayNode,
    DivergingGatewayBranch,
    ElementType,
    EndNode
} from "../../src/types/ModelElement";
import { cont, divGw } from "./testUtils";

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
    it("returns just start/end if no matching firstElement found", () => {
        const startElement = createElementTree({ firstElementId: "a", elements: {} }, "top");
        expect(startElement).toBeDefined();
        expect(startElement.type).toBe(ElementType.StartNode);
        expect(startElement.columnIndex).toBe(1);
        expect(startElement.rowCount).toBe(1);
        const endElement = startElement.followingElement;
        expect(endElement).toBeDefined();
        expect(endElement.type).toBe(ElementType.EndNode);
        expect(endElement.columnIndex).toBe(2);
        expect(endElement.rowCount).toBe(1);
    });
    it("can handle chained content elements", () => {
        const startElement = createElementTree({ firstElementId: "a", elements: { a: cont("b"), b: cont("c"), c: {} } }, "top");
        expect(startElement).toBeDefined();
        expect(startElement.type).toBe(ElementType.StartNode);
        expect(startElement.columnIndex).toBe(1);
        expect(startElement.rowCount).toBe(1);
        const rootElement = startElement.followingElement as ContentNode;
        expect(rootElement.type).toBe(ElementType.ContentNode);
        expect(rootElement.id).toBe("a");
        expect(rootElement.columnIndex).toBe(2);
        expect(rootElement.rowCount).toBe(1);
        const bElement = rootElement.followingElement as ContentNode;
        expect(bElement.type).toBe(ElementType.ContentNode);
        expect(bElement.id).toBe("b");
        expect(bElement.columnIndex).toBe(3);
        expect(bElement.rowCount).toBe(1);
        expect(bElement.precedingElement).toBe(rootElement);
        const cElement = bElement.followingElement as ContentNode;
        expect(cElement.type).toBe(ElementType.ContentNode);
        expect(cElement.id).toBe("c");
        expect(cElement.columnIndex).toBe(4);
        expect(cElement.rowCount).toBe(1);
        expect(cElement.precedingElement).toBe(bElement);
        const endElement = cElement.followingElement as EndNode;
        expect(endElement.type).toBe(ElementType.EndNode);
        expect(endElement.columnIndex).toBe(5);
        expect(endElement.rowCount).toBe(1);
        expect(endElement.precedingElement).toBe(cElement);
    });
    it("can handle mixed gateways", () => {
        const startElement = createElementTree(
            {
                firstElementId: "div-gw-1",
                elements: {
                    "div-gw-1": divGw("cont-1", "cont-3"),
                    "cont-1": cont("cont-2"),
                    "cont-2": cont("conv-gw-1/div-gw-2"),
                    "cont-3": cont("conv-gw-1/div-gw-2"),
                    "conv-gw-1/div-gw-2": divGw("cont-4", "cont-5", "cont-6", "cont-7"),
                    "cont-4": cont("conv-gw-2"),
                    "cont-5": cont("conv-gw-2"),
                    "cont-6": cont("conv-gw-2"),
                    "cont-7": cont("conv-gw-2"),
                    "conv-gw-2": {}
                }
            },
            "bottom"
        );
        const rootElement = startElement.followingElement as DivergingGatewayNode;
        expect(rootElement.followingBranches).toHaveLength(2);
        const div1Branch1 = rootElement.followingBranches[0] as DivergingGatewayBranch;
        const div1Branch2 = rootElement.followingBranches[1] as DivergingGatewayBranch;
        const cont1 = div1Branch1.followingElement as ContentNode;
        const cont2 = cont1.followingElement as ContentNode;
        const conv1Branch1 = cont2.followingElement as ConvergingGatewayBranch;
        const cont3 = div1Branch2.followingElement as ContentNode;
        const conv1Branch2 = cont3.followingElement as ConvergingGatewayBranch;
        const convGw1 = conv1Branch1.followingElement as ConvergingGatewayNode;
        expect(conv1Branch2.followingElement).toBe(convGw1);
        const divGw2 = convGw1.followingElement as DivergingGatewayNode;
        expect(divGw2.followingBranches).toHaveLength(4);
        const div2Branch1 = divGw2.followingBranches[0];
        const cont4 = div2Branch1.followingElement as ContentNode;
        const conv2Branch1 = cont4.followingElement as ConvergingGatewayBranch;
        const div2Branch2 = divGw2.followingBranches[1];
        const cont5 = div2Branch2.followingElement as ContentNode;
        const conv2Branch2 = cont5.followingElement as ConvergingGatewayBranch;
        const div2Branch3 = divGw2.followingBranches[2];
        const cont6 = div2Branch3.followingElement as ContentNode;
        const conv2Branch3 = cont6.followingElement as ConvergingGatewayBranch;
        const div2Branch4 = divGw2.followingBranches[3];
        const cont7 = div2Branch4.followingElement as ContentNode;
        const conv2Branch4 = cont7.followingElement as ConvergingGatewayBranch;
        const convGw2 = conv2Branch1.followingElement;
        expect(conv2Branch2.followingElement).toBe(convGw2);
        expect(conv2Branch3.followingElement).toBe(convGw2);
        expect(conv2Branch4.followingElement).toBe(convGw2);
        const end = convGw2.followingElement as EndNode;

        expect(startElement).toMatchInlineSnapshot(`StartNode`);
        expect(startElement.rowCount).toBe(4);
        expect(rootElement.rowCount).toBe(4);
        expect(cont1.rowCount).toBe(3);
        expect(cont2.rowCount).toBe(3);
        expect(cont3.rowCount).toBe(1);
        expect(convGw1.rowCount).toBe(4);
        expect(cont4.rowCount).toBe(1);
        expect(cont5.rowCount).toBe(1);
        expect(cont6.rowCount).toBe(1);
        expect(cont7.rowCount).toBe(1);
        expect(convGw2.rowCount).toBe(4);
        expect(end.rowCount).toBe(4);
    });
    it("can handle overlapping gateways (1)", () => {
        const start = createElementTree(
            {
                firstElementId: "1",
                elements: {
                    "1": divGw("2.1", null, "2.3"),
                    "2.1": cont("3.1"),
                    "2.3": divGw(null, "3.3.2"),
                    "3.1": {},
                    "3.3.2": divGw(null, "4.3.2.2", null),
                    "4.3.2.2": {}
                }
            },
            "top"
        );
        const element1 = start.followingElement as DivergingGatewayNode;
        const element21 = element1.followingBranches[0].followingElement as ContentNode;
        const element31 = element21.followingElement as ContentNode;
        const convGwEnd = (element31.followingElement as ConvergingGatewayBranch).followingElement;
        expect(convGwEnd.followingElement.type).toBe(ElementType.EndNode);
        expect((element1.followingBranches[1].followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwEnd);
        const element23 = element1.followingBranches[2].followingElement as DivergingGatewayNode;
        expect((element23.followingBranches[0].followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwEnd);
        const element332 = element23.followingBranches[1].followingElement as DivergingGatewayNode;
        expect((element332.followingBranches[0].followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwEnd);
        const element4322 = element332.followingBranches[1].followingElement as ContentNode;
        expect((element4322.followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwEnd);
        expect((element332.followingBranches[2].followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwEnd);

        // first element taking all six rows
        expect(element1.rowCount).toBe(6);
        // one row for the first sub path
        expect(element21.rowCount).toBe(1);
        expect(element31.rowCount).toBe(1);
        // one row for the direct end connection
        // three rows for the last sub path
        expect(element23.rowCount).toBe(4);
        // last sub path: one row for end connection
        // last sub path: one row for one more converging gateway
        expect(element332.rowCount).toBe(3);
        // trailing converging gateway: one row for end connection
        // trailing converging gateway: one row for direct connection to final content element
        expect(element4322.rowCount).toBe(1);
        // trailing converging gateway: one row for end connection
        // converging gateway before single end node: taking all six rows
        expect(convGwEnd.rowCount).toBe(6);
    });
    it("can handle overlapping gateways (2)", () => {
        const start = createElementTree({ firstElementId: "a", elements: { a: divGw("b", "c"), b: divGw(null, "c"), c: {} } }, "top");
        const a = start.followingElement as DivergingGatewayNode;
        const b = a.followingBranches[0].followingElement as DivergingGatewayNode;
        const convGwEnd = (b.followingBranches[0].followingElement as ConvergingGatewayBranch).followingElement;
        const convGwC = (b.followingBranches[1].followingElement as ConvergingGatewayBranch).followingElement;
        expect((a.followingBranches[1].followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwC);
        expect((b.followingBranches[1].followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwC);
        const c = convGwC.followingElement as ContentNode;
        expect((c.followingElement as ConvergingGatewayBranch).followingElement).toBe(convGwEnd);
        const end = convGwEnd.followingElement as EndNode;

        expect(a.rowCount).toBe(3);
        expect(b.rowCount).toBe(2);
        expect(c.rowCount).toBe(2);
        expect(end.rowCount).toBe(3);
    });
});
