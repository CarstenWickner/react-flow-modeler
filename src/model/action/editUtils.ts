import { isDivergingGateway } from "../modelUtils";
import { FlowElementReference } from "../FlowElement";

import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

const checkIfIdNeedsReplacing = (flow: FlowModelerProps["flow"], currentId: string): ((id: string) => boolean) => {
    const currentIdIsPointingToEnd = !(currentId in flow.elements);
    return (id: string): boolean => id === currentId || (currentIdIsPointingToEnd && !(id in flow.elements));
};

const createLinkReplacer = (
    needsReplacing: (id: string) => boolean,
    replacementId: string
): ((element: FlowContent | FlowGatewayDiverging) => void) => {
    const replaceBranchReference = (branch: { id?: string }): void => {
        if (needsReplacing(branch.id)) {
            branch.id = replacementId;
        }
    };
    return (element: FlowContent | FlowGatewayDiverging): void => {
        if (isDivergingGateway(element)) {
            element.nextElements.forEach(replaceBranchReference);
        } else if (needsReplacing(element.nextElementId)) {
            element.nextElementId = replacementId;
        }
    };
};

export const replaceAllLinks = (flow: FlowModelerProps["flow"], currentId: string, replacementId: string): void => {
    const needsReplacing = checkIfIdNeedsReplacing(flow, currentId);
    Object.values(flow.elements).forEach(createLinkReplacer(needsReplacing, replacementId));
    if (needsReplacing(flow.firstElementId)) {
        flow.firstElementId = replacementId || null;
    }
};

export const replaceLinksInList = (
    targets: Array<FlowElementReference>,
    flow: FlowModelerProps["flow"],
    currentId: string,
    replacementId: string
): void => {
    const replacingContainedLink = createLinkReplacer(checkIfIdNeedsReplacing(flow, currentId), replacementId);
    targets.map((targetReference) => flow.elements[targetReference.getId()]).forEach(replacingContainedLink);
};
