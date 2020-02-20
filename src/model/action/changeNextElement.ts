import { cloneFlow } from "./editUtils";

import { StepNode, DivergingGatewayNode, DivergingGatewayBranch, ConvergingGatewayNode, ElementType, EndNode } from "../../types/ModelElement";
import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowStep, FlowGatewayDiverging } from "../../types/FlowModelerProps";

export const isChangeNextElementAllowed = (referenceElement: StepNode | DivergingGatewayBranch): boolean =>
    referenceElement.followingElement && referenceElement.followingElement.type === ElementType.ConvergingGatewayBranch;

export const changeNextElement = (
    originalFlow: FlowModelerProps["flow"],
    newNextElement: StepNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode,
    originElement: StepNode | DivergingGatewayBranch
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
        case ElementType.StepNode:
            const stepElementInFlow = (changedFlow.elements[originElement.id] as unknown) as FlowStep;
            stepElementInFlow.nextElementId = newNextElementId;
            break;
        case ElementType.DivergingGatewayBranch:
            const divergingGatewayInFlow = (changedFlow.elements[originElement.precedingElement.id] as unknown) as FlowGatewayDiverging;
            divergingGatewayInFlow.nextElements[originElement.branchIndex].id = newNextElementId;
            break;
    }
    return { changedFlow };
};
