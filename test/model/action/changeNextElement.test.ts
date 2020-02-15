import { changeNextElement } from "../../../src/model/action/changeNextElement";

import { createMinimalElementTreeStructure } from "../../../src/model/modelUtils";
import { ElementType, ContentNode, EndNode, DivergingGatewayBranch } from "../../../src/model/ModelElement";

describe("changeNextElement()", () => {
    const originalFlow = {
        firstElementId: "a",
        elements: {
            a: { nextElements: [{ id: "b" }, { id: "c" }] },
            b: { nextElementId: "c" },
            c: { nextElementId: "d" },
            d: {}
        }
    };
    const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
    it("can handle content element pointing to other content element", () => {
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "d") as ContentNode,
            elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "b") as ContentNode
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "c" }] },
                b: { nextElementId: "d" },
                c: { nextElementId: "d" },
                d: {}
            }
        });
    });
    it("can handle content element pointing to end", () => {
        const { changedFlow } = changeNextElement(
            originalFlow,
            elementsInTree.find((entry) => entry.type === ElementType.End) as EndNode,
            elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "b") as ContentNode
        );
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "c" }] },
                b: { nextElementId: null },
                c: { nextElementId: "d" },
                d: {}
            }
        });
    });
    it("can handle diverging gateway branch pointing to content element", () => {
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
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "b" }] },
                b: { nextElementId: "c" },
                c: { nextElementId: "d" },
                d: {}
            }
        });
    });
    it("can handle diverging gateway branch pointing to end", () => {
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
            elements: {
                a: { nextElements: [{ id: "b" }, { id: null }] },
                b: { nextElementId: "c" },
                c: { nextElementId: "d" },
                d: {}
            }
        });
    });
});
