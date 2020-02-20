import { replaceAllLinks, cloneFlow } from "./editUtils";

import { StepNode, DivergingGatewayBranch, ElementType } from "../../types/ModelElement";
import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowStep, FlowGatewayDiverging } from "../../types/FlowModelerProps";

/**
 * Only step elements may be removed or gateway branches that point to converging gateways (to not remove other elements implicitly).
 *
 * @param {StepNode | DivergingGatewayBranch} referenceElement - step element or diverging gateway branch
 * @returns {boolean} whether removeElement() is allowed to be called for the targeted element
 */
export const isRemoveElementAllowed = (referenceElement: StepNode | DivergingGatewayBranch): boolean =>
    referenceElement.type === ElementType.StepNode ||
    (referenceElement.type === ElementType.DivergingGatewayBranch && referenceElement.followingElement.type === ElementType.ConvergingGatewayBranch);

export const removeElement = (originalFlow: FlowModelerProps["flow"], referenceElement: StepNode | DivergingGatewayBranch): EditActionResult => {
    const changedFlow = cloneFlow(originalFlow);
    switch (referenceElement.type) {
        case ElementType.StepNode:
            const targetStepId = referenceElement.id;
            const targetStepElement = (changedFlow.elements[targetStepId] as unknown) as FlowStep;
            replaceAllLinks(changedFlow, targetStepId, targetStepElement.nextElementId);
            delete changedFlow.elements[targetStepId];
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
