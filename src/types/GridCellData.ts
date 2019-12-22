export interface GridCellCoordinates {
    colStartIndex: number;
    colEndIndex?: number;
    rowStartIndex: number;
    rowEndIndex?: number;
}

export interface SimpleElement extends GridCellCoordinates {
    elementType: "start" | "end" | "stroke-extension";
}

/*
 * contextual information concerning a flow element
 */
export interface ContentCellData extends GridCellCoordinates {
    elementType: "content";
    elementId: string;
    elementData: { [key: string]: unknown };
}
export interface GatewayCellData extends GridCellCoordinates {
    elementType: "gateway";
    elementId: string;
    elementData: { [key: string]: unknown };
}
export interface GatewayConnectorCellData extends GridCellCoordinates {
    elementType: "gateway-connector";
    elementId: string;
    elementData: { [key: string]: unknown };
    connectionType: "first" | "middle" | "last";
}

export type GridCellData = SimpleElement | ContentCellData | GatewayCellData | GatewayConnectorCellData;
