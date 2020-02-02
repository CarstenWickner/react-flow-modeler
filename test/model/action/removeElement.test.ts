import { removeElement } from "../../../src/model/action/removeElement";

import { createMinimalElementTreeStructure } from "../../../src/model/modelUtils";
import { ElementType } from "../../../src/types/GridCellData";

describe("removeElement()", () => {
    const originalFlow = {
        firstElementId: "a",
        elements: {
            a: { nextElementId: "b" },
            b: { nextElements: [{ id: "c" }, { id: "d" }, {}] },
            c: { nextElementId: "d" },
            d: { nextElementId: "e" },
            e: {}
        }
    };
    const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
    describe("can handle content element", () => {
        it("being first in model", () => {
            const { changedFlow } = removeElement(originalFlow, ElementType.Content, elementsInTree.get("a"));
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "b",
                elements: {
                    b: { nextElements: [{ id: "c" }, { id: "d" }, {}] },
                    c: { nextElementId: "d" },
                    d: { nextElementId: "e" },
                    e: {}
                }
            });
        });
        it("being only one in model", () => {
            const modelWithOneElement = { firstElementId: "a", elements: { a: {} } };
            const structureWithOneElement = createMinimalElementTreeStructure(originalFlow);
            const { changedFlow } = removeElement(modelWithOneElement, ElementType.Content, structureWithOneElement.elementsInTree.get("a"));
            expect(changedFlow).not.toBe(modelWithOneElement);
            expect(changedFlow).toEqual({
                firstElementId: null,
                elements: {}
            });
        });
        it("behind converging gateway", () => {
            const { changedFlow } = removeElement(originalFlow, ElementType.Content, elementsInTree.get("d"));
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: {
                    a: { nextElementId: "b" },
                    b: { nextElements: [{ id: "c" }, { id: "e" }, {}] },
                    c: { nextElementId: "e" },
                    e: {}
                }
            });
        });
        it("before end", () => {
            const { changedFlow } = removeElement(originalFlow, ElementType.Content, elementsInTree.get("e"));
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: {
                    a: { nextElementId: "b" },
                    b: { nextElements: [{ id: "c" }, { id: "d" }, {}] },
                    c: { nextElementId: "d" },
                    d: { nextElementId: undefined }
                }
            });
        });
    });
    describe("can handle diverging gateway branch", () => {
        it("with multiple branches still remaining", () => {
            const { changedFlow } = removeElement(originalFlow, ElementType.ConnectGatewayToElement, elementsInTree.get("b"), 1);
            expect(changedFlow).not.toBe(originalFlow);
            expect(changedFlow).toEqual({
                firstElementId: "a",
                elements: {
                    a: { nextElementId: "b" },
                    b: { nextElements: [{ id: "c" }, {}] },
                    c: { nextElementId: "d" },
                    d: { nextElementId: "e" },
                    e: {}
                }
            });
        });
        it("also removing gateway with only one branch remaining", () => {
            const flowBeforeRemoval = {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{ id: "c" }, { id: "b" }] },
                    b: { nextElementId: "c" },
                    c: {}
                }
            };
            const structureBeforeRemoval = createMinimalElementTreeStructure(flowBeforeRemoval);
            const { changedFlow } = removeElement(
                flowBeforeRemoval,
                ElementType.ConnectGatewayToElement,
                structureBeforeRemoval.elementsInTree.get("a"),
                0
            );
            expect(changedFlow).not.toBe(flowBeforeRemoval);
            expect(changedFlow).toEqual({
                firstElementId: "b",
                elements: {
                    b: { nextElementId: "c" },
                    c: {}
                }
            });
        });
    });
});
