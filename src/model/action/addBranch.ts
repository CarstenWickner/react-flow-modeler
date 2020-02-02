import cloneDeep from "lodash.clonedeep";

import { FlowElementReference } from "../FlowElement";
import { FlowModelerProps, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { EditActionResult } from "../../types/EditAction";

export const addBranch = (
    originalFlow: FlowModelerProps["flow"],
    data: { [key: string]: unknown } | undefined,
    gateway: FlowElementReference
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    const gatewayInFlow = changedFlow.elements[gateway.getId()] as FlowGatewayDiverging;
    let nextConvergingGateway: FlowElementReference = gateway;
    do {
        const followings = nextConvergingGateway.getFollowingElements();
        nextConvergingGateway = followings[followings.length - 1];
    } while (nextConvergingGateway.getPrecedingElements().length < 2);
    gatewayInFlow.nextElements.push({ id: nextConvergingGateway.getId(), conditionData: data });
    return { changedFlow };
};
