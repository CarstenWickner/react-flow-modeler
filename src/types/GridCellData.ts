export interface GridCellCoordinates {
    colStartIndex: number;
    colEndIndex?: number;
    rowStartIndex: number;
    rowEndIndex?: number;
}

export const enum ElementType {
    Start = 1,
    Content,
    GatewayDiverging,
    GatewayConverging,
    ConnectGatewayToElement,
    ConnectElementToGateway,
    StrokeExtension,
    End
}

export interface SimpleElement extends GridCellCoordinates {
    type: ElementType.Start | ElementType.End | ElementType.StrokeExtension;
}

export interface ContentCellData extends GridCellCoordinates {
    type: ElementType.Content;
    elementId: string;
    data?: { [key: string]: unknown };
}
export interface GatewayDivergingCellData extends GridCellCoordinates {
    type: ElementType.GatewayDiverging;
    gatewayId: string;
    data?: { [key: string]: unknown };
}
export const enum ConnectionType {
    First = 1,
    Middle,
    Last
}
export interface GatewayToElementConnectorCellData extends GridCellCoordinates {
    type: ElementType.ConnectGatewayToElement;
    gatewayId: string;
    elementId?: string;
    data?: { [key: string]: unknown };
    connectionType: ConnectionType;
}
export interface ElementToGatewayConnectorCellData extends GridCellCoordinates {
    type: ElementType.ConnectElementToGateway;
    elementId: string;
    connectionType: ConnectionType;
}
export interface GatewayConvergingCellData extends GridCellCoordinates {
    type: ElementType.GatewayConverging;
    followingElementId?: string;
}

export type GridCellData =
    | SimpleElement
    | ContentCellData
    | GatewayDivergingCellData
    | GatewayToElementConnectorCellData
    | GatewayConvergingCellData
    | ElementToGatewayConnectorCellData;
