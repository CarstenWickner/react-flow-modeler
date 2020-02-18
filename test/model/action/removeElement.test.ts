import { removeElement } from "../../../src/model/action/removeElement";

import { createMinimalElementTreeStructure } from "../../../src/model/modelUtils";
import { ContentNode, ElementType, DivergingGatewayBranch } from "../../../src/types/ModelElement";

import { cont, divGw } from "../testUtils";

describe("removeElement()", () => {
    const originalFlow = {
        firstElementId: "a",
        elements: { a: cont("b"), b: divGw("c", "d", null), c: cont("d"), d: cont("e"), e: {} }
    };
    const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
    describe("can handle content element", () => {
        it("being first in model", () => {
            const { changedFlow } = removeElement(
                originalFlow,
                elementsInTree.find((entry) => entry.type === ElementType.ContentNode && entry.id === "a") as ContentNode
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "b",
                elements: { b: divGw("c", "d", null), c: cont("d"), d: cont("e"), e: {} }
            });
        });
        it("being only one in model", () => {
            const modelWithOneElement = { firstElementId: "a", elements: { a: {} } };
            const structureWithOneElement = createMinimalElementTreeStructure(originalFlow);
            const { changedFlow } = removeElement(
                modelWithOneElement,
                structureWithOneElement.elementsInTree.find((entry) => entry.type === ElementType.ContentNode && entry.id === "a") as ContentNode
            );
            expect(changedFlow).not.toBe(modelWithOneElement);
            expect(changedFlow).toEqual({
                firstElementId: null,
                elements: {}
            });
        });
        it("behind converging gateway", () => {
            const { changedFlow } = removeElement(
                originalFlow,
                elementsInTree.find((entry) => entry.type === ElementType.ContentNode && entry.id === "d") as ContentNode
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: { a: cont("b"), b: divGw("c", "e", null), c: cont("e"), e: {} }
            });
        });
        it("before end", () => {
            const { changedFlow } = removeElement(
                originalFlow,
                elementsInTree.find((entry) => entry.type === ElementType.ContentNode && entry.id === "e") as ContentNode
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: { a: cont("b"), b: divGw("c", "d", null), c: cont("d"), d: {} }
            });
        });
    });
    describe("can handle diverging gateway branch", () => {
        it("with multiple branches still remaining", () => {
            const { changedFlow } = removeElement(
                originalFlow,
                elementsInTree.find(
                    (entry) => entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement.id === "b" && entry.branchIndex === 1
                ) as DivergingGatewayBranch
            );
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: { a: cont("b"), b: divGw("c", null), c: cont("d"), d: cont("e"), e: {} }
            });
        });
        it("also removing gateway with only one branch remaining", () => {
            const flowBeforeRemoval = {
                firstElementId: "a",
                elements: { a: divGw("c", "b"), b: cont("c"), c: {} }
            };
            const structureBeforeRemoval = createMinimalElementTreeStructure(flowBeforeRemoval);
            const { changedFlow } = removeElement(
                flowBeforeRemoval,
                structureBeforeRemoval.elementsInTree.find(
                    (entry) => entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement.id === "a" && entry.branchIndex === 0
                ) as DivergingGatewayBranch
            );
            expect(changedFlow).not.toBe(flowBeforeRemoval);
            expect(changedFlow).toEqual({
                firstElementId: "b",
                elements: { b: cont("c"), c: {} }
            });
        });
    });
});
