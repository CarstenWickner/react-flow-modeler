import { FlowContent, FlowGateway, FlowModelerProps } from "../types/FlowModelerProps";
import { GridCellData } from "../types/GridCellData";

const isGateway = (flowElement: FlowContent | FlowGateway): flowElement is FlowGateway =>
    flowElement && (flowElement as FlowGateway).nextElements !== undefined;

const determineColumnsWithGateway = (
    targetElementId: string,
    elementsById: Map<string, FlowContent | FlowGateway>,
    columnIndex: number,
    gatewayColumnFlags: Array<boolean>
): void => {
    const targetElement = elementsById.get(targetElementId);
    if (isGateway(targetElement)) {
        gatewayColumnFlags[columnIndex] = true;
        targetElement.nextElements.forEach((elementAfterGateway) =>
            determineColumnsWithGateway(elementAfterGateway.id, elementsById, columnIndex + 1, gatewayColumnFlags)
        );
    } else if (targetElement) {
        gatewayColumnFlags[columnIndex] = gatewayColumnFlags[columnIndex] || false;
        determineColumnsWithGateway(targetElement.nextElementId, elementsById, columnIndex + 1, gatewayColumnFlags);
    }
};

const collectGridCellData = (
    targetElementId: string,
    elementsById: Map<string, FlowContent | FlowGateway>,
    gatewayColumnFlags: Array<boolean>,
    columnIndex: number,
    gridColumnOffset: number,
    totalGridColumnCount: number,
    gridRowIndex: number,
    renderData: Array<GridCellData>
): number => {
    const targetElement = elementsById.get(targetElementId);
    if (!targetElement) {
        const gapCount = totalGridColumnCount - columnIndex - gridColumnOffset;
        if (gapCount > 0) {
            renderData.push({
                colStartIndex: columnIndex + gridColumnOffset,
                colEndIndex: totalGridColumnCount,
                rowStartIndex: gridRowIndex,
                elementType: "stroke-extension"
            });
        }
        renderData.push({
            colStartIndex: totalGridColumnCount,
            rowStartIndex: gridRowIndex,
            elementType: "end"
        });
        return gridRowIndex + 1;
    }
    let nextChildGridRowIndex: number;
    let elementType: "content" | "gateway";
    if (isGateway(targetElement)) {
        elementType = "gateway";
        nextChildGridRowIndex = gridRowIndex;
        // ensure that there are always at least two sub elements under a gateway to allow for respective "end" elements to be displayed
        let subElements;
        if (targetElement.nextElements.length > 1) {
            subElements = targetElement.nextElements;
        } else if (targetElement.nextElements.length === 1) {
            subElements = [...targetElement.nextElements, {}];
        } else {
            subElements = [{}, {}];
        }
        subElements.forEach((childElement, childIndex, children) => {
            const thisChildStartGridRowIndex = nextChildGridRowIndex;
            nextChildGridRowIndex = collectGridCellData(
                childElement.id,
                elementsById,
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
                elementId: childElement.id,
                elementType: "gateway-connector",
                elementData: childElement.conditionData,
                connectionType: childIndex === 0 ? "first" : childIndex + 1 < children.length ? "middle" : "last"
            });
        });
    } else {
        elementType = "content";
        const columnContainsGateway = gatewayColumnFlags[columnIndex];
        nextChildGridRowIndex = collectGridCellData(
            targetElement.nextElementId,
            elementsById,
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
                elementType: "stroke-extension"
            });
        }
    }
    renderData.push({
        colStartIndex: columnIndex + gridColumnOffset,
        rowStartIndex: gridRowIndex,
        rowEndIndex: nextChildGridRowIndex,
        elementId: targetElementId,
        elementType,
        elementData: targetElement.data
    });
    return nextChildGridRowIndex;
};

const mapElementById = <T extends FlowContent | FlowGateway>(element: T): [string, T] => [element.id, element];
const filterTrueValues = (flag: boolean): boolean => flag;
const sortGridCellDataByPosition = (a: GridCellData, b: GridCellData): number =>
    a.rowStartIndex - b.rowStartIndex || a.colStartIndex - b.colStartIndex;

export const buildRenderData = (flow: FlowModelerProps["flow"]): { gridCellData: Array<GridCellData>; columnCount: number } => {
    const { firstElementId, elements } = flow;
    const elementsById = new Map(elements.map(mapElementById));
    const gatewayColumnFlags: Array<boolean> = [];
    determineColumnsWithGateway(firstElementId, elementsById, 0, gatewayColumnFlags);
    // plan for start, end and an additional column of "gateway-connector" elements after each column containing at least one gateway
    const totalGridColumnCount = 2 + gatewayColumnFlags.length + gatewayColumnFlags.filter(filterTrueValues).length;
    const result: Array<GridCellData> = [];
    const lastRowEndIndex = collectGridCellData(firstElementId, elementsById, gatewayColumnFlags, 0, 2, totalGridColumnCount, 1, result);
    // add the single start element, now that we know how many rows there are
    result.push({
        colStartIndex: 1,
        rowStartIndex: 1,
        rowEndIndex: lastRowEndIndex,
        elementType: "start"
    });
    // for a more readable resulting html structure, sort the grid elements first from top to bottom and within each row from left to right
    result.sort(sortGridCellDataByPosition);
    return { gridCellData: result, columnCount: totalGridColumnCount };
};
