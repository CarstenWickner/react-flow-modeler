import { isDivergingGateway, createElementTree, createMinimalElementTreeStructure } from "./modelUtils";

import {
    ContentNode,
    ConvergingGatewayBranch,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    DivergingGatewayNode,
    ElementType,
    ModelElement,
    StartNode
} from "../types/ModelElement";
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

const collectTopPath = (
    element: ContentNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode,
    path: Array<ContentNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode>
): void => {
    path.push(element);
    if (element.type !== ElementType.DivergingGatewayBranch || element.branchIndex === 0) {
        const nextElement =
            element.type === ElementType.ConvergingGatewayNode ? element.precedingBranches[0].precedingElement : element.precedingElement;
        // since this function is intended for any but the very top path, it should never end at the start node
        collectTopPath((nextElement as unknown) as ContentNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode, path);
        // checking it explicitly at run-time like this is unnecessary:
        // if (nextElement.type !== ElementType.StartNode) {
        //    collectTopPath(nextElement, path);
        // }
    }
};

const bottomAncestorIsAbovePath = (
    element: StartNode | ContentNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode,
    pathToIntersectWith: Array<ContentNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode>
): boolean => {
    switch (element.type) {
        case ElementType.StartNode:
            return false;
        case ElementType.DivergingGatewayBranch:
            const branchAfterCommonGateway = (pathToIntersectWith.find(
                (entry) => entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement === element.precedingElement
            ) as unknown) as DivergingGatewayBranch;
            if (branchAfterCommonGateway) {
                return element.branchIndex + 1 === branchAfterCommonGateway.branchIndex;
            }
            return (
                element.branchIndex + 1 === element.precedingElement.followingBranches.length &&
                bottomAncestorIsAbovePath(element.precedingElement.precedingElement, pathToIntersectWith)
            );
        case ElementType.ConvergingGatewayNode:
            const convergingBranches = element.precedingBranches;
            return bottomAncestorIsAbovePath(convergingBranches[convergingBranches.length - 1].precedingElement, pathToIntersectWith);
        default:
            return bottomAncestorIsAbovePath(element.precedingElement, pathToIntersectWith);
    }
};

/**
 * Check whether the given two branches are neighbours.
 *
 * @param {ConvergingGatewayBranch} branchOne - leading converging branch
 * @param {ConvergingGatewayBranch} branchTwo - trailing converging branch
 * @returns {boolean} whether the converging gateway is valid.
 */
const areParentsNeighbours = (branchOne: ConvergingGatewayBranch, branchTwo: ConvergingGatewayBranch): boolean => {
    // collect path to second branch
    const topPathToSecond: Array<ContentNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode> = [];
    collectTopPath(branchTwo.precedingElement, topPathToSecond);
    // iterate backwards over path to first element until finding a common parent (worst case: the root element)
    return bottomAncestorIsAbovePath(branchOne.precedingElement, topPathToSecond);
};

/**
 * Check whether the implicit converging gateway in front of the given element is valid, i.e. whether all connection pairs are direct neighbours.
 *
 * @param {ConvergingGatewayNode} gateway - element being referenced from multiple parents (thereby being preceded by an implicit converging gateway)
 * @returns {boolean} whether the implicit converging gateway is invalid (beware the negation!)
 */
const isInvalidConvergingGateway = (gateway: ConvergingGatewayNode): boolean => {
    const connectedElements = gateway.precedingBranches;
    return connectedElements.slice(1).some((nextElement, previousIndex) => !areParentsNeighbours(connectedElements[previousIndex], nextElement));
};

/**
 * Validate that the parsed data model can be properly displayed. Ensuring that only directly neighbouring paths can link to the same element.
 *
 * @param {StartNode} start - root of the parsed data model to validate
 * @throws Error in case of any (implicit) converging gateways connecting non-neighbouring paths
 */
const validatePaths = (start: StartNode): void => {
    // use Set to automatically filter out duplicates and thereby avoid checking the same gateway repeatedly
    const convergingGateways = new Set<ConvergingGatewayNode>();
    const collectConvergingGateways = (element: ModelElement): void => {
        if (element.type === ElementType.ConvergingGatewayNode) {
            convergingGateways.add(element);
        }
        if (element.type === ElementType.DivergingGatewayNode) {
            element.followingBranches.forEach(collectConvergingGateways);
        } else if (element.type !== ElementType.EndNode) {
            collectConvergingGateways(element.followingElement);
        }
    };
    collectConvergingGateways(start.followingElement);
    const invalidElements = Array.from(convergingGateways).filter(isInvalidConvergingGateway);
    if (invalidElements.length) {
        throw new Error(
            `Multiple references only valid from neighbouring paths. Invalid references to: ${invalidElements
                .map((gateway) => (gateway.followingElement.type === ElementType.EndNode ? "end" : `'${gateway.followingElement.id}'`))
                .join(", ")}`
        );
    }
};

export const createValidatedElementTree = (flow: FlowModelerProps["flow"], verticalAlign: "top" | "bottom"): StartNode => {
    checkForCircularReference(flow.firstElementId, flow.elements);
    const start = createElementTree(flow, verticalAlign);
    validatePaths(start);
    return start;
};

export const validateFlow = (flow: FlowModelerProps["flow"]): void => {
    checkForCircularReference(flow.firstElementId, flow.elements);
    const { start } = createMinimalElementTreeStructure(flow);
    validatePaths(start);
};

export const isFlowValid = (flow: FlowModelerProps["flow"]): boolean => {
    try {
        validateFlow(flow);
        return true;
    } catch (error) {
        return false;
    }
};
