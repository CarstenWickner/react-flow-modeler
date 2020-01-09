import { FlowContent, FlowGatewayDiverging, FlowModelerProps } from "../types/FlowModelerProps";
import { GridCellData, ElementType, ConnectionType } from "../types/GridCellData";
import { isDivergingGateway, createElementTree } from "../model/modelUtils";
import { FlowElement } from "../model/FlowElement";

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

const validatePaths = ({ firstElementId, elements }: FlowModelerProps["flow"]): void => {
    const paths: Array<Array<string>> = [];
    recursivelyCollectPaths(firstElementId, elements, [], paths);
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
};

const getColumnIndexAfter = (element: FlowElement): number => element.getColumnIndex() + (element.getFollowingElements().length > 1 ? 2 : 1);

const collectGridCellData = (
    renderElement: FlowElement,
    indexInDivergingParentGateway: number | undefined,
    triggeringRenderElement: FlowElement,
    elements: { [key: string]: FlowContent | FlowGatewayDiverging },
    rowStartIndex: number,
    renderData: Array<GridCellData>
): void => {
    if (
        renderElement.getPrecedingElements().length > 1 &&
        (renderElement.getPrecedingElements()[0] !== triggeringRenderElement || indexInDivergingParentGateway > 0)
    ) {
        // avoid rendering the same converging gateway and its children multiple times
        return;
    }
    const rowEndIndex = rowStartIndex + renderElement.getRowCount();
    const targetElement = elements[renderElement.getId()];
    if (renderElement.getPrecedingElements().length > 1) {
        let nextChildRowStartIndex = rowStartIndex;
        renderElement.getPrecedingElements().forEach((precedingElement, parentIndex, parents) => {
            const thisChildStartRowIndex = nextChildRowStartIndex;
            nextChildRowStartIndex =
                thisChildStartRowIndex + (precedingElement.getFollowingElements().length > 1 ? 1 : precedingElement.getRowCount());
            // render element-to-gateway connector
            renderData.push({
                colStartIndex: getColumnIndexAfter(precedingElement),
                colEndIndex: renderElement.getColumnIndex() - 1,
                rowStartIndex: thisChildStartRowIndex,
                rowEndIndex: nextChildRowStartIndex,
                type: ElementType.ConnectElementToGateway,
                elementId: precedingElement.getId(),
                connectionType:
                    parentIndex === 0 ? ConnectionType.First : parentIndex + 1 < parents.length ? ConnectionType.Middle : ConnectionType.Last
            });
        });
        // render converging gateway
        renderData.push({
            colStartIndex: renderElement.getColumnIndex() - 1,
            rowStartIndex,
            rowEndIndex,
            type: ElementType.GatewayConverging
        });
    } else if (triggeringRenderElement && getColumnIndexAfter(triggeringRenderElement) < renderElement.getColumnIndex()) {
        // fill gaps between elements
        renderData.push({
            colStartIndex: getColumnIndexAfter(triggeringRenderElement),
            colEndIndex: renderElement.getColumnIndex(),
            rowStartIndex,
            rowEndIndex,
            type: ElementType.StrokeExtension
        });
    }
    if (!targetElement) {
        renderData.push({
            colStartIndex: renderElement.getColumnIndex(),
            rowStartIndex,
            rowEndIndex,
            type: ElementType.End
        });
        return;
    }
    if (renderElement.getFollowingElements().length > 1) {
        // render diverging gateway
        renderData.push({
            colStartIndex: renderElement.getColumnIndex(),
            rowStartIndex,
            rowEndIndex,
            data: targetElement.data,
            type: ElementType.GatewayDiverging,
            gatewayId: renderElement.getId()
        });
        let nextChildRowStartIndex = rowStartIndex;
        renderElement.getFollowingElements().forEach((childRenderElement, childIndex, children) => {
            const thisChildStartRowIndex = nextChildRowStartIndex;
            nextChildRowStartIndex =
                thisChildStartRowIndex + (childRenderElement.getPrecedingElements().length > 1 ? 1 : childRenderElement.getRowCount());
            // render gateway-to-element connector
            renderData.push({
                colStartIndex: renderElement.getColumnIndex() + 1,
                rowStartIndex: thisChildStartRowIndex,
                rowEndIndex: nextChildRowStartIndex,
                gatewayId: renderElement.getId(),
                elementId: childRenderElement.getId(),
                type: ElementType.ConnectGatewayToElement,
                data: ((targetElement as FlowGatewayDiverging).nextElements[childIndex] || {}).conditionData,
                connectionType:
                    childIndex === 0 ? ConnectionType.First : childIndex + 1 < children.length ? ConnectionType.Middle : ConnectionType.Last
            });
            // render next element
            collectGridCellData(childRenderElement, childIndex, renderElement, elements, thisChildStartRowIndex, renderData);
        });
    } else {
        // render content element
        renderData.push({
            colStartIndex: renderElement.getColumnIndex(),
            rowStartIndex,
            rowEndIndex,
            data: targetElement.data,
            type: ElementType.Content,
            elementId: renderElement.getId()
        });
        // render next element
        collectGridCellData(renderElement.getFollowingElements()[0], undefined, renderElement, elements, rowStartIndex, renderData);
    }
};

const sortGridCellDataByPosition = (a: GridCellData, b: GridCellData): number =>
    a.rowStartIndex - b.rowStartIndex || a.colStartIndex - b.colStartIndex;

const getMaxColumnIndex = (element: FlowElement): number =>
    Math.max(element.getColumnIndex(), ...element.getFollowingElements().map(getMaxColumnIndex));

export const buildRenderData = (flow: FlowModelerProps["flow"]): { gridCellData: Array<GridCellData>; columnCount: number } => {
    validatePaths(flow);
    const treeRootElement = createElementTree(flow);
    const result: Array<GridCellData> = [];
    // add single start element
    result.push({
        colStartIndex: 1,
        rowStartIndex: 1,
        rowEndIndex: 1 + treeRootElement.getRowCount(),
        type: ElementType.Start
    });
    const { elements } = flow;
    collectGridCellData(treeRootElement, undefined, undefined, elements, 1, result);
    // for a more readable resulting html structure, sort the grid elements first from top to bottom and within each row from left to right
    result.sort(sortGridCellDataByPosition);
    return { gridCellData: result, columnCount: getMaxColumnIndex(treeRootElement) };
};
