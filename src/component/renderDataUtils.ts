import { FlowContent, FlowGatewayDiverging, FlowModelerProps } from "../types/FlowModelerProps";
import { GridCellData, ElementType, ConnectionType } from "../types/GridCellData";

const isDivergingGateway = (flowElement: FlowContent | FlowGatewayDiverging): flowElement is FlowGatewayDiverging =>
    flowElement && (flowElement as FlowGatewayDiverging).nextElements !== undefined;

const getGatewayConnections = (gateway: FlowGatewayDiverging): FlowGatewayDiverging["nextElements"] => {
    // ensure that there are always at least two sub elements under a gateway to allow for respective End elements to be displayed
    let subElements;
    if (gateway.nextElements.length > 1) {
        subElements = gateway.nextElements;
    } else if (gateway.nextElements.length === 1) {
        subElements = [...gateway.nextElements, {}];
    } else {
        subElements = [{}, {}];
    }
    return subElements;
};

const collectPaths = (
    targetElementId: string,
    elements: { [key: string]: FlowContent | FlowGatewayDiverging },
    currentPath: Array<string>,
    otherPaths: Array<Array<string>>
): void => {
    const targetElement = elements[targetElementId];
    if (!targetElement) {
        // current path ends here, i.e. it should be added to the overall list
        otherPaths.push(currentPath);
        return;
    }
    if (currentPath.includes(targetElementId)) {
        // no reason to go in circles, stop it right there
        throw new Error(`Circular reference to element: ${targetElementId}`);
    }
    currentPath.push(targetElementId);
    if (isDivergingGateway(targetElement)) {
        getGatewayConnections(targetElement).forEach((next) => collectPaths(next.id, elements, currentPath.slice(0), otherPaths));
    } else {
        collectPaths(targetElement.nextElementId, elements, currentPath, otherPaths);
    }
};

const collectGridCellData = (
    targetElementId: string,
    elements: { [key: string]: FlowContent | FlowGatewayDiverging },
    gatewayColumnFlags: Array<boolean>,
    columnIndex: number,
    gridColumnOffset: number,
    totalGridColumnCount: number,
    gridRowIndex: number,
    renderData: Array<GridCellData>
): number => {
    const targetElement = elements[targetElementId];
    if (!targetElement) {
        const gapCount = totalGridColumnCount - columnIndex - gridColumnOffset;
        if (gapCount > 0) {
            renderData.push({
                colStartIndex: columnIndex + gridColumnOffset,
                colEndIndex: totalGridColumnCount,
                rowStartIndex: gridRowIndex,
                type: ElementType.StrokeExtension
            });
        }
        renderData.push({
            colStartIndex: totalGridColumnCount,
            rowStartIndex: gridRowIndex,
            type: ElementType.End
        });
        return gridRowIndex + 1;
    }
    let nextChildGridRowIndex: number;
    let elementType: ElementType.Content | ElementType.GatewayDiverging;
    if (isDivergingGateway(targetElement)) {
        elementType = ElementType.GatewayDiverging;
        nextChildGridRowIndex = gridRowIndex;
        getGatewayConnections(targetElement).forEach((childElement, childIndex, children) => {
            const thisChildStartGridRowIndex = nextChildGridRowIndex;
            nextChildGridRowIndex = collectGridCellData(
                childElement.id,
                elements,
                gatewayColumnFlags,
                columnIndex + 1,
                // increase offset to make room for gateway-connector
                gridColumnOffset + 1,
                totalGridColumnCount,
                thisChildStartGridRowIndex,
                renderData
            );
            renderData.push({
                colStartIndex: columnIndex + gridColumnOffset + 1,
                rowStartIndex: thisChildStartGridRowIndex,
                rowEndIndex: nextChildGridRowIndex,
                gatewayId: targetElementId,
                elementId: childElement.id,
                type: ElementType.ConnectGatewayToElement,
                data: childElement.conditionData,
                connectionType:
                    childIndex === 0 ? ConnectionType.First : childIndex + 1 < children.length ? ConnectionType.Middle : ConnectionType.Last
            });
        });
    } else {
        elementType = ElementType.Content;
        const columnContainsGateway = gatewayColumnFlags[columnIndex];
        nextChildGridRowIndex = collectGridCellData(
            targetElement.nextElementId,
            elements,
            gatewayColumnFlags,
            columnIndex + 1,
            // increase offset to make room for gateway-connector
            gridColumnOffset + (columnContainsGateway ? 1 : 0),
            totalGridColumnCount,
            gridRowIndex,
            renderData
        );
        if (columnContainsGateway) {
            // add placeholder to fill gap in gateway-connector column
            renderData.push({
                colStartIndex: columnIndex + gridColumnOffset + 1,
                rowStartIndex: gridRowIndex,
                rowEndIndex: nextChildGridRowIndex,
                type: ElementType.StrokeExtension
            });
        }
    }
    const commonValues = {
        colStartIndex: columnIndex + gridColumnOffset,
        rowStartIndex: gridRowIndex,
        rowEndIndex: nextChildGridRowIndex,
        data: targetElement.data
    };
    if (elementType === ElementType.Content) {
        renderData.push({
            ...commonValues,
            type: elementType,
            elementId: targetElementId
        });
    } else {
        renderData.push({
            ...commonValues,
            type: elementType,
            gatewayId: targetElementId
        });
    }
    return nextChildGridRowIndex;
};

