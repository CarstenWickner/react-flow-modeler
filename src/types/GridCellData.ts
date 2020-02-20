import {
    StepNode,
    ConvergingGatewayBranch,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    DivergingGatewayNode,
    EndNode,
    StartNode
} from "./ModelElement";

export const enum ConnectionType {
    First = 1,
    Middle,
    Last
}

export type GridCellData = {
    colStartIndex: number;
    colEndIndex?: number;
    rowStartIndex: number;
    rowEndIndex?: number;
} & (
    | ({ connectionType: ConnectionType } & (DivergingGatewayBranch | ConvergingGatewayBranch))
    | ({ connectionType?: never } & (StartNode | StepNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode))
);
