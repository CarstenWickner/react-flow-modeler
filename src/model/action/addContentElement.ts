import { v4 } from "uuid";
import cloneDeep from "lodash.clonedeep";

import { FlowElementReference } from "../FlowElement";
import { isDivergingGateway } from "../modelUtils";
import { FlowModelerProps } from "../../types/FlowModelerProps";
import { ElementType } from "../../types/GridCellData";

export const addContentElement = (
    originalFlow: FlowModelerProps["flow"],
    precedingType: ElementType.Start | ElementType.Content | ElementType.GatewayConverging | ElementType.ConnectGatewayToElement,
    data: { [key: string]: unknown } | undefined,
    referenceElement?: FlowElementReference,
    branchIndex?: number
): FlowModelerProps["flow"] => {
    const flowCopy = cloneDeep(originalFlow);
    const newElementId = v4();
    switch (precedingType) {
        case ElementType.Start:
            flowCopy.elements[newElementId] = { data, nextElementId: flowCopy.firstElementId };
            flowCopy.firstElementId = newElementId;
            break;
        case ElementType.Content:
            const precedingContentElement = (flowCopy.elements[referenceElement.getId()] as unknown) as { nextElementId?: string };
            flowCopy.elements[newElementId] = { data, nextElementId: precedingContentElement.nextElementId };
            precedingContentElement.nextElementId = newElementId;
            break;
        case ElementType.GatewayConverging:
            const followingElementId = referenceElement.getId();
            flowCopy.elements[newElementId] = { data, nextElementId: followingElementId };
            const nextElementExists = followingElementId in flowCopy.elements;
            referenceElement
                .getPrecedingElements()
                .map((precedingElement) => flowCopy.elements[precedingElement.getId()])
                .forEach((precedingElement) => {
                    if (isDivergingGateway(precedingElement)) {
                        precedingElement.nextElements
                            .filter((possibleLink) =>
                                nextElementExists ? possibleLink.id === followingElementId : !(possibleLink.id in flowCopy.elements)
                            )
                            .forEach((link) => (link.id = newElementId));
                    } else {
                        precedingElement.nextElementId = newElementId;
                    }
                });
            break;
        case ElementType.ConnectGatewayToElement:
            const precedingGatewayElement = (flowCopy.elements[referenceElement.getId()] as unknown) as { nextElements: Array<{ id?: string }> };
            flowCopy.elements[newElementId] = { data, nextElementId: precedingGatewayElement.nextElements[branchIndex].id };
            precedingGatewayElement.nextElements[branchIndex].id = newElementId;
            break;
    }
    return flowCopy;
};
