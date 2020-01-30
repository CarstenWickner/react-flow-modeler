import { v4 } from "uuid";
import cloneDeep from "lodash.clonedeep";

import { FlowElementReference } from "../FlowElement";
import { isDivergingGateway } from "../modelUtils";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { ElementType } from "../../types/GridCellData";
import { EditActionResult } from "../../types/EditAction";

const addElement = (
    originalFlow: FlowModelerProps["flow"],
    precedingType: ElementType.Start | ElementType.Content | ElementType.GatewayConverging | ElementType.ConnectGatewayToElement,
    createElement: (nextElementId: string, data: { [key: string]: unknown } | undefined) => FlowContent | FlowGatewayDiverging,
    data: { [key: string]: unknown } | undefined,
    referenceElement?: FlowElementReference,
    branchIndex?: number
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    const newElementId = v4();
    let nextElementId: string;
    switch (precedingType) {
        case ElementType.Start:
            nextElementId = changedFlow.firstElementId;
            changedFlow.firstElementId = newElementId;
            break;
        case ElementType.Content:
            const precedingContentElement = (changedFlow.elements[referenceElement.getId()] as unknown) as FlowContent;
            nextElementId = precedingContentElement.nextElementId;
            precedingContentElement.nextElementId = newElementId;
            break;
        case ElementType.GatewayConverging:
            nextElementId = referenceElement.getId();
            const nextElementExists = nextElementId in changedFlow.elements;
            referenceElement
                .getPrecedingElements()
                .map((precedingElement) => changedFlow.elements[precedingElement.getId()])
                .forEach((precedingElement) => {
                    if (isDivergingGateway(precedingElement)) {
                        precedingElement.nextElements
                            .filter((possibleLink) =>
                                nextElementExists ? possibleLink.id === nextElementId : !(possibleLink.id in changedFlow.elements)
                            )
                            .forEach((link) => (link.id = newElementId));
                    } else {
                        precedingElement.nextElementId = newElementId;
                    }
                });
            break;
        case ElementType.ConnectGatewayToElement:
            const precedingGatewayElement = (changedFlow.elements[referenceElement.getId()] as unknown) as FlowGatewayDiverging;
            nextElementId = precedingGatewayElement.nextElements[branchIndex].id;
            precedingGatewayElement.nextElements[branchIndex].id = newElementId;
            break;
    }
    changedFlow.elements[newElementId] = createElement(nextElementId, data);
    return { changedFlow };
};

const createContentElement = (nextElementId: string | undefined, data: { [key: string]: unknown } | undefined): FlowContent => ({
    nextElementId,
    data
});

const createDivergingGateway = (nextElementId: string | undefined, data: { [key: string]: unknown } | undefined): FlowGatewayDiverging => ({
    nextElements: [{ id: nextElementId }, { id: nextElementId }],
    data
});

export const addContentElement = (
    originalFlow: FlowModelerProps["flow"],
    precedingType: ElementType.Start | ElementType.Content | ElementType.GatewayConverging | ElementType.ConnectGatewayToElement,
    data: { [key: string]: unknown } | undefined,
    referenceElement?: FlowElementReference,
    branchIndex?: number
): EditActionResult => addElement(originalFlow, precedingType, createContentElement, data, referenceElement, branchIndex);

export const addDivergingGateway = (
    originalFlow: FlowModelerProps["flow"],
    precedingType: ElementType.Start | ElementType.Content | ElementType.GatewayConverging | ElementType.ConnectGatewayToElement,
    data: { [key: string]: unknown } | undefined,
    referenceElement?: FlowElementReference,
    branchIndex?: number
): EditActionResult => addElement(originalFlow, precedingType, createDivergingGateway, data, referenceElement, branchIndex);
