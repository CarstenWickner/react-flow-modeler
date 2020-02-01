import { FlowElement } from "./FlowElement";
import { determineRowCounts } from "./rowCountUtils";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../types/FlowModelerProps";

export const isDivergingGateway = (inputElement: FlowContent | FlowGatewayDiverging): inputElement is FlowGatewayDiverging =>
    !!inputElement && (inputElement as FlowGatewayDiverging).nextElements !== undefined;

const handleNextElement = (
    currentElement: FlowElement,
    nextElementId: string,
    branchIndex: number | undefined,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Map<string, FlowElement>
): void => {
    const verifiedNextElementId = inputElements[nextElementId] ? nextElementId : null;
    // don't revisit already created FlowElement, just look it up and add additional references
    let nextElement = resultingModelElements.get(verifiedNextElementId);
    if (!nextElement) {
        nextElement = new FlowElement(verifiedNextElementId);
        resultingModelElements.set(verifiedNextElementId, nextElement);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        populateElement(nextElement, inputElements, resultingModelElements);
    }
    currentElement.addFollowingElement(nextElement);
    nextElement.addPrecedingElement(currentElement, branchIndex);
};

const populateElement = (
    target: FlowElement,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Map<string, FlowElement>
): void => {
    const inputElement = inputElements[target.getId()];
    if (isDivergingGateway(inputElement)) {
        // ensure that there are always at least two sub elements under a gateway to allow for respective connectors to be displayed
        let subElements;
        if (inputElement.nextElements.length > 1) {
            subElements = inputElement.nextElements;
        } else if (inputElement.nextElements.length === 1) {
            subElements = [...inputElement.nextElements, {}];
        } else {
            subElements = [{}, {}];
        }
        subElements.forEach(({ id }, branchIndex) => handleNextElement(target, id, branchIndex, inputElements, resultingModelElements));
    } else if (inputElement) {
        handleNextElement(target, inputElement.nextElementId, undefined, inputElements, resultingModelElements);
    }
};

const determineColumnIndex = (target: FlowElement): number => {
    if (!target.getColumnIndex()) {
        const maxPrecedingColumnIndex = Math.max(
            1,
            ...target
                .getPrecedingElements()
                .map((preceding) => determineColumnIndex(preceding) + (preceding.getFollowingElements().length > 1 ? 1 : 0))
        );
        // cater for additional column containing the converging gateway if necessary
        target.setColumnIndex(maxPrecedingColumnIndex + (target.getPrecedingElements().length > 1 ? 3 : 1));
    }
    return target.getColumnIndex();
};

export const createMinimalElementTreeStructure = ({
    firstElementId,
    elements
}: FlowModelerProps["flow"]): { firstElement: FlowElement; elementsInTree: Map<string, FlowElement> } => {
    const firstElement = new FlowElement(firstElementId);
    // creating elements with links in both directions
    const elementsInTree = new Map<string, FlowElement>().set(firstElementId, firstElement);
    populateElement(firstElement, elements, elementsInTree);
    return { firstElement, elementsInTree };
};

export const createElementTree = (flow: FlowModelerProps["flow"], verticalAlign: "top" | "bottom"): FlowElement => {
    const { firstElement, elementsInTree } = createMinimalElementTreeStructure(flow);
    // calculate column indexes within the grid to be rendered
    elementsInTree.forEach(determineColumnIndex);
    // calculate number of rows within the grid to be rendered
    determineRowCounts(firstElement, verticalAlign, elementsInTree.forEach.bind(elementsInTree));
    return firstElement;
};
