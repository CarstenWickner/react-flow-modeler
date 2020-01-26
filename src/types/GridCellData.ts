import { FlowElementReference } from "../model/FlowElement";

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
    element: FlowElementReference;
    data?: { [key: string]: unknown };
}
export interface GatewayDivergingCellData extends GridCellCoordinates {
    type: ElementType.GatewayDiverging;
    gateway: FlowElementReference;
    data?: { [key: string]: unknown };
}
export const enum ConnectionType {
    First = 1,
    Middle,
    Last
}
export interface GatewayToElementConnectorCellData extends GridCellCoordinates {
    type: ElementType.ConnectGatewayToElement;
    gateway: FlowElementReference;
    data?: { [key: string]: unknown };
    connectionType: ConnectionType;
    branchIndex: number;
}
export interface ElementToGatewayConnectorCellData extends GridCellCoordinates {
    type: ElementType.ConnectElementToGateway;
    element: FlowElementReference;
    connectionType: ConnectionType;
}
export interface GatewayConvergingCellData extends GridCellCoordinates {
    type: ElementType.GatewayConverging;
    followingElement: FlowElementReference;
}

export type GridCellData =
    | SimpleElement
    | ContentCellData
    | GatewayDivergingCellData
    | GatewayToElementConnectorCellData
    | GatewayConvergingCellData
    | ElementToGatewayConnectorCellData;
