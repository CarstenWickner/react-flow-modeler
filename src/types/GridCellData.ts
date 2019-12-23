export interface GridCellCoordinates {
    colStartIndex: number;
    colEndIndex?: number;
    rowStartIndex: number;
    rowEndIndex?: number;
}

export interface SimpleElement extends GridCellCoordinates {
    type: "start" | "end" | "stroke-extension";
}

/*
 * contextual information concerning a flow element
 */
export interface ContentCellData extends GridCellCoordinates {
    type: "content";
    elementId: string;
    data?: { [key: string]: unknown };
}
export interface GatewayDivergingCellData extends GridCellCoordinates {
    type: "gateway-diverging";
    gatewayId: string;
    data?: { [key: string]: unknown };
}
export interface GatewayToElementConnectorCellData extends GridCellCoordinates {
    type: "gateway-to-element";
    gatewayId: string;
    elementId?: string;
    data?: { [key: string]: unknown };
    connectionType: "first" | "middle" | "last";
}
export interface ElementToGatewayConnectorCellData extends GridCellCoordinates {
    type: "element-to-gateway";
    elementId: string;
    connectionType: "first" | "middle" | "last";
}
export interface GatewayConvergingCellData extends GridCellCoordinates {
    type: "gateway-converging";
}

export type GridCellData =
    | SimpleElement
    | ContentCellData
    | GatewayDivergingCellData
    | GatewayToElementConnectorCellData
    | GatewayConvergingCellData
    | ElementToGatewayConnectorCellData;