const filterTrueValues = (flag: boolean): boolean => flag;
const sortGridCellDataByPosition = (a: GridCellData, b: GridCellData): number =>
    a.rowStartIndex - b.rowStartIndex || a.colStartIndex - b.colStartIndex;

export const buildRenderData = (flow: FlowModelerProps["flow"]): { gridCellData: Array<GridCellData>; columnCount: number } => {
    const { firstElementId, elements } = flow;
    const paths: Array<Array<string>> = [];
    collectPaths(firstElementId, elements, [], paths);
    // TODO determine where converging gateways are required
    // TODO ensure necessary gaps are considered (also for total column count)
    const elementsOnMultiplePaths = Object.keys(elements)
        .map((elementId) => [elementId, paths.filter((path) => path.includes(elementId))] as [string, Array<Array<string>>])
        .filter((entry) => entry[1].length > 1);
    const getIndexOfPath = (path: Array<string>): number => paths.indexOf(path);
    const invalidElements = elementsOnMultiplePaths
        .filter(([, pathsWithOverlappingElements]) => {
            const indexes = pathsWithOverlappingElements.map(getIndexOfPath);
            return indexes.length && indexes[0] + indexes.length != indexes[indexes.length - 1] + 1;
        })
        .map(([elementId]) => elementId);
    if (invalidElements.length > 0) {
        throw new Error(`Multiple references only valid from neighbouring paths. Invalid references to: '${invalidElements.join("', '")}'`);
    }

    const gatewayColumnFlags: Array<boolean> = [];
    paths.forEach((singlePath) =>
        singlePath.forEach((id, index) => {
            gatewayColumnFlags[index] = gatewayColumnFlags[index] || (id && isDivergingGateway(elements[id]));
        })
    );
    // plan for start, end and an additional column of "gateway-connector" elements after each column containing at least one gateway
    const totalGridColumnCount = 2 + gatewayColumnFlags.length + gatewayColumnFlags.filter(filterTrueValues).length;
    const result: Array<GridCellData> = [];
    const lastRowEndIndex = collectGridCellData(firstElementId, elements, gatewayColumnFlags, 0, 2, totalGridColumnCount, 1, result);
    // add the single start element, now that we know how many rows there are
    result.push({
        colStartIndex: 1,
        rowStartIndex: 1,
        rowEndIndex: lastRowEndIndex,
        type: ElementType.Start
    });
    // for a more readable resulting html structure, sort the grid elements first from top to bottom and within each row from left to right
    result.sort(sortGridCellDataByPosition);
    return { gridCellData: result, columnCount: totalGridColumnCount };
};
