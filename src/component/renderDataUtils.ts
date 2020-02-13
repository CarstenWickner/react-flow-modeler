import { ElementType, ModelElement } from "../model/ModelElement";
import { createValidatedElementTree } from "../model/pathValidationUtils";

import { FlowModelerProps } from "../types/FlowModelerProps";
import { GridCellData, ConnectionType } from "../types/GridCellData";

const collectGridCellData = (renderElement: ModelElement, rowStartIndex: number, renderData: Array<GridCellData>): void => {
    if (renderElement.type === ElementType.ConnectGatewayToElement || renderElement.type === ElementType.ConnectElementToGateway) {
        let colEndIndex: number;
        let branchCount: number;
        if (renderElement.type === ElementType.ConnectGatewayToElement) {
            branchCount = renderElement.precedingElement.followingBranches.length;
        } else {
            colEndIndex = renderElement.followingElement.columnIndex;
            branchCount = renderElement.followingElement.precedingBranches.length;
        }
        renderData.push({
            colStartIndex: renderElement.columnIndex,
            colEndIndex,
            rowStartIndex,
            rowEndIndex: rowStartIndex + renderElement.rowCount,
            connectionType:
                renderElement.branchIndex === 0
                    ? ConnectionType.First
                    : renderElement.branchIndex + 1 < branchCount
                    ? ConnectionType.Middle
                    : ConnectionType.Last,
            ...renderElement
        });
    } else {
        renderData.push({
            colStartIndex: renderElement.columnIndex,
            rowStartIndex,
            rowEndIndex: rowStartIndex + renderElement.rowCount,
            ...renderElement
        });
    }
    switch (renderElement.type) {
        case ElementType.Start:
        case ElementType.Content:
        case ElementType.GatewayConverging:
            collectGridCellData(renderElement.followingElement, rowStartIndex, renderData);
            break;
        case ElementType.GatewayDiverging:
            let nextChildRowStartIndex = rowStartIndex;
            renderElement.followingBranches.forEach((branch) => {
                collectGridCellData(branch, nextChildRowStartIndex, renderData);
                nextChildRowStartIndex += branch.rowCount;
            });
            break;
        case ElementType.ConnectGatewayToElement:
            collectGridCellData(renderElement.followingElement, rowStartIndex, renderData);
            break;
        case ElementType.ConnectElementToGateway:
            if (renderElement.branchIndex === 0) {
                collectGridCellData(renderElement.followingElement, rowStartIndex, renderData);
            }
            break;
    }
};

const sortGridCellDataByPosition = (a: GridCellData, b: GridCellData): number =>
    a.rowStartIndex - b.rowStartIndex || a.colStartIndex - b.colStartIndex;

const getMaxColumnIndex = (element: ModelElement): number =>
    element.type === ElementType.End
        ? element.columnIndex
        : getMaxColumnIndex(element.type === ElementType.GatewayDiverging ? element.followingBranches[0].followingElement : element.followingElement);

export const buildRenderData = (
    flow: FlowModelerProps["flow"],
    verticalAlign: "top" | "bottom"
): { gridCellData: Array<GridCellData>; columnCount: number } => {
    const start = createValidatedElementTree(flow, verticalAlign);
    const result: Array<GridCellData> = [];
    collectGridCellData(start, 1, result);
    // for a more readable resulting html structure, sort the grid elements first from top to bottom and within each row from left to right
    result.sort(sortGridCellDataByPosition);
    return { gridCellData: result, columnCount: getMaxColumnIndex(start) };
};
