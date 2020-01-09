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
    nextElement.addPrecedingElement(currentElement);
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
        subElements.forEach(({ id }) => handleNextElement(target, id, inputElements, resultingModelElements));
    } else if (inputElement) {
        handleNextElement(target, inputElement.nextElementId, inputElements, resultingModelElements);
    }
};

const getPreceding = (element: FlowElement): Array<FlowElement> => element.getPrecedingElements();
const getFollowing = (element: FlowElement): Array<FlowElement> => element.getFollowingElements();

const determineColumnIndex = (target: FlowElement): number => {
    if (!target.getColumnIndex()) {
        const maxPrecedingColumnIndex = Math.max(
            1,
            ...target.getPrecedingElements().map((preceding) => determineColumnIndex(preceding) + (getFollowing(preceding).length > 1 ? 1 : 0))
        );
        // cater for additional column containing the converging gateway if necessary
        target.setColumnIndex(maxPrecedingColumnIndex + (getPreceding(target).length > 1 ? 3 : 1));
    }
    return target.getColumnIndex();
};

const assignMinimumIndependentRowCount = (target: FlowElement): void =>
    target.setRowCount(Math.max(getPreceding(target).length, getFollowing(target).length));

const sumUpSingleElementRowCount = (backLink: (element: FlowElement) => Array<FlowElement>) => (sum: number, singleElement: FlowElement): number =>
    sum + (backLink(singleElement).length === 1 ? singleElement.getRowCount() : 1);
const sumUpSinglePrecedingElementRowCount = sumUpSingleElementRowCount(getFollowing);
const sumUpSingleFollowingElementRowCount = sumUpSingleElementRowCount(getPreceding);

const sumUpAllElementRowCount = (sum: number, element: FlowElement): number => sum + element.getRowCount();

const addExcessRowCountToTrailingNeighbour = (
    referenceLookUp: (element: FlowElement) => Array<FlowElement>,
    backLink: (element: FlowElement) => Array<FlowElement>
) => (element: FlowElement): boolean => {
    const referenceList = referenceLookUp(element);
    if (referenceList.length === 1) {
        const reference = referenceList[0];
        const siblings = backLink(reference);
        if (siblings.length > 1 && siblings[siblings.length - 1] === element) {
            const siblingSumRowCount = siblings.reduce(sumUpAllElementRowCount, 0);
            if (siblingSumRowCount < reference.getRowCount()) {
                // increase the row count for the last element so that the sum of children adds up to the parent
                element.setRowCount(element.getRowCount() + (reference.getRowCount() - siblingSumRowCount));
                return true;
            }
        }
    }
    return false;
};
const addPrecedingExcessRowCountToTrailingNeighbour = addExcessRowCountToTrailingNeighbour(getPreceding, getFollowing);
const addFollowingExcessRowCountToTrailingNeighbour = addExcessRowCountToTrailingNeighbour(getFollowing, getPreceding);

export const createElementTree = ({ firstElementId, elements }: FlowModelerProps["flow"]): FlowElement => {
    const firstElement = new FlowElement(firstElementId);
    // first iteration: creating elements with links in both directions
    const createdElementsInTree = new Map<string, FlowElement>().set(firstElementId, firstElement);
    populateElement(firstElement, elements, createdElementsInTree);
    // second iteration: determine column indexes
    createdElementsInTree.forEach(determineColumnIndex);
    // third iteration: assign minimum row counts to each element on its own
    createdElementsInTree.forEach(assignMinimumIndependentRowCount);
    if (firstElement.getFollowingElements().length === 0) {
        // edge case: empty model containing only a single end node (with rowIndex = 0)
        firstElement.setRowCount(1);
    } else {
        let someRowCountChanged: boolean;
        const assignMinimumRowCountFromNeighbours = (target: FlowElement): void => {
            const minimumRowCount = Math.max(
                getPreceding(target).reduce(sumUpSinglePrecedingElementRowCount, 0),
                getFollowing(target).reduce(sumUpSingleFollowingElementRowCount, 0)
            );
            if (minimumRowCount > target.getRowCount()) {
                target.setRowCount(minimumRowCount);
                someRowCountChanged = true;
            }
        };
        const fixGatewayRowCountGaps = (element: FlowElement): void => {
            someRowCountChanged = addPrecedingExcessRowCountToTrailingNeighbour(element) || someRowCountChanged;
            someRowCountChanged = addFollowingExcessRowCountToTrailingNeighbour(element) || someRowCountChanged;
        };
        // fourth iteration: propagate minimum row counts to ensure the elements in all columns fill up the same number of rows
        do {
            someRowCountChanged = false;
            // first make sure each neighbour has their appropriate minimum height
            createdElementsInTree.forEach(assignMinimumRowCountFromNeighbours);
            if (!someRowCountChanged) {
                // mixed diverging/converging gateways might lead to gaps when the parts before/after these have different total heights
                createdElementsInTree.forEach(fixGatewayRowCountGaps);
            }
        } while (someRowCountChanged);
    }
    return firstElement;
};
