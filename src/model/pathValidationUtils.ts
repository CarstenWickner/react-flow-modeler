import { isDivergingGateway } from "./modelUtils";
import { FlowModelerProps, FlowContent, FlowGatewayDiverging } from "../types/FlowModelerProps";

const recursivelyCollectPaths = (
    targetElementId: string,
    elements: { [key: string]: FlowContent | FlowGatewayDiverging },
    currentPath: Array<string>,
    otherPaths: Array<Array<string>>
): void => {
    if (currentPath.includes(targetElementId)) {
        // no reason to go in circles, stop it right there
        throw new Error(`Circular reference to element: ${targetElementId}`);
    }
    currentPath.push(targetElementId);
    const targetElement = elements[targetElementId];
    if (!targetElement) {
        // current path ends here, i.e. it should be added to the overall list
        otherPaths.push(currentPath);
    } else if (isDivergingGateway(targetElement)) {
        // ensure that there are always at least two sub elements under a gateway to allow for respective End elements to be displayed
        let subElements;
        if (targetElement.nextElements.length > 1) {
            subElements = targetElement.nextElements;
        } else if (targetElement.nextElements.length === 1) {
            subElements = [...targetElement.nextElements, {}];
        } else {
            subElements = [{}, {}];
        }
        subElements.forEach((next) => recursivelyCollectPaths(next.id, elements, currentPath.slice(0), otherPaths));
    } else {
        recursivelyCollectPaths(targetElement.nextElementId, elements, currentPath, otherPaths);
    }
};
/*
const filterPathsWithDifferingStart = ([elementId, pathsIncludingElement]: [string, Array<Array<string>>]): boolean => {
    if (pathsIncludingElement.length < 2) {
        return false;
    }
    const elementIndex = pathsIncludingElement[0].indexOf(elementId);
    if (pathsIncludingElement.some((path) => path.indexOf(elementId) !== elementIndex)) {
        return true;
    }
    const leadingPathPart = pathsIncludingElement[0].slice(0, elementIndex);
    return pathsIncludingElement.some((path) => leadingPathPart.some((value, index) => value !== path[index]));
};
*/

export const validatePaths = ({ firstElementId, elements }: FlowModelerProps["flow"]): void => {
    const paths: Array<Array<string>> = [];
    recursivelyCollectPaths(firstElementId, elements, [], paths);
    /*
    const elementsOnMultiplePaths = Object.keys(elements)
        .map((elementId) => [elementId, paths.filter((path) => path.includes(elementId))] as [string, Array<Array<string>>])
        .filter(filterPathsWithDifferingStart);
    const getIndexOfPath = (path: Array<string>): number => paths.indexOf(path);
    const invalidElements = elementsOnMultiplePaths.filter(([, pathsWithOverlap]) => {
        const indexes = pathsWithOverlap.map(getIndexOfPath);
        return indexes.length && indexes[0] + indexes.length != indexes[indexes.length - 1] + 1;
    });
    if (invalidElements.length) {
        throw new Error(
            `Multiple references only valid from neighbouring paths. Invalid references to: '${invalidElements
                .map(([elementId]) => elementId)
                .join("', '")}'`
        );
    }
    */
};
