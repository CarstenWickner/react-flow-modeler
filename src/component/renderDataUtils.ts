import { FlowElement } from "../model/FlowElement";
import { createValidatedElementTree } from "../model/pathValidationUtils";

import { FlowContent, FlowGatewayDiverging, FlowModelerProps } from "../types/FlowModelerProps";
import { GridCellData, ElementType, ConnectionType } from "../types/GridCellData";

const getColumnIndexAfter = (element: FlowElement): number => element.getColumnIndex() + (element.getFollowingElements().length > 1 ? 2 : 1);

const collectGridCellData = (
    renderElement: FlowElement,
    triggeringRenderElement: FlowElement,
    elements: { [key: string]: FlowContent | FlowGatewayDiverging },
    rowStartIndex: number,
    renderData: Array<GridCellData>
): void => {
    const rowEndIndex = rowStartIndex + renderElement.getRowCount();
    const targetElement = elements[renderElement.getId()];
    if (renderElement.getPrecedingElements().length > 1) {
        if (renderData.some((cellData) => cellData.type === ElementType.GatewayConverging && cellData.followingElement === renderElement)) {
            // avoid rendering the same converging gateway and its children multiple times
            return;
        }
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
                element: precedingElement,
                connectionType:
                    parentIndex === 0 ? ConnectionType.First : parentIndex + 1 < parents.length ? ConnectionType.Middle : ConnectionType.Last
            });
        });
        // render converging gateway
        renderData.push({
            colStartIndex: renderElement.getColumnIndex() - 1,
            rowStartIndex,
            rowEndIndex,
            type: ElementType.GatewayConverging,
            followingElement: renderElement
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
            gateway: renderElement
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
                gateway: renderElement,
                type: ElementType.ConnectGatewayToElement,
                data: ((targetElement as FlowGatewayDiverging).nextElements[childIndex] || {}).conditionData,
                connectionType:
                    childIndex === 0 ? ConnectionType.First : childIndex + 1 < children.length ? ConnectionType.Middle : ConnectionType.Last,
                branchIndex: childIndex
            });
            // render next element
            collectGridCellData(childRenderElement, renderElement, elements, thisChildStartRowIndex, renderData);
        });
    } else {
        // render content element
        renderData.push({
            colStartIndex: renderElement.getColumnIndex(),
            rowStartIndex,
            rowEndIndex,
            data: targetElement.data,
            type: ElementType.Content,
            element: renderElement
        });
        // render next element
        collectGridCellData(renderElement.getFollowingElements()[0], renderElement, elements, rowStartIndex, renderData);
    }
};

const sortGridCellDataByPosition = (a: GridCellData, b: GridCellData): number =>
    a.rowStartIndex - b.rowStartIndex || a.colStartIndex - b.colStartIndex;

const getMaxColumnIndex = (element: FlowElement): number =>
    Math.max(element.getColumnIndex(), ...element.getFollowingElements().map(getMaxColumnIndex));

export const buildRenderData = (
    flow: FlowModelerProps["flow"],
    verticalAlign: "top" | "bottom"
): { gridCellData: Array<GridCellData>; columnCount: number } => {
    const treeRootElement = createValidatedElementTree(flow, verticalAlign);
    const result: Array<GridCellData> = [];
    // add single start element
    result.push({
        colStartIndex: 1,
        rowStartIndex: 1,
        rowEndIndex: 1 + treeRootElement.getRowCount(),
        type: ElementType.Start
    });
    collectGridCellData(treeRootElement, undefined, flow.elements, 1, result);
    // for a more readable resulting html structure, sort the grid elements first from top to bottom and within each row from left to right
    result.sort(sortGridCellDataByPosition);
    return { gridCellData: result, columnCount: getMaxColumnIndex(treeRootElement) };
};
