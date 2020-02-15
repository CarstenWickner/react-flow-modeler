import {
    ContentNode,
    ConvergingGatewayBranch,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    DivergingGatewayNode,
    ElementType,
    EndNode,
    ModelElement,
    StartNode
} from "./ModelElement";
import { determineRowCounts } from "./rowCountUtils";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../types/FlowModelerProps";

export const isDivergingGateway = (inputElement: FlowContent | FlowGatewayDiverging): inputElement is FlowGatewayDiverging =>
    !!inputElement && (inputElement as FlowGatewayDiverging).nextElements !== undefined;

export const isMatchingModelElement = (elementId: string): ((element: ModelElement) => element is ContentNode | DivergingGatewayNode | EndNode) => (
    element: ModelElement
): element is ContentNode | DivergingGatewayNode | EndNode =>
    ((element.type === ElementType.Content || element.type === ElementType.GatewayDiverging) && element.id === elementId) ||
    (elementId === null && element.type === ElementType.End);

const createEndNode = (precedingElement: StartNode | ContentNode | ConvergingGatewayNode, resultingModelElements: Array<ModelElement>): EndNode => {
    const end: EndNode = { type: ElementType.End, precedingElement, columnIndex: undefined, rowCount: undefined };
    resultingModelElements.push(end);
    return end;
};

const addAdditionalBranchToConvergingGateway = (
    elementBehindConvergingGateway: ContentNode | DivergingGatewayNode | EndNode,
    resultingModelElements: Array<ModelElement>,
    precedingElement: ContentNode | DivergingGatewayBranch
): ConvergingGatewayBranch => {
    let convergingGateway: ConvergingGatewayNode;
    if (elementBehindConvergingGateway.precedingElement.type === ElementType.GatewayConverging) {
        convergingGateway = elementBehindConvergingGateway.precedingElement;
    } else {
        convergingGateway = {
            type: ElementType.GatewayConverging,
            precedingBranches: [],
            followingElement: elementBehindConvergingGateway,
            columnIndex: undefined,
            rowCount: undefined
        };
        const existingBranch: ConvergingGatewayBranch = {
            type: ElementType.ConnectElementToGateway,
            precedingElement: (elementBehindConvergingGateway.precedingElement as unknown) as ContentNode | DivergingGatewayBranch,
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
        type: ElementType.ConnectElementToGateway,
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
    precedingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode
): ContentNode | DivergingGatewayNode | ConvergingGatewayBranch | EndNode => {
    if (precedingElement.type !== ElementType.Start) {
        const existingElement = resultingModelElements.find(isMatchingModelElement(id in inputElements ? id : null));
        if (existingElement) {
            return addAdditionalBranchToConvergingGateway(
                existingElement,
                resultingModelElements,
                (precedingElement as unknown) as ContentNode | DivergingGatewayBranch
            );
        }
    }
    const inputElement = inputElements[id];
    if (!inputElement) {
        return createEndNode((precedingElement as unknown) as StartNode | ContentNode | ConvergingGatewayNode, resultingModelElements);
    }
    if (isDivergingGateway(inputElement)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return createDivergingGatewayNode(id, inputElement, inputElements, resultingModelElements, precedingElement);
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return createContentNode(id, inputElement, inputElements, resultingModelElements, precedingElement);
};

const createContentNode = (
    id: string,
    inputElement: FlowContent,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Array<ModelElement>,
    precedingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode
): ContentNode => {
    const content: ContentNode = {
        type: ElementType.Content,
        id,
        precedingElement,
        followingElement: undefined,
        data: inputElement.data,
        columnIndex: undefined,
        rowCount: undefined
    };
    resultingModelElements.push(content);
    content.followingElement = handleNextElement(inputElement.nextElementId, inputElements, resultingModelElements, content);
    return content;
};

const createDivergingGatewayNode = (
    id: string,
    inputElement: FlowGatewayDiverging,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Array<ModelElement>,
    precedingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode
): DivergingGatewayNode => {
    const divergingGateway: DivergingGatewayNode = {
        type: ElementType.GatewayDiverging,
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
            type: ElementType.ConnectGatewayToElement,
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
            | ContentNode
            | DivergingGatewayNode
            | ConvergingGatewayBranch;
    });
    return divergingGateway;
};

const determineColumnIndex = (target: ModelElement): number => {
    if (!target.columnIndex) {
        if (target.type === ElementType.GatewayConverging) {
            target.columnIndex = 1 + Math.max(...target.precedingBranches.map(determineColumnIndex));
        } else if (target.type === ElementType.Start) {
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
        type: ElementType.Start,
        followingElement: undefined,
        columnIndex: 1,
        rowCount: undefined
    };
    const elementsInTree: Array<ModelElement> = [start];
    const inputElement = elements[firstElementId];
    let firstElement: ContentNode | DivergingGatewayNode | EndNode;
    if (!inputElement) {
        firstElement = createEndNode(start, elementsInTree);
    } else if (isDivergingGateway(inputElement)) {
        firstElement = createDivergingGatewayNode(firstElementId, inputElement, elements, elementsInTree, start);
    } else {
        firstElement = createContentNode(firstElementId, inputElement, elements, elementsInTree, start);
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
