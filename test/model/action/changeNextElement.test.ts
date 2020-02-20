import { changeNextElement } from "../../../src/model/action/changeNextElement";

import { createMinimalElementTreeStructure } from "../../../src/model/modelUtils";
import { StepNode, ConvergingGatewayNode, DivergingGatewayBranch, ElementType, EndNode } from "../../../src/types/ModelElement";

import { step, divGw } from "../testUtils";

describe("changeNextElement()", () => {
    it("can handle step element pointing to other step element", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: step("c"), c: step("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.StepNode && entry.id === "d") as StepNode,
            elementsInTree.find((entry) => entry.type === ElementType.StepNode && entry.id === "b") as StepNode
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: step("d"), c: step("d"), d: {} }
        });
    });
    it("can handle step element pointing to end", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: step("c"), c: step("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.EndNode) as EndNode,
            elementsInTree.find((entry) => entry.type === ElementType.StepNode && entry.id === "b") as StepNode
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: step(null), c: step("d"), d: {} }
        });
    });
    it("can handle diverging gateway branch pointing to step element", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: step("c"), c: step("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.StepNode && entry.id === "b") as StepNode,
            elementsInTree.find(
                (entry) => entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement.id === "a" && entry.branchIndex === 1
            ) as DivergingGatewayBranch
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", "b"), b: step("c"), c: step("d"), d: {} }
        });
    });
    it("can handle diverging gateway branch pointing to end", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: { a: divGw("b", "c"), b: step("c"), c: step("d"), d: {} }
        };
        const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.EndNode) as EndNode,
            elementsInTree.find(
                (entry) => entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement.id === "a" && entry.branchIndex === 1
            ) as DivergingGatewayBranch
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: { a: divGw("b", null), b: step("c"), c: step("d"), d: {} }
        });
    });
    describe("can handle converging gateway in front of", () => {
        it("step element", () => {
            const originalFlow = {
                firstElementId: "a",
                elements: { a: divGw("b", "c", null), b: step("c"), c: {} }
            };
            const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
            const { changedFlow } = changeNextElement(
                originalFlow,
                elementsInTree.find(
                    (entry) =>
                        entry.type === ElementType.ConvergingGatewayNode &&
                        entry.followingElement.type === ElementType.StepNode &&
                        entry.followingElement.id === "c"
                ) as ConvergingGatewayNode,
                elementsInTree.find(
                    (entry) => entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement.id === "a" && entry.branchIndex === 2
                ) as DivergingGatewayBranch
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: { a: divGw("b", "c", "c"), b: step("c"), c: {} }
            });
        });
        it("end", () => {
            const originalFlow = {
                firstElementId: "a",
                elements: { a: divGw("b", "c", null), b: step("c"), c: {} }
            };
            const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
            const { changedFlow } = changeNextElement(
                originalFlow,
                elementsInTree.find(
                    (entry) => entry.type === ElementType.ConvergingGatewayNode && entry.followingElement.type === ElementType.EndNode
                ) as ConvergingGatewayNode,
                elementsInTree.find((entry) => entry.type === ElementType.StepNode && entry.id === "b") as StepNode
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: { a: divGw("b", "c", null), b: step(null), c: {} }
            });
        });
    });
});
