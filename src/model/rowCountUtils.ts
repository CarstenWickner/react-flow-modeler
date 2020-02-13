import { ElementType, ModelElement, StartNode } from "./ModelElement";

const getPreceding = (element: ModelElement): Array<ModelElement> =>
    element.type === ElementType.Start ? [] : element.type === ElementType.GatewayConverging ? element.precedingBranches : [element.precedingElement];
const getFollowing = (element: ModelElement): Array<ModelElement> =>
    element.type === ElementType.End ? [] : element.type == ElementType.GatewayDiverging ? element.followingBranches : [element.followingElement];

const assignMinimumIndependentRowCount = (target: ModelElement): void => {
    target.rowCount = Math.max(getPreceding(target).length, getFollowing(target).length);
};

const sumUpSingleElementRowCount = (backLink: (element: ModelElement) => Array<ModelElement>) => (sum: number, singleElement: ModelElement): number =>
    sum + (backLink(singleElement).length === 1 ? singleElement.rowCount : 1);

const sumUpSinglePrecedingElementRowCount = sumUpSingleElementRowCount(getFollowing);
const sumUpSingleFollowingElementRowCount = sumUpSingleElementRowCount(getPreceding);

const sumUpAllElementRowCount = (sum: number, element: ModelElement): number => sum + element.rowCount;

const addExcessRowCountToNeighbour = (
    referenceLookUp: (element: ModelElement) => Array<ModelElement>,
    backLink: (element: ModelElement) => Array<ModelElement>,
    verticalAlign: "top" | "bottom",
    element: ModelElement
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
            if (siblingSumRowCount < reference.rowCount) {
                // increase the row count for leading or trailing element so that the sum of children adds up to the parent
                element.rowCount = element.rowCount + (reference.rowCount - siblingSumRowCount);
                return true;
            }
        }
    }
    return false;
};

export const determineRowCounts = (
    startElement: StartNode,
    verticalAlign: "top" | "bottom",
    forEachElementInTree: (callback: (element: ModelElement) => void) => void
): void => {
    // third iteration: assign minimum row counts to each element on its own
    forEachElementInTree(assignMinimumIndependentRowCount);
    let someRowCountChanged: boolean;
    const assignMinimumRowCountFromNeighbours = (target: ModelElement): void => {
        const minimumRowCount = Math.max(
            getPreceding(target).reduce(sumUpSinglePrecedingElementRowCount, 0),
            getFollowing(target).reduce(sumUpSingleFollowingElementRowCount, 0)
        );
        if (minimumRowCount > target.rowCount) {
            target.rowCount = minimumRowCount;
            someRowCountChanged = true;
        }
    };
    const fixGatewayRowCountGaps = (element: ModelElement): void => {
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
