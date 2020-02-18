import { replaceAllLinks, cloneFlow } from "./editUtils";

import { ContentNode, DivergingGatewayBranch, ElementType } from "../../types/ModelElement";
import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

/**
 * Only content elements may be removed or gateway branches that point to converging gateways (to not remove other elements implicitly).
 *
 * @param {ContentNode | DivergingGatewayBranch} referenceElement - content element or diverging gateway branch
 * @returns {boolean} whether removeElement() is allowed to be called for the targeted element
 */
export const isRemoveElementAllowed = (referenceElement: ContentNode | DivergingGatewayBranch): boolean =>
    referenceElement.type === ElementType.ContentNode ||
    (referenceElement.type === ElementType.DivergingGatewayBranch && referenceElement.followingElement.type === ElementType.ConvergingGatewayBranch);

export const removeElement = (originalFlow: FlowModelerProps["flow"], referenceElement: ContentNode | DivergingGatewayBranch): EditActionResult => {
    const changedFlow = cloneFlow(originalFlow);
    switch (referenceElement.type) {
        case ElementType.ContentNode:
            const targetContentId = referenceElement.id;
            const targetContentElement = (changedFlow.elements[targetContentId] as unknown) as FlowContent;
            replaceAllLinks(changedFlow, targetContentId, targetContentElement.nextElementId);
            delete changedFlow.elements[targetContentId];
            break;
        case ElementType.DivergingGatewayBranch:
            const targetGatewayId = referenceElement.precedingElement.id;
            const precedingGatewayElement = (changedFlow.elements[targetGatewayId] as unknown) as FlowGatewayDiverging;
            precedingGatewayElement.nextElements.splice(referenceElement.branchIndex, 1);
            if (precedingGatewayElement.nextElements.length === 1) {
                // remove gateway as well, now that there is only one path left
                replaceAllLinks(changedFlow, targetGatewayId, precedingGatewayElement.nextElements[0].id);
                delete changedFlow.elements[targetGatewayId];
            }
            break;
    }
    return { changedFlow };
};
