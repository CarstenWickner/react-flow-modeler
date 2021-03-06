import { determineRowCounts } from "./rowCountUtils";
import {
    StepNode,
    ConvergingGatewayBranch,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    DivergingGatewayNode,
    ElementType,
    EndNode,
    ModelElement,
    StartNode
} from "../types/ModelElement";
import { FlowModelerProps, FlowStep, FlowGatewayDiverging } from "../types/FlowModelerProps";
import { EditActionResult } from "../types/EditAction";

export const isDivergingGateway = (inputElement: FlowStep | FlowGatewayDiverging): inputElement is FlowGatewayDiverging =>
    !!inputElement && (inputElement as FlowGatewayDiverging).nextElements !== undefined;

export const isMatchingModelElement = (elementId: string): ((element: ModelElement) => element is StepNode | DivergingGatewayNode | EndNode) => (
    element: ModelElement
): element is StepNode | DivergingGatewayNode | EndNode =>
    ((element.type === ElementType.StepNode || element.type === ElementType.DivergingGatewayNode) && element.id === elementId) ||
    (elementId === null && element.type === ElementType.EndNode);

const createEndNode = (precedingElement: StartNode | StepNode | ConvergingGatewayNode, resultingModelElements: Array<ModelElement>): EndNode => {
    const end: EndNode = { type: ElementType.EndNode, precedingElement, columnIndex: undefined, rowCount: undefined };
    resultingModelElements.push(end);
    return end;
};

const addAdditionalBranchToConvergingGateway = (
    elementBehindConvergingGateway: StepNode | DivergingGatewayNode | EndNode,
    resultingModelElements: Array<ModelElement>,
    precedingElement: StepNode | DivergingGatewayBranch
): ConvergingGatewayBranch => {
    let convergingGateway: ConvergingGatewayNode;
    if (elementBehindConvergingGateway.precedingElement.type === ElementType.ConvergingGatewayNode) {
        convergingGateway = elementBehindConvergingGateway.precedingElement;
    } else {
        convergingGateway = {
            type: ElementType.ConvergingGatewayNode,
            precedingBranches: [],
            followingElement: elementBehindConvergingGateway,
            columnIndex: undefined,
            rowCount: undefined
        };
        const existingBranch: ConvergingGatewayBranch = {
            type: ElementType.ConvergingGatewayBranch,
            precedingElement: (elementBehindConvergingGateway.precedingElement as unknown) as StepNode | DivergingGatewayBranch,
            followingElement: convergingGateway,
            branchIndex: 0,
            columnIndex: undefined,
            rowCount: undefined
        };
        convergingGateway.precedingBranches.push(existingBranch);
        resultingModelElements.push(existingBranch, convergingGateway);
        elementBehindConvergingGateway.precedingElement.followingElement = existingBranch;
        elementBehindConvergingGateway.precedingElement = convergingGateway;
    }
    const newBranch: ConvergingGatewayBranch = {
        type: ElementType.ConvergingGatewayBranch,
        precedingElement,
        followingElement: elementBehindConvergingGateway.precedingElement,
        branchIndex: convergingGateway.precedingBranches.length,
        columnIndex: undefined,
        rowCount: undefined
    };
    convergingGateway.precedingBranches.push(newBranch);
    resultingModelElements.push(newBranch);
    return newBranch;
};

const handleNextElement = (
    id: string,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Array<ModelElement>,
    precedingElement: StepNode | DivergingGatewayBranch | ConvergingGatewayNode
): StepNode | DivergingGatewayNode | ConvergingGatewayBranch | EndNode => {
    const existingElement = resultingModelElements.find(isMatchingModelElement(id in inputElements ? id : null));
    if (existingElement) {
        return addAdditionalBranchToConvergingGateway(
            existingElement,
            resultingModelElements,
            (precedingElement as unknown) as StepNode | DivergingGatewayBranch
        );
    }
    const inputElement = inputElements[id];
    if (!inputElement) {
        return createEndNode((precedingElement as unknown) as StartNode | StepNode | ConvergingGatewayNode, resultingModelElements);
    }
    if (isDivergingGateway(inputElement)) {
        return createDivergingGatewayNode(id, inputElement, inputElements, resultingModelElements, precedingElement);
    }
    return createStepNode(id, inputElement, inputElements, resultingModelElements, precedingElement);
};

