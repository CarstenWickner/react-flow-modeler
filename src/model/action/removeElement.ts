import cloneDeep from "lodash.clonedeep";

import { ContentNode, DivergingGatewayBranch, ElementType } from "../ModelElement";
import { replaceAllLinks } from "./editUtils";

import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

/**
 * Only content elements may be removed or gateway branches that point to converging gateways (to not remove other elements implicitly).
 *
 * @param {ContentNode | DivergingGatewayBranch} referenceElement - content element or diverging gateway branch
 * @returns {boolean} whether removeElement() is allowed to be called for the targeted element
 */
export const isRemoveElementAllowed = (referenceElement: ContentNode | DivergingGatewayBranch): boolean =>
    referenceElement.type === ElementType.Content ||
    (referenceElement.type === ElementType.ConnectGatewayToElement && referenceElement.followingElement.type === ElementType.ConnectElementToGateway);

export const removeElement = (originalFlow: FlowModelerProps["flow"], referenceElement: ContentNode | DivergingGatewayBranch): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    switch (referenceElement.type) {
        case ElementType.Content:
            const targetContentId = referenceElement.id;
            const targetContentElement = (changedFlow.elements[targetContentId] as unknown) as FlowContent;
            replaceAllLinks(changedFlow, targetContentId, targetContentElement.nextElementId);
            delete changedFlow.elements[targetContentId];
            break;
        case ElementType.ConnectGatewayToElement:
            const targetGatewayId = referenceElement.precedingElement.id;
            const precedingGatewayElement = (changedFlow.elements[targetGatewayId] as unknown) as FlowGatewayDiverging;
            precedingGatewayElement.nextElements.splice(referenceElement.branchIndex, 1);
            if (precedingGatewayElement.nextElements.length === 1) {
                // remove gateway as well, now that there is only one path left
                replaceAllLinks(changedFlow, targetGatewayId, precedingGatewayElement.nextElements[0].id);
                delete changedFlow.elements[targetContentId];
            }
            break;
    }
    return { changedFlow };
};
