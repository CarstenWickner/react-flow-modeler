import cloneDeep from "lodash.clonedeep";

import { replaceAllLinks } from "./editUtils";
import { FlowElementReference } from "../FlowElement";

import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";
import { ElementType } from "../../types/GridCellData";

/**
 * Only content elements may be removed or gateway branches that point to converging gateways (to not remove other elements implicitly).
 *
 * @param {ElementType} targetType - indication of type of element being target for removal
 * @param {FlowElementReference} referenceElement - content or diverging gateway element
 * @param {?number} branchIndex - index in reference gateway identifying the targeted ConnectGatewayToElement
 * @returns {boolean} whether removeElement() is allowed to be called for the targeted element
 */
export const isRemoveElementAllowed = (targetType: ElementType, referenceElement: FlowElementReference, branchIndex?: number): boolean =>
    targetType === ElementType.Content ||
    (targetType === ElementType.ConnectGatewayToElement && referenceElement.getFollowingElements()[branchIndex].getPrecedingElements().length > 1);

export const removeElement = (
    originalFlow: FlowModelerProps["flow"],
    targetType: ElementType.Content | ElementType.ConnectGatewayToElement,
    referenceElement: FlowElementReference,
    branchIndex?: number
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    const targetId = referenceElement.getId();
    switch (targetType) {
        case ElementType.Content:
            const targetContentElement = (changedFlow.elements[targetId] as unknown) as FlowContent;
            replaceAllLinks(changedFlow, targetId, targetContentElement.nextElementId);
            delete changedFlow.elements[targetId];
            break;
        case ElementType.ConnectGatewayToElement:
            const precedingGatewayElement = (changedFlow.elements[targetId] as unknown) as FlowGatewayDiverging;
            precedingGatewayElement.nextElements.splice(branchIndex, 1);
            if (precedingGatewayElement.nextElements.length === 1) {
                // remove gateway as well, now that there is only one path left
                replaceAllLinks(changedFlow, targetId, precedingGatewayElement.nextElements[0].id);
                delete changedFlow.elements[targetId];
            }
            break;
    }
    return { changedFlow };
};