const createStepNode = (
    id: string,
    inputElement: FlowStep,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Array<ModelElement>,
    precedingElement: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode
): StepNode => {
    const step: StepNode = {
        type: ElementType.StepNode,
        id,
        precedingElement,
        followingElement: undefined,
        data: inputElement.data,
        columnIndex: undefined,
        rowCount: undefined
    };
    resultingModelElements.push(step);
    step.followingElement = handleNextElement(inputElement.nextElementId, inputElements, resultingModelElements, step);
    return step;
};

const createDivergingGatewayNode = (
    id: string,
    inputElement: FlowGatewayDiverging,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Array<ModelElement>,
    precedingElement: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode
): DivergingGatewayNode => {
    const divergingGateway: DivergingGatewayNode = {
        type: ElementType.DivergingGatewayNode,
        id,
        precedingElement,
        followingBranches: [],
        data: inputElement.data,
        columnIndex: undefined,
        rowCount: undefined
    };
    resultingModelElements.push(divergingGateway);
    // ensure that there are always at least two sub elements under a gateway to allow for respective connectors to be displayed
    let subElements: FlowGatewayDiverging["nextElements"];
    if (inputElement.nextElements.length > 1) {
        subElements = inputElement.nextElements;
    } else if (inputElement.nextElements.length === 1) {
        subElements = [...inputElement.nextElements, {}];
    } else {
        subElements = [{}, {}];
    }
    subElements.forEach((branchTarget, branchIndex) => {
        const branch: DivergingGatewayBranch = {
            type: ElementType.DivergingGatewayBranch,
            precedingElement: divergingGateway,
            followingElement: undefined,
            branchIndex,
            data: branchTarget.conditionData,
            columnIndex: undefined,
            rowCount: undefined
        };
        divergingGateway.followingBranches.push(branch);
        resultingModelElements.push(branch);
        // there can be no end node before the next converging gateway
        branch.followingElement = (handleNextElement(branchTarget.id, inputElements, resultingModelElements, branch) as unknown) as
            | StepNode
            | DivergingGatewayNode
            | ConvergingGatewayBranch;
    });
    return divergingGateway;
};

const determineColumnIndex = (target: ModelElement): number => {
    if (!target.columnIndex) {
        if (target.type === ElementType.ConvergingGatewayNode) {
            target.columnIndex = 1 + Math.max(...target.precedingBranches.map(determineColumnIndex));
        } else if (target.type === ElementType.StartNode) {
            target.columnIndex = 1;
        } else {
            target.columnIndex = 1 + determineColumnIndex(target.precedingElement);
        }
    }
    return target.columnIndex;
};

export const createMinimalElementTreeStructure = ({
    firstElementId,
    elements
}: FlowModelerProps["flow"]): { start: StartNode; elementsInTree: Array<ModelElement> } => {
    const start: StartNode = {
        type: ElementType.StartNode,
        followingElement: undefined,
        columnIndex: undefined,
        rowCount: undefined
    };
    const elementsInTree: Array<ModelElement> = [start];
    const inputElement = elements[firstElementId];
    let firstElement: StepNode | DivergingGatewayNode | EndNode;
    if (!inputElement) {
        firstElement = createEndNode(start, elementsInTree);
    } else if (isDivergingGateway(inputElement)) {
        firstElement = createDivergingGatewayNode(firstElementId, inputElement, elements, elementsInTree, start);
    } else {
        firstElement = createStepNode(firstElementId, inputElement, elements, elementsInTree, start);
    }
    start.followingElement = firstElement;
    return { start, elementsInTree };
};

