import cloneDeep from "lodash.clonedeep";

import { replaceAllLinks } from "./editUtils";
import { FlowElementReference } from "../FlowElement";
import { isDivergingGateway } from "../modelUtils";

import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { ElementType } from "../../types/GridCellData";

const isElementReferencing = (elementId: string) => (element: FlowContent | FlowGatewayDiverging): boolean => {
    if (isDivergingGateway(element)) {
        return element.nextElements.some(({ id }) => id === elementId);
    }
    return element.nextElementId === elementId;
};

const isElementReferenced = (flow: FlowModelerProps["flow"], elementId: string): boolean =>
    Object.values(flow.elements).some(isElementReferencing(elementId));

const removeOrphanElement = (flow: FlowModelerProps["flow"], elementId: string): void => {
    if (elementId in flow.elements && !isElementReferenced(flow, elementId)) {
        const orphan = flow.elements[elementId];
        delete flow.elements[elementId];
        if (isDivergingGateway(orphan)) {
            orphan.nextElements.forEach(({ id }) => removeOrphanElement(flow, id));
        } else {
            removeOrphanElement(flow, orphan.nextElementId);
        }
    }
};

export const removeElement = (
    originalFlow: FlowModelerProps["flow"],
    targetType: ElementType.Content | ElementType.GatewayDiverging | ElementType.ConnectGatewayToElement,
    referenceElement: FlowElementReference,
    branchIndex?: number
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    const targetId = referenceElement.getId();
    switch (targetType) {
        case ElementType.Content:
            const targetContentElement = (changedFlow.elements[targetId] as unknown) as FlowContent;
            replaceAllLinks(changedFlow, targetId, targetContentElement.nextElementId);
            delete changedFlow.elements[targetId];
            break;
        case ElementType.ConnectGatewayToElement:
            const precedingGatewayElement = (changedFlow.elements[targetId] as unknown) as FlowGatewayDiverging;
            const nextElementId = precedingGatewayElement.nextElements[branchIndex].id;
            precedingGatewayElement.nextElements.splice(branchIndex, 1);
            removeOrphanElement(changedFlow, nextElementId);
            if (precedingGatewayElement.nextElements.length === 1) {
                // remove gateway as well, now that there is only one path left
                replaceAllLinks(changedFlow, targetId, precedingGatewayElement.nextElements[0].id);
                delete changedFlow.elements[targetId];
            }
            break;
    }
    return { changedFlow };
};
