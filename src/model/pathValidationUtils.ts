import { FlowElement, PrecedingFlowElement } from "./FlowElement";
import { isDivergingGateway, createElementTree, createMinimalElementTreeStructure } from "./modelUtils";

import { FlowModelerProps } from "../types/FlowModelerProps";

/**
 * Check the given input model for circular references, which are  specifically disallowed.
 *
 * @param {string} targetElementId - id of the element to check
 * @param {object} elements - collection of all defined elements in the input model
 * @param {Array.<string>} currentPath - ids of elements in front of target element
 * @throws Error in case of a circular reference being present
 */
const checkForCircularReference = (
    targetElementId: string,
    elements: FlowModelerProps["flow"]["elements"],
    currentPath: Array<string> = []
): void => {
    const targetElement = elements[targetElementId];
    if (!targetElement) {
        // path ends, i.e. there was no circular reference here
        return;
    }
    if (currentPath.includes(targetElementId)) {
        // no reason to go in circles, stop it right there
        throw new Error(`Circular reference to element: ${targetElementId}`);
    }
    currentPath.push(targetElementId);
    if (isDivergingGateway(targetElement)) {
        // check on each sub-path after the targeted diverging gateway
        targetElement.nextElements.forEach((next) => checkForCircularReference(next.id, elements, currentPath.slice(0)));
    } else {
        // continue check after the targeted content element
        checkForCircularReference(targetElement.nextElementId, elements, currentPath);
    }
};

/**
 * Check whether the given two parents of the specified child element are neighbours.
 *
 * @param {FlowElement} firstParent - leading specific preceding element from which the designated child is being referenced
 * @param {FlowElement} secondParent - trailing specific preceding element from which the designated child is being referenced
 * @returns {boolean} whether the implicit converging gateway is valid.
 */
const areParentsNeighbours = (firstParent: PrecedingFlowElement, secondParent: PrecedingFlowElement): boolean => {
    // collect path to second element
    const topPathToSecond: Array<PrecedingFlowElement> = [secondParent];
    let leadingParentOfSecond = secondParent;
    while (!leadingParentOfSecond.branchIndex && leadingParentOfSecond.element.getPrecedingElements().length) {
        // in case of a converging gateway, always take the top element
        leadingParentOfSecond = leadingParentOfSecond.element.getPrecedingElementsWithBranchIndex()[0];
        topPathToSecond.push(leadingParentOfSecond);
    }
    // iterate backwards over path to first element until finding a common parent (worst case: the root element)
    let firstBranch = firstParent;
    do {
        const secondBranch = topPathToSecond.find((entry) => entry.element === firstBranch.element);
        if (secondBranch) {
            // check whether the two paths are neighbouring when branching off from their right-most common parent
            return firstBranch.branchIndex + 1 === secondBranch.branchIndex;
        }
        if (firstBranch.branchIndex !== undefined && firstBranch.branchIndex + 1 !== firstBranch.element.getFollowingElements().length) {
            // leading element is not the bottom most branch of the targeted gateway, i.e. all further parents would be invalid connections
            return false;
        }
        const parents = firstBranch.element.getPrecedingElementsWithBranchIndex();
        if (parents.length === 0) {
            // reached root without finding common parent, the second branch must have ended early at a diverging gateway
            return false;
        }
        firstBranch = parents[parents.length - 1];
    } while (true);
};

/**
 * Check whether the implicit converging gateway in front of the given element is valid, i.e. whether all connection pairs are direct neighbours.
 *
 * @param {FlowElement} convergingGateway - element being referenced from multiple parents (thereby being preceded by an implicit converging gateway)
 * @returns {boolean} whether the implicit converging gateway is invalid (beware the negation!)
 */
const isInvalidConvergingGateway = (convergingGateway: FlowElement): boolean => {
    const connectedElements = convergingGateway.getPrecedingElementsWithBranchIndex();
    return connectedElements.slice(1).some((nextElement, previousIndex) => !areParentsNeighbours(connectedElements[previousIndex], nextElement));
};

/**
 * Validate that the parsed data model can be properly displayed. Ensuring that only directly neighbouring paths can link to the same element.
 *
 * @param {FlowElement} treeRootElement - root of the parsed data model to validate
 * @throws Error in case of any (implicit) converging gateways connecting non-neighbouring paths
 */
const validatePaths = (treeRootElement: FlowElement): void => {
    // use Set to automatically filter out duplicates and thereby avoid checking the same gateway repeatedly
    const convergingGateways = new Set<FlowElement>();
    const collectConvergingGateways = (element: FlowElement): void => {
        if (element.getId()) {
            if (element.getPrecedingElements().length > 1) {
                convergingGateways.add(element);
            }
            element.getFollowingElements().forEach(collectConvergingGateways);
        }
    };
    collectConvergingGateways(treeRootElement);
    const invalidElements = Array.from(convergingGateways).filter(isInvalidConvergingGateway);
    if (invalidElements.length) {
        throw new Error(
            `Multiple references only valid from neighbouring paths. Invalid references to: '${invalidElements
                .map((gateway) => gateway.getId())
                .join("', '")}'`
        );
    }
};

export const createValidatedElementTree = (flow: FlowModelerProps["flow"], verticalAlign: "top" | "bottom"): FlowElement => {
    checkForCircularReference(flow.firstElementId, flow.elements);
    const treeRootElement = createElementTree(flow, verticalAlign);
    validatePaths(treeRootElement);
    return treeRootElement;
};

export const validateFlow = (flow: FlowModelerProps["flow"]): void => {
    checkForCircularReference(flow.firstElementId, flow.elements);
    const treeRootElement = createMinimalElementTreeStructure(flow).firstElement;
    validatePaths(treeRootElement);
};

export const isFlowValid = (flow: FlowModelerProps["flow"]): boolean => {
    try {
        validateFlow(flow);
        return true;
    } catch (error) {
        return false;
    }
};
