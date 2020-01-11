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

const addExcessRowCountToNeighbour = (
    referenceLookUp: (element: FlowElement) => Array<FlowElement>,
    backLink: (element: FlowElement) => Array<FlowElement>,
    verticalAlign: "top" | "bottom",
    element: FlowElement
): boolean => {
    // look-up the parents/children
    const referenceList = referenceLookUp(element);
    if (referenceList.length === 1) {
        const reference = referenceList[0];
        // look-up the siblings of the given element
        const siblings = backLink(reference);
        // only do this calculation for one sibling to minimize unnecessary round-trips
        // consider the first element to align to the bottom, otherwise consider the last element to align to the top
        if (siblings.length > 1 && siblings[verticalAlign === "bottom" ? 0 : siblings.length - 1] === element) {
            const siblingSumRowCount = siblings.reduce(sumUpAllElementRowCount, 0);
            if (siblingSumRowCount < reference.getRowCount()) {
                // increase the row count for leading or trailing element so that the sum of children adds up to the parent
                element.setRowCount(element.getRowCount() + (reference.getRowCount() - siblingSumRowCount));
                return true;
            }
        }
    }
    return false;
};

export const determineRowCounts = (
    firstElement: FlowElement,
    verticalAlign: "top" | "bottom",
    forEachElementInTree: (callback: (element: FlowElement) => void) => void
): void => {
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
        someRowCountChanged = addExcessRowCountToNeighbour(getPreceding, getFollowing, verticalAlign, element) || someRowCountChanged;
        someRowCountChanged = addExcessRowCountToNeighbour(getFollowing, getPreceding, verticalAlign, element) || someRowCountChanged;
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
