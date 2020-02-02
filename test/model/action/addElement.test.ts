import { addContentElement, addDivergingGateway } from "../../../src/model/action/addElement";

import { createElementTree } from "../../../src/model/modelUtils";
import { EditActionResult } from "../../../src/types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../../src/types/FlowModelerProps";
import { ElementType } from "../../../src/types/GridCellData";

describe("addContentElement()", () => {
    describe("adding element after start", () => {
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: "a", data: { y: "value" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: "a" }, { id: "a" }], data: { y: "value" } }}
        `("for simple model (adding: $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElementId: null }
                }
            };
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.Start, { y: "value" });

            const newElementId = changedFlow.firstElementId;
            expect(newElementId).not.toBeNull();
            expect(newElementId).not.toEqual("a");
            expect(Object.keys(changedFlow.elements)).toHaveLength(2);
            expect(changedFlow.elements[newElementId]).toEqual(expectedNewElement);
            expect(changedFlow.elements.a).toEqual(originalFlow.elements.a);
        });
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: null, data: { defaultData: "x" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: null }, { id: null }], data: { defaultData: "x" } }}
        `("for empty model (adding $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: null,
                elements: {}
            };
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.Start, { defaultData: "x" });

            const firstElementId = changedFlow.firstElementId;
            expect(firstElementId).not.toBeNull();
            expect(Object.keys(changedFlow.elements)).toHaveLength(1);
            expect(changedFlow.elements[firstElementId]).toEqual(expectedNewElement);
        });
    });
    describe("adding element after content that", () => {
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: "b", data: { x: "y" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: "b" }, { id: "b" }], data: { x: "y" } }}
        `("is followed by some other element (adding $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElementId: "b" },
                    b: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.Content, { x: "y" }, aReference);

            expect(changedFlow.firstElementId).toEqual("a");
            expect(Object.keys(changedFlow.elements)).toHaveLength(3);
            const newElementId = (changedFlow.elements.a as FlowContent).nextElementId;
            expect(newElementId).not.toBeNull();
            expect(changedFlow.elements[newElementId]).toEqual(expectedNewElement);
            expect(changedFlow.elements.b).toEqual(originalFlow.elements.b);
        });
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: undefined, data: { x: "y" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: undefined }, { id: undefined }], data: { x: "y" } }}
        `("is the last before end (adding: $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.Content, { x: "y" }, aReference);

            expect(changedFlow.firstElementId).toEqual("a");
            expect(Object.keys(changedFlow.elements)).toHaveLength(2);
            const newElementId = (changedFlow.elements.a as FlowContent).nextElementId;
            expect(newElementId).toBeDefined();
            expect(changedFlow.elements[newElementId]).toEqual(expectedNewElement);
        });
    });
    describe("adding element after converging gateway that", () => {
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: "b", data: { x: "y" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: "b" }, { id: "b" }], data: { x: "y" } }}
        `("is followed by some other element (adding: $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{ id: "b" }, { id: "b" }] },
                    b: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const bReference = aReference.getFollowingElements()[0];
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.GatewayConverging, { x: "y" }, bReference);

            expect(changedFlow.firstElementId).toEqual("a");
            expect(Object.keys(changedFlow.elements)).toHaveLength(3);
            const gatewayBranches = (changedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(2);
            const newElementId = gatewayBranches[0].id;
            expect(newElementId).toBeDefined();
            expect(newElementId).not.toEqual("b");
            expect(changedFlow.elements.a).toEqual({
                nextElements: [{ id: newElementId }, { id: newElementId }]
            });
            expect(changedFlow.elements[newElementId]).toEqual(expectedNewElement);
            expect(changedFlow.elements.b).toEqual(originalFlow.elements.b);
        });
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: null, data: { x: "y" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: null }, { id: null }], data: { x: "y" } }}
        `("is before end (adding $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{}, {}] }
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const endReference = aReference.getFollowingElements()[0];
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.GatewayConverging, { x: "y" }, endReference);

            expect(changedFlow.firstElementId).toEqual("a");
            expect(Object.keys(changedFlow.elements)).toHaveLength(2);
            const gatewayBranches = (changedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(2);
            const newElementId = gatewayBranches[0].id;
            expect(newElementId).toBeDefined();
            expect(changedFlow.elements.a).toEqual({
                nextElements: [{ id: newElementId }, { id: newElementId }]
            });
            expect(changedFlow.elements[newElementId]).toEqual(expectedNewElement);
        });
    });
    describe("adding element after diverging gateway connector that", () => {
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: "b", data: { x: "y" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: "b" }, { id: "b" }], data: { x: "y" } }}
        `("is followed by some other element (adding: $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{}, { id: "b" }, { id: "b" }] },
                    b: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.ConnectGatewayToElement, { x: "y" }, aReference, 1);

            expect(changedFlow.firstElementId).toEqual("a");
            expect(Object.keys(changedFlow.elements)).toHaveLength(3);
            const gatewayBranches = (changedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(3);
            const newElementId = gatewayBranches[1].id;
            expect(newElementId).toBeDefined();
            expect(newElementId).not.toEqual("b");
            expect(changedFlow.elements.a).toEqual({
                nextElements: [{}, { id: newElementId }, { id: "b" }]
            });
            expect(changedFlow.elements[newElementId]).toEqual(expectedNewElement);
        });
        it.each`
            type                   | addElement             | expectedNewElement
            ${"content"}           | ${addContentElement}   | ${{ nextElementId: undefined, data: { x: "y" } }}
            ${"diverging gateway"} | ${addDivergingGateway} | ${{ nextElements: [{ id: undefined }, { id: undefined }], data: { x: "y" } }}
        `("is before converging end gateway (adding: $type)", ({ addElement, expectedNewElement }) => {
            const originalFlow: FlowModelerProps["flow"] = {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{}, {}, { id: "b" }] },
                    b: {}
                }
            };
            const aReference = createElementTree(originalFlow, "top");
            const { changedFlow }: EditActionResult = addElement(originalFlow, ElementType.ConnectGatewayToElement, { x: "y" }, aReference, 1);

            expect(changedFlow.firstElementId).toEqual("a");
            expect(Object.keys(changedFlow.elements)).toHaveLength(3);
            const gatewayBranches = (changedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(3);
            const newElementId = gatewayBranches[1].id;
            expect(newElementId).toBeDefined();
            expect(newElementId).not.toEqual("b");
            expect(changedFlow.elements.a).toEqual({
                nextElements: [{}, { id: newElementId }, { id: "b" }]
            });
            expect(changedFlow.elements[newElementId]).toEqual(expectedNewElement);
        });
    });
});
