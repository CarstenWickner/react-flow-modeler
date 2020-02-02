import { changeNextElement } from "../../../src/model/action/changeNextElement";

import { createMinimalElementTreeStructure } from "../../../src/model/modelUtils";
import { ElementType } from "../../../src/types/GridCellData";

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
        const { changedFlow } = changeNextElement(originalFlow, elementsInTree.get("d"), ElementType.Content, elementsInTree.get("b"));
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
        const { changedFlow } = changeNextElement(originalFlow, null, ElementType.Content, elementsInTree.get("b"));
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
            elementsInTree.get("b"),
            ElementType.ConnectGatewayToElement,
            elementsInTree.get("a"),
            1
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
        const { changedFlow } = changeNextElement(originalFlow, null, ElementType.ConnectGatewayToElement, elementsInTree.get("a"), 1);
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
