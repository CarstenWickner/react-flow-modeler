import { cloneFlow } from "./editUtils";

import { DivergingGatewayNode, StepNode, ConvergingGatewayBranch, ElementType } from "../../types/ModelElement";
import { FlowModelerProps, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { EditActionResult } from "../../types/EditAction";

export const addBranch = (
    originalFlow: FlowModelerProps["flow"],
    gateway: DivergingGatewayNode,
    conditionData: { [key: string]: unknown } | undefined
): EditActionResult => {
    let nextConvergingBranch: DivergingGatewayNode | StepNode | ConvergingGatewayBranch = gateway;
    do {
        if (nextConvergingBranch.type === ElementType.DivergingGatewayNode) {
            nextConvergingBranch = nextConvergingBranch.followingBranches[nextConvergingBranch.followingBranches.length - 1].followingElement;
        } else {
            // there can be no EndNode after a Diverging Gateway before the next Converging Gateway
            nextConvergingBranch = (nextConvergingBranch.followingElement as unknown) as DivergingGatewayNode | StepNode | ConvergingGatewayBranch;
        }
    } while (nextConvergingBranch.type !== ElementType.ConvergingGatewayBranch);
    const nextElement = nextConvergingBranch.followingElement.followingElement;
    const changedFlow = cloneFlow(originalFlow);
    const gatewayInFlow = changedFlow.elements[gateway.id] as FlowGatewayDiverging;
    gatewayInFlow.nextElements.push({ id: nextElement.type === ElementType.EndNode ? null : nextElement.id, conditionData });
    return { changedFlow };
};
