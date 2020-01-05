import { FlowElement } from "./FlowElement";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../types/FlowModelerProps";

export const isDivergingGateway = (inputElement: FlowContent | FlowGatewayDiverging): inputElement is FlowGatewayDiverging =>
    !!inputElement && (inputElement as FlowGatewayDiverging).nextElements !== undefined;

const handleNextElement = (
    currentElement: FlowElement,
    nextElementId: string,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Map<string, FlowElement>
): void => {
    let nextElement;
    if (resultingModelElements.has(nextElementId)) {
        // don't revisit already created FlowElement, just look it up and add additional references
        nextElement = resultingModelElements.get(nextElementId);
    } else {
        nextElement = new FlowElement(nextElementId);
        resultingModelElements.set(nextElementId, nextElement);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        populateElement(nextElement, inputElements, resultingModelElements);
    }
    currentElement.addFollowingElement(nextElement);
    nextElement.addPrecedingElement(currentElement);
};

const populateElement = (
    target: FlowElement,
    inputElements: FlowModelerProps["flow"]["elements"],
    resultingModelElements: Map<string, FlowElement>
): void => {
    const inputElement = inputElements[target.getId()];
    if (isDivergingGateway(inputElement)) {
        // ensure that there are always at least two sub elements under a gateway to allow for respective End elements to be displayed
        let subElements;
        if (inputElement.nextElements.length > 1) {
            subElements = inputElement.nextElements;
        } else if (inputElement.nextElements.length === 1) {
            subElements = [...inputElement.nextElements, {}];
        } else {
            subElements = [{}, {}];
        }
        subElements.forEach(({ id }) => handleNextElement(target, id, inputElements, resultingModelElements));
    } else if (inputElement) {
        handleNextElement(target, inputElement.nextElementId, inputElements, resultingModelElements);
    }
};

const determineColumnIndex = (target: FlowElement): number => {
    if (!target.getColumnIndex()) {
        if (target.getPrecedingElements().length > 0) {
            const maxPrecedingColumnIndex = Math.max(1, ...target.getPrecedingElements().map(determineColumnIndex));
            // cater for additional column containing the converging gateway if necessary
            target.setColumnIndex(maxPrecedingColumnIndex + (target.getPrecedingElements().length === 1 ? 1 : 2));
        } else {
            target.setColumnIndex(2);
        }
    }
    return target.getColumnIndex();
};

const addGatewayConnectorOffsets = (
    elementsInTree: Map<string, FlowElement>,
    indexOffsetStart: number,
    gatewayCheck: (element: FlowElement) => boolean
): void => {
    const gatewayColumns = new Set<number>();
    elementsInTree.forEach((element) => {
        if (gatewayCheck(element)) {
            gatewayColumns.add(indexOffsetStart + element.getColumnIndex());
        }
    });
    // iterate over indexes of gateway columns from right to left
    [...gatewayColumns]
        .sort((x, y) => y - x)
        .forEach((gatewayColumnIndex) =>
            // ensure there is an extra column for the gateway connectors
            elementsInTree.forEach((element) => {
                // move all elements behind the identified gateway column to the right by one column
                if (element.getColumnIndex() > gatewayColumnIndex) {
                    element.setColumnIndex(element.getColumnIndex() + 1);
                }
            })
        );
};

const assignMinimumIndependentRowCount = (target: FlowElement): void =>
    target.setRowCount(Math.max(target.getPrecedingElements().length, target.getFollowingElements().length));

const sumUpPrecedingElementRowCount = (sum: number, precedingElement: FlowElement): number =>
    sum + (precedingElement.getFollowingElements().length === 1 ? precedingElement.getRowCount() : 1);

const sumUpFollowingElementRowCount = (sum: number, followingElement: FlowElement): number =>
    sum + (followingElement.getPrecedingElements().length === 1 ? followingElement.getRowCount() : 1);

export const createElementTree = ({ firstElementId, elements }: FlowModelerProps["flow"]): FlowElement => {
    const firstElement = new FlowElement(firstElementId);
    // first iteration: creating elements with links in both directions
    const createdElementsInTree = new Map<string, FlowElement>().set(firstElementId, firstElement);
    populateElement(firstElement, elements, createdElementsInTree);
    // second iteration: determine column indexes
    createdElementsInTree.forEach(determineColumnIndex);
    // third iteration: add column offsets for gateway connectors
    // diverging gateways have gateway-to-element connectors to the right of the gateway
    addGatewayConnectorOffsets(createdElementsInTree, 0, (element) => element.getFollowingElements().length > 1);
    // converging gateways have element-to-gateway connectors to the left of the gateway (and the gateway itself is one column left of the element)
    addGatewayConnectorOffsets(createdElementsInTree, -2, (element) => element.getPrecedingElements().length > 1);
    // fourth iteration: assign minimum row counts to each element on its own
    createdElementsInTree.forEach(assignMinimumIndependentRowCount);
    // fifth iteration: propagate minimum row counts
    if (firstElement.getFollowingElements().length === 0) {
        // edge case: empty model containing only a single end node (with rowIndex = 0)
        firstElement.setRowCount(1);
    } else {
        let someRowCountChanged;
        const assignMinimumRowCountFromNeighbours = (target: FlowElement): void => {
            const minimumRowCount = Math.max(
                target.getPrecedingElements().reduce(sumUpPrecedingElementRowCount, 0),
                target.getFollowingElements().reduce(sumUpFollowingElementRowCount, 0)
            );
            if (minimumRowCount !== target.getRowCount()) {
                target.setRowCount(minimumRowCount);
                someRowCountChanged = true;
            }
        };
        do {
            someRowCountChanged = false;
            createdElementsInTree.forEach(assignMinimumRowCountFromNeighbours);
        } while (someRowCountChanged);
    }
    return firstElement;
};
