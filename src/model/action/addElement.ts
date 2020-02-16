import { v4 } from "uuid";
import cloneDeep from "lodash.clonedeep";

import { replaceLinksInList } from "./editUtils";
import { ContentNode, ConvergingGatewayNode, DivergingGatewayBranch, ElementType, StartNode } from "../ModelElement";

import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

const addElement = (
    originalFlow: FlowModelerProps["flow"],
    createElement: (nextElementId: string) => FlowContent | FlowGatewayDiverging,
    precedingElement: StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch
): EditActionResult => {
    const changedFlow = cloneDeep(originalFlow);
    const newElementId = v4();
    let nextElementId: string;
    switch (precedingElement.type) {
        case ElementType.Start:
            nextElementId = changedFlow.firstElementId;
            changedFlow.firstElementId = newElementId;
            break;
        case ElementType.Content:
            const precedingContentElement = (changedFlow.elements[precedingElement.id] as unknown) as FlowContent;
            nextElementId = precedingContentElement.nextElementId;
            precedingContentElement.nextElementId = newElementId;
            break;
        case ElementType.GatewayConverging:
            nextElementId = precedingElement.followingElement.type === ElementType.End ? null : precedingElement.followingElement.id;
            replaceLinksInList(
                precedingElement.precedingBranches.map((branch) => branch.precedingElement),
                changedFlow,
                nextElementId,
                newElementId
            );
            break;
        case ElementType.ConnectGatewayToElement:
            const precedingGatewayElement = (changedFlow.elements[precedingElement.precedingElement.id] as unknown) as FlowGatewayDiverging;
            nextElementId = precedingGatewayElement.nextElements[precedingElement.branchIndex].id;
            precedingGatewayElement.nextElements[precedingElement.branchIndex].id = newElementId;
            break;
    }
    changedFlow.elements[newElementId] = createElement(nextElementId);
    return { changedFlow };
};

const createContentElement = (contentData: { [key: string]: unknown } | undefined) => (nextElementId: string | undefined): FlowContent => ({
    nextElementId,
    data: contentData
});

const createDivergingGateway = (
    gatewayData: { [key: string]: unknown } | undefined,
    branchConditionData: Array<{ [key: string]: unknown }> | undefined
) => (nextElementId: string | undefined): FlowGatewayDiverging => {
    const nextElements: FlowGatewayDiverging["nextElements"] = Array.from(
        { length: branchConditionData && branchConditionData.length > 1 ? branchConditionData.length : 2 },
        () => ({ id: nextElementId })
    );
    if (branchConditionData) {
        branchConditionData.forEach((conditionData, index) => (nextElements[index].conditionData = conditionData));
    }
    return { nextElements, data: gatewayData };
};

export const addContentElement = (
    originalFlow: FlowModelerProps["flow"],
    precedingElement: StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch,
    data: { [key: string]: unknown } | undefined
): EditActionResult => addElement(originalFlow, createContentElement(data), precedingElement);

export const addDivergingGateway = (
    originalFlow: FlowModelerProps["flow"],
    precedingElement: StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch,
    gatewayData: { [key: string]: unknown } | undefined,
    branchConditionData: Array<{ [key: string]: unknown }> | undefined
): EditActionResult => addElement(originalFlow, createDivergingGateway(gatewayData, branchConditionData), precedingElement);
