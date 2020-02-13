import cloneDeep from "lodash.clonedeep";

import { DivergingGatewayNode, ContentNode, ConvergingGatewayBranch, ElementType } from "../ModelElement";
import { FlowModelerProps, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { EditActionResult } from "../../types/EditAction";

export const addBranch = (
    originalFlow: FlowModelerProps["flow"],
    gateway: DivergingGatewayNode,
    data: { [key: string]: unknown } | undefined
): EditActionResult => {
    let nextConvergingBranch: DivergingGatewayNode | ContentNode | ConvergingGatewayBranch = gateway;
    do {
        if (nextConvergingBranch.type === ElementType.GatewayDiverging) {
            nextConvergingBranch = nextConvergingBranch.followingBranches[nextConvergingBranch.followingBranches.length - 1].followingElement;
        } else {
            // there can be no EndNode after a Diverging Gateway before the next Converging Gateway
            nextConvergingBranch = (nextConvergingBranch.followingElement as unknown) as DivergingGatewayNode | ContentNode | ConvergingGatewayBranch;
        }
    } while (nextConvergingBranch.type !== ElementType.ConnectElementToGateway);
    const nextElement = nextConvergingBranch.followingElement.followingElement;
    const changedFlow = cloneDeep(originalFlow);
    const gatewayInFlow = changedFlow.elements[gateway.id] as FlowGatewayDiverging;
    gatewayInFlow.nextElements.push({ id: nextElement.type === ElementType.End ? null : nextElement.id, conditionData: data });
    return { changedFlow };
};