export const createElementTree = (flow: FlowModelerProps["flow"], verticalAlign: "top" | "bottom"): StartNode => {
    const { start, elementsInTree } = createMinimalElementTreeStructure(flow);
    // calculate column indexes within the grid to be rendered
    elementsInTree.forEach(determineColumnIndex);
    // calculate number of rows within the grid to be rendered
    determineRowCounts(start, verticalAlign, elementsInTree.forEach.bind(elementsInTree));
    return start;
};

export const updateStepData = (
    flow: FlowModelerProps["flow"],
    stepId: string,
    updateData: (oldData: { [key: string]: unknown }) => { [key: string]: unknown }
): EditActionResult => {
    if (!(stepId in flow.elements)) {
        throw new Error(`There is no step with id '${stepId}'.`);
    }
    if (isDivergingGateway(flow.elements[stepId])) {
        throw new Error(`Element with id '${stepId}' is a diverging gateway. Call 'updateGatewayData()' instead.`);
    }
    return {
        changedFlow: {
            firstElementId: flow.firstElementId,
            elements: {
                ...flow.elements,
                [stepId]: {
                    nextElementId: (flow.elements[stepId] as FlowStep).nextElementId || null,
                    data: updateData(flow.elements[stepId].data)
                }
            }
        }
    };
};

export const updateGatewayData = (
    flow: FlowModelerProps["flow"],
    gatewayId: string,
    updateData: (oldData: { [key: string]: unknown }) => { [key: string]: unknown },
    updateBranchData?: (
        oldData: { [key: string]: unknown },
        branchIndex: number,
        allOldBranchData: Array<{ [key: string]: unknown }>
    ) => { [key: string]: unknown }
): EditActionResult => {
    if (!(gatewayId in flow.elements)) {
        throw new Error(`There is no diverging gateway with id '${gatewayId}'.`);
    }
    if (!isDivergingGateway(flow.elements[gatewayId])) {
        throw new Error(`Element with id '${gatewayId}' is a step. Call 'updateStepData()' instead.`);
    }
    const gateway = flow.elements[gatewayId] as FlowGatewayDiverging;
    let nextElements: FlowGatewayDiverging["nextElements"];
    if (updateBranchData) {
        const allOldBranchData = gateway.nextElements.map((oldBranch) => oldBranch.conditionData);
        nextElements = gateway.nextElements.map(({ id, conditionData }, branchIndex) => ({
            id,
            conditionData: updateBranchData(conditionData, branchIndex, allOldBranchData)
        }));
    } else {
        nextElements = gateway.nextElements;
    }
    const changedFlow = {
        firstElementId: flow.firstElementId,
        elements: {
            ...flow.elements,
            [gatewayId]: { nextElements, data: updateData(gateway.data) }
        }
    };
    return { changedFlow };
};

export const updateGatewayBranchData = (
    flow: FlowModelerProps["flow"],
    gatewayId: string,
    branchIndex: number,
    updateConditionData: (oldConditionData: { [key: string]: unknown }) => { [key: string]: unknown }
): EditActionResult => {
    if (!(gatewayId in flow.elements)) {
        throw new Error(`There is no diverging gateway with id '${gatewayId}'.`);
    }
    if (!isDivergingGateway(flow.elements[gatewayId])) {
        throw new Error(`Element with id '${gatewayId}' is a step.`);
    }
    const gateway = flow.elements[gatewayId] as FlowGatewayDiverging;
    if (gateway.nextElements.length <= branchIndex) {
        throw new Error(`Diverging gateway with id '${gatewayId}' has ${gateway.nextElements.length} branches. Index ${branchIndex} is invalid.`);
    }
    return {
        changedFlow: {
            firstElementId: flow.firstElementId,
            elements: {
                ...flow.elements,
                [gatewayId]: {
                    nextElements: gateway.nextElements.map(({ id, conditionData }, index) => ({
                        id,
                        conditionData: index === branchIndex ? updateConditionData(conditionData) : conditionData
                    })),
                    data: flow.elements[gatewayId].data
                }
            }
        }
    };
};
