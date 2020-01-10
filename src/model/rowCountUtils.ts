import { FlowElement } from "./FlowElement";

const getPreceding = (element: FlowElement): Array<FlowElement> => element.getPrecedingElements();
const getFollowing = (element: FlowElement): Array<FlowElement> => element.getFollowingElements();

const assignMinimumIndependentRowCount = (target: FlowElement): void =>
    target.setRowCount(Math.max(target.getPrecedingElements().length, target.getFollowingElements().length));

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

export const determineRowCounts = (firstElement: FlowElement, forEachElementInTree: (callback: (element: FlowElement) => void) => void): void => {
    // third iteration: assign minimum row counts to each element on its own
    forEachElementInTree(assignMinimumIndependentRowCount);
    if (firstElement.getFollowingElements().length === 0) {
        // edge case: empty model containing only a single end node (with rowIndex = 0)
        firstElement.setRowCount(1);
        return;
    }
    let someRowCountChanged: boolean;
    const assignMinimumRowCountFromNeighbours = (target: FlowElement): void => {
        const minimumRowCount = Math.max(
            target.getPrecedingElements().reduce(sumUpSinglePrecedingElementRowCount, 0),
            target.getFollowingElements().reduce(sumUpSingleFollowingElementRowCount, 0)
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
        forEachElementInTree(assignMinimumRowCountFromNeighbours);
        if (!someRowCountChanged) {
            // mixed diverging/converging gateways might lead to gaps when the parts before/after these have different total heights
            forEachElementInTree(fixGatewayRowCountGaps);
        }
    } while (someRowCountChanged);
};