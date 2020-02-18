import { determineRowCounts } from "../../src/model/rowCountUtils";

import { ContentNode, ConvergingGatewayBranch, DivergingGatewayNode, EndNode } from "../../src/types/ModelElement";
import { createMinimalElementTreeStructure } from "../../src/model/modelUtils";
import { FlowModelerProps } from "../../src/types/FlowModelerProps";

import { cont, divGw } from "./testUtils";

describe.only("determineRowCounts()", () => {
    describe("for model without gateways", () => {
        it.each`
            testDescription                | flow
            ${"all consecutive nodes"}     | ${{ firstElementId: "a", elements: { a: cont("b"), b: cont("c"), c: {} } }}
            ${"single content & end node"} | ${{ firstElementId: "a", elements: { a: {} } }}
            ${"single end node"}           | ${{ firstElementId: null, elements: {} }}
        `("assigns row count of 1 to $testDescription", ({ flow }: { flow: FlowModelerProps["flow"] }) => {
            const { start, elementsInTree } = createMinimalElementTreeStructure(flow);
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));

            elementsInTree.forEach((element) => expect(element.rowCount).toBe(1));
        });
    });
    describe("calculates row count correctly for model with single diverging gateway", () => {
        it("and no other element", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({ firstElementId: "g", elements: { g: divGw(null, null, null) } });
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));

            const divergingGateway = start.followingElement as DivergingGatewayNode;
            const convergingGateway = (divergingGateway.followingBranches[0].followingElement as ConvergingGatewayBranch).followingElement;
            expect(start.rowCount).toBe(3);
            expect(divergingGateway.rowCount).toBe(3);
            expect(divergingGateway.followingBranches[0].rowCount).toBe(1);
            expect(divergingGateway.followingBranches[0].followingElement.rowCount).toBe(1);
            expect(divergingGateway.followingBranches[1].rowCount).toBe(1);
            expect(divergingGateway.followingBranches[1].followingElement.rowCount).toBe(1);
            expect(divergingGateway.followingBranches[2].rowCount).toBe(1);
            expect(divergingGateway.followingBranches[2].followingElement.rowCount).toBe(1);
            expect(convergingGateway.rowCount).toBe(3);
            expect(convergingGateway.followingElement.rowCount).toBe(3);
        });
        it("and preceding content element", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "f",
                elements: { f: cont("g"), g: divGw(null, null) }
            });
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));

            const contentNode = start.followingElement as ContentNode;
            const divergingGateway = contentNode.followingElement as DivergingGatewayNode;
            const convergingGateway = (divergingGateway.followingBranches[0].followingElement as ConvergingGatewayBranch).followingElement;
            expect(start.rowCount).toBe(2);
            expect(contentNode.rowCount).toBe(2);
            expect(divergingGateway.rowCount).toBe(2);
            expect(divergingGateway.followingBranches[0].rowCount).toBe(1);
            expect(divergingGateway.followingBranches[0].followingElement.rowCount).toBe(1);
            expect(divergingGateway.followingBranches[1].rowCount).toBe(1);
            expect(divergingGateway.followingBranches[1].followingElement.rowCount).toBe(1);
            expect(convergingGateway.rowCount).toBe(2);
            expect(convergingGateway.followingElement.rowCount).toBe(2);
        });
        it("and content elements before converging gateway", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "g",
                elements: { g: divGw("a", "b"), a: {}, b: {} }
            });
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));

            const divergingGateway = start.followingElement as DivergingGatewayNode;
            const branchA = divergingGateway.followingBranches[0].followingElement as ContentNode;
            const branchB = divergingGateway.followingBranches[1].followingElement as ContentNode;
            const convergingGateway = (branchA.followingElement as ConvergingGatewayBranch).followingElement;

            expect(start.rowCount).toBe(2);
            expect(divergingGateway.rowCount).toBe(2);
            expect(divergingGateway.followingBranches[0].rowCount).toBe(1);
            expect(branchA.rowCount).toBe(1);
            expect(branchA.followingElement.rowCount).toBe(1);
            expect(divergingGateway.followingBranches[1].rowCount).toBe(1);
            expect(branchB.rowCount).toBe(1);
            expect(branchB.followingElement.rowCount).toBe(1);
            expect(convergingGateway.rowCount).toBe(2);
            expect(convergingGateway.followingElement.rowCount).toBe(2);
        });
        it("and content element after converging gateway", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "g",
                elements: { g: divGw("c", "c"), c: {} }
            });
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));
            const gateway = start.followingElement as DivergingGatewayNode;
            const convGw = (gateway.followingBranches[0].followingElement as ConvergingGatewayBranch).followingElement;
            const commonElement = convGw.followingElement as ContentNode;
            const endNode = commonElement.followingElement as EndNode;

            expect(gateway.rowCount).toBe(2);
            expect(commonElement.rowCount).toBe(2);
            expect(endNode.rowCount).toBe(2);
        });
        it("and content elements before/between/after gateways", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "f",
                elements: { f: cont("g"), g: divGw("a", "b"), a: cont("c"), b: cont("c"), c: {} }
            });
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));
            const first = start.followingElement as ContentNode;
            const gateway = first.followingElement as DivergingGatewayNode;
            const branchA = gateway.followingBranches[0].followingElement as ContentNode;
            const branchB = gateway.followingBranches[1].followingElement as ContentNode;
            const convGw = (branchA.followingElement as ConvergingGatewayBranch).followingElement;
            const commonElement = convGw.followingElement as ContentNode;
            const endNode = commonElement.followingElement as EndNode;

            expect(first.rowCount).toBe(2);
            expect(gateway.rowCount).toBe(2);
            expect(branchA.rowCount).toBe(1);
            expect(branchB.rowCount).toBe(1);
            expect(commonElement.rowCount).toBe(2);
            expect(endNode.rowCount).toBe(2);
        });
    });
    describe("calculates row count correctly for model with multiple diverging gateways", () => {
        it("and a single converging gateway before end", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "f",
                elements: {
                    f: divGw("a", "b", "c", null),
                    a: divGw("a1", "a2"),
                    a1: {},
                    a2: {},
                    b: {},
                    c: divGw("c1", "c2", "c3"),
                    c1: {},
                    c2: {},
                    c3: {}
                }
            });
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));
            const firstGateway = start.followingElement as DivergingGatewayNode;
            const branchGatewayA = firstGateway.followingBranches[0].followingElement as DivergingGatewayNode;
            const branchA1 = branchGatewayA.followingBranches[0].followingElement as ContentNode;
            const branchA2 = branchGatewayA.followingBranches[1].followingElement as ContentNode;
            const branchB = firstGateway.followingBranches[1].followingElement as ContentNode;
            const branchGatewayC = firstGateway.followingBranches[2].followingElement as DivergingGatewayNode;
            const branchC1 = branchGatewayC.followingBranches[0].followingElement as ContentNode;
            const branchC2 = branchGatewayC.followingBranches[1].followingElement as ContentNode;
            const branchC3 = branchGatewayC.followingBranches[2].followingElement as ContentNode;
            const convGw = (firstGateway.followingBranches[3].followingElement as ConvergingGatewayBranch).followingElement;
            const endNode = convGw.followingElement as EndNode;

            expect(firstGateway.rowCount).toBe(7);
            expect(branchGatewayA.rowCount).toBe(2);
            expect(branchA1.rowCount).toBe(1);
            expect(branchA2.rowCount).toBe(1);
            expect(branchB.rowCount).toBe(1);
            expect(branchGatewayC.rowCount).toBe(3);
            expect(branchC1.rowCount).toBe(1);
            expect(branchC2.rowCount).toBe(1);
            expect(branchC3.rowCount).toBe(1);
            expect(endNode.rowCount).toBe(7);
        });
        it("and multiple cascading converging gateways", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "f",
                elements: {
                    f: divGw("a", "b", "c"),
                    a: divGw("a1", "a2"),
                    a1: divGw("a11", "a12"),
                    a11: {},
                    a12: {},
                    a2: cont("a2bc"),
                    a2bc: {},
                    b: divGw("b1", "b2"),
                    b1: cont("bc"),
                    b2: cont("bc"),
                    c: cont("bc"),
                    bc: cont("a2bc")
                }
            });
            determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));
            const firstGateway = start.followingElement as DivergingGatewayNode;
            const branchGatewayA = firstGateway.followingBranches[0].followingElement as DivergingGatewayNode;
            const branchGatewayA1 = branchGatewayA.followingBranches[0].followingElement as DivergingGatewayNode;
            const branchA11 = branchGatewayA1.followingBranches[0].followingElement as ContentNode;
            const branchA12 = branchGatewayA1.followingBranches[1].followingElement as ContentNode;
            const branchA2 = branchGatewayA.followingBranches[1].followingElement as ContentNode;
            const branchGatewayB = firstGateway.followingBranches[1].followingElement as DivergingGatewayNode;
            const branchB1 = branchGatewayB.followingBranches[0].followingElement as ContentNode;
            const branchB2 = branchGatewayB.followingBranches[1].followingElement as ContentNode;
            const branchC = firstGateway.followingBranches[2].followingElement as ContentNode;
            const convergingBC = (branchB1.followingElement as ConvergingGatewayBranch).followingElement;
            const convergingA2BC = (branchA2.followingElement as ConvergingGatewayBranch).followingElement;
            const convGwEnd = ((convergingA2BC.followingElement as ContentNode).followingElement as ConvergingGatewayBranch).followingElement;
            const endNode = convGwEnd.followingElement as EndNode;

            expect(firstGateway.rowCount).toBe(6);
            expect(branchGatewayA.rowCount).toBe(3);
            expect(branchGatewayA1.rowCount).toBe(2);
            expect(branchA11.rowCount).toBe(1);
            expect(branchA12.rowCount).toBe(1);
            expect(branchA2.rowCount).toBe(1);
            expect(branchGatewayB.rowCount).toBe(2);
            expect(branchB1.rowCount).toBe(1);
            expect(branchB2.rowCount).toBe(1);
            expect(branchC.rowCount).toBe(1);
            expect(convergingBC.rowCount).toBe(3);
            expect(convergingA2BC.rowCount).toBe(4);
            expect(endNode.rowCount).toBe(6);
        });
        describe("and interleaved converging gateways (branches: 3-2-4)", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "d1",
                elements: {
                    d1: divGw("a1", "a2", "a3"),
                    a1: cont("d2"),
                    a2: cont("d2"),
                    a3: cont("d2"),
                    d2: divGw("b1", "b2"),
                    b1: cont("d3"),
                    b2: cont("d3"),
                    d3: divGw("c1", "c2", "c3", "c4"),
                    c1: {},
                    c2: {},
                    c3: {},
                    c4: {}
                }
            });
            const firstDiverging = start.followingElement as DivergingGatewayNode;
            const branchA1 = firstDiverging.followingBranches[0].followingElement as ContentNode;
            const branchA2 = firstDiverging.followingBranches[1].followingElement as ContentNode;
            const branchA3 = firstDiverging.followingBranches[2].followingElement as ContentNode;
            const firstConverging = (branchA1.followingElement as ConvergingGatewayBranch).followingElement;
            const secondDiverging = firstConverging.followingElement as DivergingGatewayNode;
            const branchB1 = secondDiverging.followingBranches[0].followingElement as ContentNode;
            const branchB2 = secondDiverging.followingBranches[1].followingElement as ContentNode;
            const secondConverging = (branchB1.followingElement as ConvergingGatewayBranch).followingElement;
            const thirdDiverging = secondConverging.followingElement as DivergingGatewayNode;
            const branchC1 = thirdDiverging.followingBranches[0].followingElement as ContentNode;
            const branchC2 = thirdDiverging.followingBranches[1].followingElement as ContentNode;
            const branchC3 = thirdDiverging.followingBranches[2].followingElement as ContentNode;
            const branchC4 = thirdDiverging.followingBranches[3].followingElement as ContentNode;
            const thirdConverging = (branchC1.followingElement as ConvergingGatewayBranch).followingElement;
            const endNode = thirdConverging.followingElement as EndNode;

            it("when aligning to the top", () => {
                determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));

                expect(firstDiverging.rowCount).toBe(4);
                expect(branchA1.rowCount).toBe(1);
                expect(branchA2.rowCount).toBe(1);
                expect(branchA3.rowCount).toBe(2);
                expect(secondDiverging.rowCount).toBe(4);
                expect(branchB1.rowCount).toBe(1);
                expect(branchB2.rowCount).toBe(3);
                expect(thirdDiverging.rowCount).toBe(4);
                expect(branchC1.rowCount).toBe(1);
                expect(branchC2.rowCount).toBe(1);
                expect(branchC3.rowCount).toBe(1);
                expect(branchC4.rowCount).toBe(1);
                expect(endNode.rowCount).toBe(4);
            });

            it("when aligning to the bottom", () => {
                determineRowCounts(start, "bottom", elementsInTree.forEach.bind(elementsInTree));

                expect(firstDiverging.rowCount).toBe(4);
                expect(branchA1.rowCount).toBe(2);
                expect(branchA2.rowCount).toBe(1);
                expect(branchA3.rowCount).toBe(1);
                expect(secondDiverging.rowCount).toBe(4);
                expect(branchB1.rowCount).toBe(3);
                expect(branchB2.rowCount).toBe(1);
                expect(thirdDiverging.rowCount).toBe(4);
                expect(branchC1.rowCount).toBe(1);
                expect(branchC2.rowCount).toBe(1);
                expect(branchC3.rowCount).toBe(1);
                expect(branchC4.rowCount).toBe(1);
                expect(endNode.rowCount).toBe(4);
            });
        });
        describe("and interleaved converging gateways (branches: 3-4-2)", () => {
            const { start, elementsInTree } = createMinimalElementTreeStructure({
                firstElementId: "d1",
                elements: {
                    d1: divGw("a1", "a2", "a3"),
                    a1: cont("d2"),
                    a2: cont("d2"),
                    a3: cont("d2"),
                    d2: divGw("b1", "b2", "b3", "b4"),
                    b1: cont("d3"),
                    b2: cont("d3"),
                    b3: cont("d3"),
                    b4: cont("d3"),
                    d3: divGw("c1", "c2"),
                    c1: {},
                    c2: {}
                }
            });
            const firstDiverging = start.followingElement as DivergingGatewayNode;
            const branchA1 = firstDiverging.followingBranches[0].followingElement as ContentNode;
            const branchA2 = firstDiverging.followingBranches[1].followingElement as ContentNode;
            const branchA3 = firstDiverging.followingBranches[2].followingElement as ContentNode;
            const firstConverging = (branchA1.followingElement as ConvergingGatewayBranch).followingElement;
            const secondDiverging = firstConverging.followingElement as DivergingGatewayNode;
            const branchB1 = secondDiverging.followingBranches[0].followingElement as ContentNode;
            const branchB2 = secondDiverging.followingBranches[1].followingElement as ContentNode;
            const branchB3 = secondDiverging.followingBranches[2].followingElement as ContentNode;
            const branchB4 = secondDiverging.followingBranches[3].followingElement as ContentNode;
            const secondConverging = (branchB1.followingElement as ConvergingGatewayBranch).followingElement;
            const thirdDiverging = secondConverging.followingElement as DivergingGatewayNode;
            const branchC1 = thirdDiverging.followingBranches[0].followingElement as ContentNode;
            const branchC2 = thirdDiverging.followingBranches[1].followingElement as ContentNode;
            const thirdConverging = (branchC1.followingElement as ConvergingGatewayBranch).followingElement;
            const endNode = thirdConverging.followingElement as EndNode;

            it("when aligning to the top", () => {
                determineRowCounts(start, "top", elementsInTree.forEach.bind(elementsInTree));

                expect(firstDiverging.rowCount).toBe(4);
                expect(branchA1.rowCount).toBe(1);
                expect(branchA2.rowCount).toBe(1);
                expect(branchA3.rowCount).toBe(2);
                expect(secondDiverging.rowCount).toBe(4);
                expect(branchB1.rowCount).toBe(1);
                expect(branchB2.rowCount).toBe(1);
                expect(branchB3.rowCount).toBe(1);
                expect(branchB4.rowCount).toBe(1);
                expect(thirdDiverging.rowCount).toBe(4);
                expect(branchC1.rowCount).toBe(1);
                expect(branchC2.rowCount).toBe(3);
                expect(endNode.rowCount).toBe(4);
            });

            it("when aligning to the bottom", () => {
                determineRowCounts(start, "bottom", elementsInTree.forEach.bind(elementsInTree));

                expect(firstDiverging.rowCount).toBe(4);
                expect(branchA1.rowCount).toBe(2);
                expect(branchA2.rowCount).toBe(1);
                expect(branchA3.rowCount).toBe(1);
                expect(secondDiverging.rowCount).toBe(4);
                expect(branchB1.rowCount).toBe(1);
                expect(branchB2.rowCount).toBe(1);
                expect(branchB3.rowCount).toBe(1);
                expect(branchB4.rowCount).toBe(1);
                expect(thirdDiverging.rowCount).toBe(4);
                expect(branchC1.rowCount).toBe(3);
                expect(branchC2.rowCount).toBe(1);
                expect(endNode.rowCount).toBe(4);
            });
        });
    });
});
