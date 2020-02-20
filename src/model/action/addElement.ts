import { v4 } from "uuid";

import { replaceLinksInList, cloneFlow } from "./editUtils";

import { StepNode, ConvergingGatewayNode, DivergingGatewayBranch, ElementType, StartNode } from "../../types/ModelElement";
import { EditActionResult } from "../../types/EditAction";
import { FlowModelerProps, FlowStep, FlowGatewayDiverging } from "../../types/FlowModelerProps";

const addElement = (
    originalFlow: FlowModelerProps["flow"],
    createElement: (nextElementId: string) => FlowStep | FlowGatewayDiverging,
    precedingElement: StartNode | StepNode | ConvergingGatewayNode | DivergingGatewayBranch
): EditActionResult => {
    const changedFlow = cloneFlow(originalFlow);
    const newElementId = v4();
    let nextElementId: string;
    switch (precedingElement.type) {
        case ElementType.StartNode:
            nextElementId = changedFlow.firstElementId;
            changedFlow.firstElementId = newElementId;
            break;
        case ElementType.StepNode:
            const precedingStepElement = (changedFlow.elements[precedingElement.id] as unknown) as FlowStep;
            nextElementId = precedingStepElement.nextElementId;
            precedingStepElement.nextElementId = newElementId;
            break;
        case ElementType.ConvergingGatewayNode:
            nextElementId = precedingElement.followingElement.type === ElementType.EndNode ? null : precedingElement.followingElement.id;
            replaceLinksInList(
                precedingElement.precedingBranches.map((branch) => branch.precedingElement),
                changedFlow,
                nextElementId,
                newElementId
            );
            break;
        case ElementType.DivergingGatewayBranch:
            const precedingGatewayElement = (changedFlow.elements[precedingElement.precedingElement.id] as unknown) as FlowGatewayDiverging;
            nextElementId = precedingGatewayElement.nextElements[precedingElement.branchIndex].id;
            precedingGatewayElement.nextElements[precedingElement.branchIndex].id = newElementId;
            break;
    }
    changedFlow.elements[newElementId] = createElement(nextElementId);
    return { changedFlow };
};

const createStepElement = (stepData: { [key: string]: unknown } | undefined) => (nextElementId: string | undefined): FlowStep => ({
    nextElementId,
    data: stepData
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

export const addStepElement = (
    originalFlow: FlowModelerProps["flow"],
    precedingElement: StartNode | StepNode | ConvergingGatewayNode | DivergingGatewayBranch,
    data: { [key: string]: unknown } | undefined
): EditActionResult => addElement(originalFlow, createStepElement(data), precedingElement);

export const addDivergingGateway = (
    originalFlow: FlowModelerProps["flow"],
    precedingElement: StartNode | StepNode | ConvergingGatewayNode | DivergingGatewayBranch,
    gatewayData: { [key: string]: unknown } | undefined,
    branchConditionData: Array<{ [key: string]: unknown }> | undefined
): EditActionResult => addElement(originalFlow, createDivergingGateway(gatewayData, branchConditionData), precedingElement);
