import { FlowElement } from "../../src/model/FlowElement";
import { determineRowCounts } from "../../src/model/rowCountUtils";

const addLinks = (lead: FlowElement, ...trail: Array<FlowElement>): void => {
    trail.forEach((single) => {
        lead.addFollowingElement(single);
        single.addPrecedingElement(lead);
    });
};

describe("determineRowCounts()", () => {
    describe("for model without gateways", () => {
        const a = new FlowElement("a");
        const b = new FlowElement("b");
        const c = new FlowElement("c");
        const endNode = new FlowElement(null);
        addLinks(a, b);
        addLinks(b, c);
        addLinks(c, endNode);

        it.each`
            testDescription                | first      | others
            ${"all consecutive nodes"}     | ${a}       | ${[b, c, endNode]}
            ${"single content & end node"} | ${c}       | ${[endNode]}
            ${"single end node"}           | ${endNode} | ${[]}
        `("assigns row count of 1 to $testDescription", ({ first, others }: { first: FlowElement; others: Array<FlowElement> }) => {
            const allElements = [first, ...others];
            determineRowCounts(first, "top", allElements.forEach.bind(allElements));

            expect(first.getRowCount()).toBe(1);
            others.forEach((otherElement) => expect(otherElement.getRowCount()).toBe(1));
        });
    });
    describe("calculates row count correctly for model with single diverging gateway", () => {
        it("and no other element", () => {
            const gateway = new FlowElement("g");
            const endNode = new FlowElement(null);
            addLinks(gateway, endNode, endNode, endNode);

            const allElements = [gateway, endNode];
            determineRowCounts(gateway, "top", allElements.forEach.bind(allElements));

            expect(gateway.getRowCount()).toBe(3);
            expect(endNode.getRowCount()).toBe(3);
        });
        it("and preceding content element", () => {
            const firstElement = new FlowElement("f");
            const gateway = new FlowElement("g");
            const endNode = new FlowElement(null);
            addLinks(firstElement, gateway);
            addLinks(gateway, endNode, endNode);

            const allElements = [firstElement, gateway, endNode];
            determineRowCounts(firstElement, "top", allElements.forEach.bind(allElements));

            expect(firstElement.getRowCount()).toBe(2);
            expect(gateway.getRowCount()).toBe(2);
            expect(endNode.getRowCount()).toBe(2);
        });
        it("and content elements before converging gateway", () => {
            const gateway = new FlowElement("g");
            const branchA = new FlowElement("a");
            const branchB = new FlowElement("b");
            const endNode = new FlowElement(null);
            addLinks(gateway, branchA, branchB);
            addLinks(branchA, endNode);
            addLinks(branchB, endNode);

            const allElements = [gateway, branchA, branchB, endNode];
            determineRowCounts(gateway, "top", allElements.forEach.bind(allElements));

            expect(gateway.getRowCount()).toBe(2);
            expect(branchA.getRowCount()).toBe(1);
            expect(branchB.getRowCount()).toBe(1);
            expect(endNode.getRowCount()).toBe(2);
        });
        it("and content element after converging gateway", () => {
            const gateway = new FlowElement("g");
            const commonElement = new FlowElement("c");
            const endNode = new FlowElement(null);
            addLinks(gateway, commonElement, commonElement);
            addLinks(commonElement, endNode);

            const allElements = [gateway, commonElement, endNode];
            determineRowCounts(gateway, "top", allElements.forEach.bind(allElements));

            expect(gateway.getRowCount()).toBe(2);
            expect(commonElement.getRowCount()).toBe(2);
            expect(endNode.getRowCount()).toBe(2);
        });
        it("and content elements before/between/after gateways", () => {
            const first = new FlowElement("f");
            const gateway = new FlowElement("g");
            const branchA = new FlowElement("a");
            const branchB = new FlowElement("b");
            const commonElement = new FlowElement("c");
            const endNode = new FlowElement(null);
            addLinks(first, gateway);
            addLinks(gateway, branchA, branchB);
            addLinks(branchA, commonElement);
            addLinks(branchB, commonElement);
            addLinks(commonElement, endNode);

            const allElements = [first, gateway, branchA, branchB, commonElement, endNode];
            determineRowCounts(first, "top", allElements.forEach.bind(allElements));

            expect(first.getRowCount()).toBe(2);
            expect(gateway.getRowCount()).toBe(2);
            expect(branchA.getRowCount()).toBe(1);
            expect(branchB.getRowCount()).toBe(1);
            expect(commonElement.getRowCount()).toBe(2);
            expect(endNode.getRowCount()).toBe(2);
        });
    });
    describe("calculates row count correctly for model with multiple diverging gateways", () => {
        it("and a single converging gateway before end", () => {
            const firstGateway = new FlowElement("f");
            const branchGatewayA = new FlowElement("a");
            const branchA1 = new FlowElement("a1");
            const branchA2 = new FlowElement("a2");
            const branchB = new FlowElement("b");
            const branchGatewayC = new FlowElement("c");
            const branchC1 = new FlowElement("c1");
            const branchC2 = new FlowElement("c2");
            const branchC3 = new FlowElement("c3");
            const endNode = new FlowElement(null);
            addLinks(firstGateway, branchGatewayA, branchB, branchGatewayC, endNode);
            addLinks(branchGatewayA, branchA1, branchA2);
            addLinks(branchA1, endNode);
            addLinks(branchA2, endNode);
            addLinks(branchB, endNode);
            addLinks(branchGatewayC, branchC1, branchC2, branchC3);
            addLinks(branchC1, endNode);
            addLinks(branchC2, endNode);
            addLinks(branchC3, endNode);

            const allElements = [firstGateway, branchGatewayA, branchA1, branchA2, branchB, branchGatewayC, branchC1, branchC2, branchC3, endNode];
            determineRowCounts(firstGateway, "top", allElements.forEach.bind(allElements));

            expect(firstGateway.getRowCount()).toBe(7);
            expect(branchGatewayA.getRowCount()).toBe(2);
            expect(branchA1.getRowCount()).toBe(1);
            expect(branchA2.getRowCount()).toBe(1);
            expect(branchB.getRowCount()).toBe(1);
            expect(branchGatewayC.getRowCount()).toBe(3);
            expect(branchC1.getRowCount()).toBe(1);
            expect(branchC2.getRowCount()).toBe(1);
            expect(branchC3.getRowCount()).toBe(1);
            expect(endNode.getRowCount()).toBe(7);
        });
        it("and multiple cascading converging gateways", () => {
            const firstGateway = new FlowElement("f");
            const branchGatewayA = new FlowElement("a");
            const branchGatewayA1 = new FlowElement("a1");
            const branchA11 = new FlowElement("a11");
            const branchA12 = new FlowElement("a12");
            const branchA2 = new FlowElement("a2");
            const branchGatewayB = new FlowElement("b");
            const branchB1 = new FlowElement("b1");
            const branchB2 = new FlowElement("b2");
            const branchC = new FlowElement("c");
            const convergingBC = new FlowElement("bc");
            const convergingA2BC = new FlowElement("a2bc");
            const endNode = new FlowElement(null);
            addLinks(firstGateway, branchGatewayA, branchGatewayB, branchC);
            addLinks(branchGatewayA, branchGatewayA1, branchA2);
            addLinks(branchGatewayA1, branchA11, branchA12);
            addLinks(branchGatewayB, branchB1, branchB2);
            addLinks(branchB1, convergingBC);
            addLinks(branchB2, convergingBC);
            addLinks(branchC, convergingBC);
            addLinks(branchA2, convergingA2BC);
            addLinks(convergingBC, convergingA2BC);
            addLinks(branchA11, endNode);
            addLinks(branchA12, endNode);
            addLinks(convergingA2BC, endNode);

            const allElements = [
                firstGateway,
                branchGatewayA,
                branchGatewayA1,
                branchA11,
                branchA12,
                branchA2,
                branchGatewayB,
                branchB1,
                branchB2,
                branchC,
                convergingBC,
                convergingA2BC,
                endNode
            ];
            determineRowCounts(firstGateway, "top", allElements.forEach.bind(allElements));

            expect(firstGateway.getRowCount()).toBe(6);
            expect(branchGatewayA.getRowCount()).toBe(3);
            expect(branchGatewayA1.getRowCount()).toBe(2);
            expect(branchA11.getRowCount()).toBe(1);
            expect(branchA12.getRowCount()).toBe(1);
            expect(branchA2.getRowCount()).toBe(1);
            expect(branchGatewayB.getRowCount()).toBe(2);
            expect(branchB1.getRowCount()).toBe(1);
            expect(branchB2.getRowCount()).toBe(1);
            expect(branchC.getRowCount()).toBe(1);
            expect(convergingBC.getRowCount()).toBe(3);
            expect(convergingA2BC.getRowCount()).toBe(4);
            expect(endNode.getRowCount()).toBe(6);
        });
        describe("and interleaved converging gateways (branches: 3-2-4)", () => {
            const firstDiverging = new FlowElement("d1");
            const branchA1 = new FlowElement("a1");
            const branchA2 = new FlowElement("a2");
            const branchA3 = new FlowElement("a3");
            const secondDiverging = new FlowElement("d2");
            const branchB1 = new FlowElement("b1");
            const branchB2 = new FlowElement("b2");
            const thirdDiverging = new FlowElement("d3");
            const branchC1 = new FlowElement("c1");
            const branchC2 = new FlowElement("c2");
            const branchC3 = new FlowElement("c3");
            const branchC4 = new FlowElement("c4");
            const endNode = new FlowElement(null);
            addLinks(firstDiverging, branchA1, branchA2, branchA3);
            addLinks(branchA1, secondDiverging);
            addLinks(branchA2, secondDiverging);
            addLinks(branchA3, secondDiverging);
            addLinks(secondDiverging, branchB1, branchB2);
            addLinks(branchB1, thirdDiverging);
            addLinks(branchB2, thirdDiverging);
            addLinks(thirdDiverging, branchC1, branchC2, branchC3, branchC4);
            addLinks(branchC1, endNode);
            addLinks(branchC2, endNode);
            addLinks(branchC3, endNode);
            addLinks(branchC4, endNode);

            const allElements = [
                firstDiverging,
                branchA1,
                branchA2,
                branchA3,
                secondDiverging,
                branchB1,
                branchB2,
                thirdDiverging,
                branchC1,
                branchC2,
                branchC3,
                branchC4,
                endNode
            ];

            it("when aligning to the top", () => {
                determineRowCounts(firstDiverging, "top", allElements.forEach.bind(allElements));

                expect(firstDiverging.getRowCount()).toBe(4);
                expect(branchA1.getRowCount()).toBe(1);
                expect(branchA2.getRowCount()).toBe(1);
                expect(branchA3.getRowCount()).toBe(2);
                expect(secondDiverging.getRowCount()).toBe(4);
                expect(branchB1.getRowCount()).toBe(1);
                expect(branchB2.getRowCount()).toBe(3);
                expect(thirdDiverging.getRowCount()).toBe(4);
                expect(branchC1.getRowCount()).toBe(1);
                expect(branchC2.getRowCount()).toBe(1);
                expect(branchC3.getRowCount()).toBe(1);
                expect(branchC4.getRowCount()).toBe(1);
                expect(endNode.getRowCount()).toBe(4);
            });

            it("when aligning to the bottom", () => {
                determineRowCounts(firstDiverging, "bottom", allElements.forEach.bind(allElements));

                expect(firstDiverging.getRowCount()).toBe(4);
                expect(branchA1.getRowCount()).toBe(2);
                expect(branchA2.getRowCount()).toBe(1);
                expect(branchA3.getRowCount()).toBe(1);
                expect(secondDiverging.getRowCount()).toBe(4);
                expect(branchB1.getRowCount()).toBe(3);
                expect(branchB2.getRowCount()).toBe(1);
                expect(thirdDiverging.getRowCount()).toBe(4);
                expect(branchC1.getRowCount()).toBe(1);
                expect(branchC2.getRowCount()).toBe(1);
                expect(branchC3.getRowCount()).toBe(1);
                expect(branchC4.getRowCount()).toBe(1);
                expect(endNode.getRowCount()).toBe(4);
            });
        });
        describe.skip("and interleaved converging gateways (branches: 3-4-2)", () => {
            const firstDiverging = new FlowElement("d1");
            const branchA1 = new FlowElement("a1");
            const branchA2 = new FlowElement("a2");
            const branchA3 = new FlowElement("a3");
            const secondDiverging = new FlowElement("d2");
            const branchB1 = new FlowElement("c1");
            const branchB2 = new FlowElement("c2");
            const branchB3 = new FlowElement("c3");
            const branchB4 = new FlowElement("c4");
            const thirdDiverging = new FlowElement("d3");
            const branchC1 = new FlowElement("b1");
            const branchC2 = new FlowElement("b2");
            const endNode = new FlowElement(null);
            addLinks(firstDiverging, branchA1, branchA2, branchA3);
            addLinks(branchA1, secondDiverging);
            addLinks(branchA2, secondDiverging);
            addLinks(branchA3, secondDiverging);
            addLinks(secondDiverging, branchB1, branchB2, branchB3, branchB4);
            addLinks(branchB1, endNode);
            addLinks(branchB2, endNode);
            addLinks(branchB3, endNode);
            addLinks(branchB4, endNode);
            addLinks(thirdDiverging, branchC1, branchC2);
            addLinks(branchC1, thirdDiverging);
            addLinks(branchC2, thirdDiverging);

            const allElements = [
                firstDiverging,
                branchA1,
                branchA2,
                branchA3,
                secondDiverging,
                branchB1,
                branchB2,
                branchB3,
                branchB4,
                thirdDiverging,
                branchC1,
                branchC2,
                endNode
            ];

            it("when aligning to the top", () => {
                determineRowCounts(firstDiverging, "top", allElements.forEach.bind(allElements));

                expect(firstDiverging.getRowCount()).toBe(4);
                expect(branchA1.getRowCount()).toBe(1);
                expect(branchA2.getRowCount()).toBe(1);
                expect(branchA3.getRowCount()).toBe(2);
                expect(secondDiverging.getRowCount()).toBe(4);
                expect(branchB1.getRowCount()).toBe(1);
                expect(branchB2.getRowCount()).toBe(1);
                expect(branchB3.getRowCount()).toBe(1);
                expect(branchB4.getRowCount()).toBe(1);
                expect(thirdDiverging.getRowCount()).toBe(4);
                expect(branchC1.getRowCount()).toBe(1);
                expect(branchC2.getRowCount()).toBe(3);
                expect(endNode.getRowCount()).toBe(4);
            });

            it("when aligning to the bottom", () => {
                determineRowCounts(firstDiverging, "bottom", allElements.forEach.bind(allElements));

                expect(firstDiverging.getRowCount()).toBe(4);
                expect(branchA1.getRowCount()).toBe(2);
                expect(branchA2.getRowCount()).toBe(1);
                expect(branchA3.getRowCount()).toBe(1);
                expect(secondDiverging.getRowCount()).toBe(4);
                expect(branchB1.getRowCount()).toBe(1);
                expect(branchB2.getRowCount()).toBe(1);
                expect(branchB3.getRowCount()).toBe(1);
                expect(branchB4.getRowCount()).toBe(1);
                expect(thirdDiverging.getRowCount()).toBe(4);
                expect(branchC1.getRowCount()).toBe(3);
                expect(branchC2.getRowCount()).toBe(1);
                expect(endNode.getRowCount()).toBe(4);
            });
        });
    });
});
