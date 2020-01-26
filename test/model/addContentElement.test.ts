import { addContentElement } from "../../src/model/addContentElement";
import { ElementType } from "../../src/types/GridCellData";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../src/types/FlowModelerProps";
import { createElementTree } from "../../src/model/modelUtils";

describe("addContentElement()", () => {
    describe("adding content element after start", () => {
        it("for simple model", () => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElementId: null }
                }
            };
            const updatedFlow = addContentElement(originalFlow, ElementType.Start, { y: "value" });

            const newElementId = updatedFlow.firstElementId;
            expect(newElementId).not.toBeNull();
            expect(newElementId).not.toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(2);
            expect(updatedFlow.elements[newElementId]).toEqual({
                nextElementId: "a",
                data: { y: "value" }
            });
            expect(updatedFlow.elements.a).toEqual(originalFlow.elements.a);
        });
        it("for empty model", () => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: null,
                elements: {}
            };
            const updatedFlow = addContentElement(originalFlow, ElementType.Start, { defaultData: "x" });

            const firstElementId = updatedFlow.firstElementId;
            expect(firstElementId).not.toBeNull();
            expect(Object.keys(updatedFlow.elements)).toHaveLength(1);
            expect(updatedFlow.elements[firstElementId]).toEqual({
                nextElementId: null,
                data: { defaultData: "x" }
            });
        });
    });
    describe("adding content element after other content", () => {
        it("that is followed by some other element", () => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElementId: "b" },
                    b: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const updatedFlow = addContentElement(originalFlow, ElementType.Content, { x: "y" }, aReference);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(3);
            const newElementId = (updatedFlow.elements.a as FlowContent).nextElementId;
            expect(newElementId).not.toBeNull();
            expect(updatedFlow.elements[newElementId]).toEqual({
                nextElementId: "b",
                data: { x: "y" }
            });
            expect(updatedFlow.elements.b).toEqual(originalFlow.elements.b);
        });
        it("that is the last before end", () => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const updatedFlow = addContentElement(originalFlow, ElementType.Content, { x: "y" }, aReference);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(2);
            const newElementId = (updatedFlow.elements.a as FlowContent).nextElementId;
            expect(newElementId).toBeDefined();
            expect(updatedFlow.elements[newElementId]).toEqual({
                nextElementId: undefined,
                data: { x: "y" }
            });
        });
    });
    describe("adding content element after converging gateway", () => {
        it("that is followed by some other element", () => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{ id: "b" }, { id: "b" }] },
                    b: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const bReference = aReference.getFollowingElements()[0];
            const updatedFlow = addContentElement(originalFlow, ElementType.GatewayConverging, { x: "y" }, bReference);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(3);
            const gatewayBranches = (updatedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(2);
            const newElementId = gatewayBranches[0].id;
            expect(newElementId).toBeDefined();
            expect(newElementId).not.toEqual("b");
            expect(updatedFlow.elements.a).toEqual({
                nextElements: [{ id: newElementId }, { id: newElementId }]
            });
            expect(updatedFlow.elements[newElementId]).toEqual({
                nextElementId: "b",
                data: { x: "y" }
            });
            expect(updatedFlow.elements.b).toEqual(originalFlow.elements.b);
        });
        it.skip("that is before end", () => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{}, {}] }
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const endReference = aReference.getFollowingElements()[0];
            const updatedFlow = addContentElement(originalFlow, ElementType.GatewayConverging, { x: "y" }, endReference);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(2);
            const gatewayBranches = (updatedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(2);
            const newElementId = gatewayBranches[0].id;
            expect(newElementId).toBeDefined();
            expect(updatedFlow.elements.a).toEqual({
                nextElements: [{ id: newElementId }, { id: newElementId }]
            });
            expect(updatedFlow.elements[newElementId]).toEqual({
                nextElementId: undefined,
                data: { x: "y" }
            });
        });
    });
});
