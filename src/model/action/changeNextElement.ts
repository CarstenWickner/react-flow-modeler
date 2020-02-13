import cloneDeep from "lodash.clonedeep";

import { ContentNode, DivergingGatewayNode, DivergingGatewayBranch, ConvergingGatewayNode, ElementType, EndNode } from "../ModelElement";

import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

export const isChangeNextElementAllowed = (referenceElement: ContentNode | DivergingGatewayBranch): boolean =>
    referenceElement.followingElement && referenceElement.followingElement.type === ElementType.ConnectElementToGateway;

export const changeNextElement = (
    originalFlow: FlowModelerProps["flow"],
    newNextElement: ContentNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode,
    originElement: ContentNode | DivergingGatewayBranch
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    let newNextElementId;
    if (newNextElement.type === ElementType.End) {
        newNextElementId = null;
    } else if (newNextElement.type !== ElementType.GatewayConverging) {
        newNextElementId = newNextElement.id;
    } else if (newNextElement.followingElement.type !== ElementType.End) {
        newNextElementId = newNextElement.followingElement.id;
    } else {
        newNextElementId = null;
    }
    switch (originElement.type) {
        case ElementType.Content:
            const contentElementInFlow = (changedFlow.elements[originElement.id] as unknown) as FlowContent;
            contentElementInFlow.nextElementId = newNextElementId;
            break;
        case ElementType.ConnectGatewayToElement:
            const divergingGatewayInFlow = (changedFlow.elements[originElement.precedingElement.id] as unknown) as FlowGatewayDiverging;
            divergingGatewayInFlow.nextElements[originElement.branchIndex].id = newNextElementId;
            break;
    }
    return { changedFlow };
};
