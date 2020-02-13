import { v4 } from "uuid";
import cloneDeep from "lodash.clonedeep";

import { replaceLinksInList } from "./editUtils";
import { ContentNode, ConvergingGatewayNode, DivergingGatewayBranch, ElementType, StartNode } from "../ModelElement";

import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../../types/FlowModelerProps";

const addElement = (
    originalFlow: FlowModelerProps["flow"],
    createElement: (nextElementId: string, data: { [key: string]: unknown } | undefined) => FlowContent | FlowGatewayDiverging,
    precedingElement: StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch,
    data: { [key: string]: unknown } | undefined
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
    changedFlow.elements[newElementId] = createElement(nextElementId, data);
    return { changedFlow };
};

const createContentElement = (nextElementId: string | undefined, data: { [key: string]: unknown } | undefined): FlowContent => ({
    nextElementId,
    data
});

const createDivergingGateway = (nextElementId: string | undefined, data: { [key: string]: unknown } | undefined): FlowGatewayDiverging => ({
    nextElements: [{ id: nextElementId }, { id: nextElementId }],
    data
});

export const addContentElement = (
    originalFlow: FlowModelerProps["flow"],
    precedingElement: StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch,
    data: { [key: string]: unknown } | undefined
): EditActionResult => addElement(originalFlow, createContentElement, precedingElement, data);

export const addDivergingGateway = (
    originalFlow: FlowModelerProps["flow"],
    precedingElement: StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch,
    data: { [key: string]: unknown } | undefined
): EditActionResult => addElement(originalFlow, createDivergingGateway, precedingElement, data);
