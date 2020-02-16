import { changeNextElement } from "../../../src/model/action/changeNextElement";

import { createMinimalElementTreeStructure } from "../../../src/model/modelUtils";
import { ContentNode, ConvergingGatewayNode, DivergingGatewayBranch, ElementType, EndNode } from "../../../src/model/ModelElement";

import { cont, divGw } from "../testUtils";

describe("changeNextElement()", () => {
    it("can handle content element pointing to other content element", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: cont("c"), c: cont("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "d") as ContentNode,
            elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "b") as ContentNode
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: cont("d"), c: cont("d"), d: {} }
        });
    });
    it("can handle content element pointing to end", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: cont("c"), c: cont("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.End) as EndNode,
            elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "b") as ContentNode
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: cont(null), c: cont("d"), d: {} }
        });
    });
    it("can handle diverging gateway branch pointing to content element", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: cont("c"), c: cont("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "b") as ContentNode,
            elementsInTree.find(
                (entry) => entry.type === ElementType.ConnectGatewayToElement && entry.precedingElement.id === "a" && entry.branchIndex === 1
            ) as DivergingGatewayBranch
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", "b"), b: cont("c"), c: cont("d"), d: {} }
        });
    });
    it("can handle diverging gateway branch pointing to end", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: cont("c"), c: cont("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.End) as EndNode,
            elementsInTree.find(
                (entry) => entry.type === ElementType.ConnectGatewayToElement && entry.precedingElement.id === "a" && entry.branchIndex === 1
            ) as DivergingGatewayBranch
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", null), b: cont("c"), c: cont("d"), d: {} }
        });
    });
    describe("can handle converging gateway in front of", () => {
        it("content element", () => {
            const originalFlow = {
                firstElementId: "a",
                elements: { a: divGw("b", "c", null), b: cont("c"), c: {} }
            };
            const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
            const { changedFlow } = changeNextElement(
                originalFlow,
                elementsInTree.find(
                    (entry) =>
                        entry.type === ElementType.GatewayConverging &&
                        entry.followingElement.type === ElementType.Content &&
                        entry.followingElement.id === "c"
                ) as ConvergingGatewayNode,
                elementsInTree.find(
                    (entry) => entry.type === ElementType.ConnectGatewayToElement && entry.precedingElement.id === "a" && entry.branchIndex === 2
                ) as DivergingGatewayBranch
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: { a: divGw("b", "c", "c"), b: cont("c"), c: {} }
            });
        });
        it("end", () => {
            const originalFlow = {
                firstElementId: "a",
                elements: { a: divGw("b", "c", null), b: cont("c"), c: {} }
            };
            const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
            const { changedFlow } = changeNextElement(
                originalFlow,
                elementsInTree.find(
                    (entry) => entry.type === ElementType.GatewayConverging && entry.followingElement.type === ElementType.End
                ) as ConvergingGatewayNode,
                elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "b") as ContentNode
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: { a: divGw("b", "c", null), b: cont(null), c: {} }
            });
        });
    });
});
