import { cloneFlow } from "./editUtils";

import { ContentNode, DivergingGatewayNode, DivergingGatewayBranch, ConvergingGatewayNode, ElementType, EndNode } from "../../types/ModelElement";
import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

export const isChangeNextElementAllowed = (referenceElement: ContentNode | DivergingGatewayBranch): boolean =>
    referenceElement.followingElement && referenceElement.followingElement.type === ElementType.ConvergingGatewayBranch;

export const changeNextElement = (
    originalFlow: FlowModelerProps["flow"],
    newNextElement: ContentNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode,
    originElement: ContentNode | DivergingGatewayBranch
): EditActionResult => {
    const changedFlow = cloneFlow(originalFlow);
    let newNextElementId;
    if (newNextElement.type === ElementType.EndNode) {
        newNextElementId = null;
    } else if (newNextElement.type !== ElementType.ConvergingGatewayNode) {
        newNextElementId = newNextElement.id;
    } else if (newNextElement.followingElement.type !== ElementType.EndNode) {
        newNextElementId = newNextElement.followingElement.id;
    } else {
        newNextElementId = null;
    }
    switch (originElement.type) {
        case ElementType.ContentNode:
            const contentElementInFlow = (changedFlow.elements[originElement.id] as unknown) as FlowContent;
            contentElementInFlow.nextElementId = newNextElementId;
            break;
        case ElementType.DivergingGatewayBranch:
            const divergingGatewayInFlow = (changedFlow.elements[originElement.precedingElement.id] as unknown) as FlowGatewayDiverging;
            divergingGatewayInFlow.nextElements[originElement.branchIndex].id = newNextElementId;
            break;
    }
    return { changedFlow };
};
