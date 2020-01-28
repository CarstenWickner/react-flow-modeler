import { addContentElement, addDivergingGateway } from "../../../src/model/action/addElement";
import { ElementType } from "../../../src/types/GridCellData";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../../src/types/FlowModelerProps";
import { createElementTree } from "../../../src/model/modelUtils";

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
            const updatedFlow = addElement(originalFlow, ElementType.Start, { y: "value" });

            const newElementId = updatedFlow.firstElementId;
            expect(newElementId).not.toBeNull();
            expect(newElementId).not.toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(2);
            expect(updatedFlow.elements[newElementId]).toEqual(expectedNewElement);
            expect(updatedFlow.elements.a).toEqual(originalFlow.elements.a);
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
            const updatedFlow = addElement(originalFlow, ElementType.Start, { defaultData: "x" });

            const firstElementId = updatedFlow.firstElementId;
            expect(firstElementId).not.toBeNull();
            expect(Object.keys(updatedFlow.elements)).toHaveLength(1);
            expect(updatedFlow.elements[firstElementId]).toEqual(expectedNewElement);
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
            const updatedFlow = addElement(originalFlow, ElementType.Content, { x: "y" }, aReference);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(3);
            const newElementId = (updatedFlow.elements.a as FlowContent).nextElementId;
            expect(newElementId).not.toBeNull();
            expect(updatedFlow.elements[newElementId]).toEqual(expectedNewElement);
            expect(updatedFlow.elements.b).toEqual(originalFlow.elements.b);
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
            const updatedFlow = addElement(originalFlow, ElementType.Content, { x: "y" }, aReference);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(2);
            const newElementId = (updatedFlow.elements.a as FlowContent).nextElementId;
            expect(newElementId).toBeDefined();
            expect(updatedFlow.elements[newElementId]).toEqual(expectedNewElement);
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
            const updatedFlow = addElement(originalFlow, ElementType.GatewayConverging, { x: "y" }, bReference);

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
            expect(updatedFlow.elements[newElementId]).toEqual(expectedNewElement);
            expect(updatedFlow.elements.b).toEqual(originalFlow.elements.b);
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
            const updatedFlow = addElement(originalFlow, ElementType.GatewayConverging, { x: "y" }, endReference);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(2);
            const gatewayBranches = (updatedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(2);
            const newElementId = gatewayBranches[0].id;
            expect(newElementId).toBeDefined();
            expect(updatedFlow.elements.a).toEqual({
                nextElements: [{ id: newElementId }, { id: newElementId }]
            });
            expect(updatedFlow.elements[newElementId]).toEqual(expectedNewElement);
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
            const updatedFlow = addElement(originalFlow, ElementType.ConnectGatewayToElement, { x: "y" }, aReference, 1);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(3);
            const gatewayBranches = (updatedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(3);
            const newElementId = gatewayBranches[1].id;
            expect(newElementId).toBeDefined();
            expect(newElementId).not.toEqual("b");
            expect(updatedFlow.elements.a).toEqual({
                nextElements: [{}, { id: newElementId }, { id: "b" }]
            });
            expect(updatedFlow.elements[newElementId]).toEqual(expectedNewElement);
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
            const updatedFlow = addElement(originalFlow, ElementType.ConnectGatewayToElement, { x: "y" }, aReference, 1);

            expect(updatedFlow.firstElementId).toEqual("a");
            expect(Object.keys(updatedFlow.elements)).toHaveLength(3);
            const gatewayBranches = (updatedFlow.elements.a as FlowGatewayDiverging).nextElements;
            expect(gatewayBranches).toHaveLength(3);
            const newElementId = gatewayBranches[1].id;
            expect(newElementId).toBeDefined();
            expect(newElementId).not.toEqual("b");
            expect(updatedFlow.elements.a).toEqual({
                nextElements: [{}, { id: newElementId }, { id: "b" }]
            });
            expect(updatedFlow.elements[newElementId]).toEqual(expectedNewElement);
        });
    });
});
