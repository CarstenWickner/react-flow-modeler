import { isDivergingGateway } from "../modelUtils";

import { ContentNode, DivergingGatewayBranch, ElementType } from "../../types/ModelElement";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

export const cloneFlow = (originalFlow: FlowModelerProps["flow"]): FlowModelerProps["flow"] => {
    const clone: FlowModelerProps["flow"] = {
        firstElementId: originalFlow.firstElementId,
        elements: {}
    };
    for (const key in originalFlow.elements) {
        const element = originalFlow.elements[key];
        if (isDivergingGateway(element)) {
            const { data } = element;
            // preserving the original "data" and "conditionData" entries
            clone.elements[key] = { nextElements: element.nextElements.map((branch) => ({ ...branch })), data };
        } else {
            const { nextElementId, data } = element;
            // preserve the original "data" entry
            clone.elements[key] = { nextElementId, data };
        }
    }
    return clone;
};

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
    targets: Array<ContentNode | DivergingGatewayBranch>,
    flow: FlowModelerProps["flow"],
    currentId: string,
    replacementId: string
): void => {
    const replacingContainedLink = createLinkReplacer(checkIfIdNeedsReplacing(flow, currentId), replacementId);
    targets
        .map((target) => flow.elements[target.type === ElementType.ContentNode ? target.id : target.precedingElement.id])
        .forEach(replacingContainedLink);
};
