import cloneDeep from "lodash.clonedeep";

import { FlowElementReference } from "../FlowElement";
import { isDivergingGateway } from "../modelUtils";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { ElementType } from "../../types/GridCellData";
import { EditActionResult } from "../../types/EditAction";

const isElementReferencing = (elementId: string) => (element: FlowContent | FlowGatewayDiverging): boolean => {
    if (isDivergingGateway(element)) {
        return element.nextElements.some(({ id }) => id === elementId);
    }
    return element.nextElementId === elementId;
};

const isElementReferenced = (flow: FlowModelerProps["flow"], elementId: string): boolean =>
    Object.values(flow.elements).some(isElementReferencing(elementId));

const removeOrphanElement = (flow: FlowModelerProps["flow"], elementId: string): void => {
    if (flow.elements[elementId] && !isElementReferenced(flow, elementId)) {
        const orphan = flow.elements[elementId];
        delete flow.elements[elementId];
        if (isDivergingGateway(orphan)) {
            orphan.nextElements.forEach(({ id }) => removeOrphanElement(flow, id));
        } else {
            removeOrphanElement(flow, orphan.nextElementId);
        }
    }
};

const replaceLink = (flow: FlowModelerProps["flow"], currentId: string, replacementId: string): void => {
    Object.values(flow.elements).forEach((element: FlowContent | FlowGatewayDiverging) => {
        if (isDivergingGateway(element)) {
            element.nextElements.forEach((branch) => (branch.id = branch.id === currentId ? replacementId : branch.id));
        } else if (element.nextElementId === currentId) {
            element.nextElementId = replacementId;
        }
    });
    if (flow.firstElementId === currentId) {
        flow.firstElementId = replacementId || null;
    }
};

export const removeElement = (
    originalFlow: FlowModelerProps["flow"],
    targetType: ElementType.Content | ElementType.GatewayDiverging | ElementType.ConnectGatewayToElement,
    referenceElement: FlowElementReference,
    branchIndex?: number
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    switch (targetType) {
        case ElementType.Content:
            const targetId = referenceElement.getId();
            const targetContentElement = (changedFlow.elements[targetId] as unknown) as FlowContent;
            replaceLink(changedFlow, targetId, targetContentElement.nextElementId);
            delete changedFlow.elements[referenceElement.getId()];
            break;
        case ElementType.ConnectGatewayToElement:
            const precedingGatewayElement = (changedFlow.elements[referenceElement.getId()] as unknown) as FlowGatewayDiverging;
            const nextElementId = precedingGatewayElement.nextElements[branchIndex].id;
            precedingGatewayElement.nextElements.splice(branchIndex, 1);
            removeOrphanElement(changedFlow, nextElementId);
            if (precedingGatewayElement.nextElements.length === 1) {
                // remove gateway as well, now that there is only one path left
                delete changedFlow.elements[referenceElement.getId()];
                replaceLink(changedFlow, referenceElement.getId(), precedingGatewayElement.nextElements[0].id);
            }
            break;
    }
    return { changedFlow };
};
