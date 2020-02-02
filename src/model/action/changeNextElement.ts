import cloneDeep from "lodash.clonedeep";

import { FlowElementReference } from "../FlowElement";

import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { ElementType } from "../../types/GridCellData";

export const isChangeNextElementAllowed = (targetType: ElementType, referenceElement: FlowElementReference, branchIndex?: number): boolean =>
    (targetType === ElementType.Content || targetType === ElementType.ConnectGatewayToElement) &&
    referenceElement.getFollowingElements()[branchIndex || 0].getPrecedingElements().length > 1;

export const changeNextElement = (
    originalFlow: FlowModelerProps["flow"],
    newNextElement: FlowElementReference,
    originType: ElementType.Content | ElementType.ConnectGatewayToElement,
    originElement?: FlowElementReference,
    originBranchIndex?: number
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    const newNextElementId = newNextElement ? newNextElement.getId() : null;
    switch (originType) {
        case ElementType.Content:
            const contentElementInFlow = (changedFlow.elements[originElement.getId()] as unknown) as FlowContent;
            contentElementInFlow.nextElementId = newNextElementId;
            break;
        case ElementType.ConnectGatewayToElement:
            const divergingGatewayInFlow = (changedFlow.elements[originElement.getId()] as unknown) as FlowGatewayDiverging;
            divergingGatewayInFlow.nextElements[originBranchIndex].id = newNextElementId;
            break;
    }
    return { changedFlow };
};
