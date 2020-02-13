export const enum ElementType {
    Start = 1,
    Content,
    GatewayDiverging,
    GatewayConverging,
    ConnectGatewayToElement,
    ConnectElementToGateway,
    End
}

interface BaseModelNode {
    columnIndex: number;
    rowCount: number;
}

export interface StartNode extends BaseModelNode {
    type: ElementType.Start;
    followingElement: ContentNode | DivergingGatewayNode | EndNode;
}

export interface ContentNode extends BaseModelNode {
    type: ElementType.Content;
    id: string;
    precedingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode;
    followingElement: ContentNode | DivergingGatewayNode | ConvergingGatewayBranch | EndNode;
    data?: { [key: string]: unknown };
}

export interface DivergingGatewayNode extends BaseModelNode {
    type: ElementType.GatewayDiverging;
    id: string;
    precedingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode;
    followingBranches: Array<DivergingGatewayBranch>;
    data?: { [key: string]: unknown };
}

export interface DivergingGatewayBranch extends BaseModelNode {
    type: ElementType.ConnectGatewayToElement;
    precedingElement: DivergingGatewayNode;
    branchIndex: number;
    followingElement: ContentNode | DivergingGatewayNode | ConvergingGatewayBranch;
    data?: { [key: string]: unknown };
}

export interface ConvergingGatewayNode extends BaseModelNode {
    type: ElementType.GatewayConverging;
    precedingBranches: Array<ConvergingGatewayBranch>;
    followingElement: ContentNode | DivergingGatewayNode | EndNode;
}

export interface ConvergingGatewayBranch extends BaseModelNode {
    type: ElementType.ConnectElementToGateway;
    precedingElement: ContentNode | DivergingGatewayBranch;
    followingElement: ConvergingGatewayNode;
    branchIndex: number;
}

export interface EndNode extends BaseModelNode {
    type: ElementType.End;
    precedingElement: StartNode | ContentNode | ConvergingGatewayNode;
}

export type ModelElementExclStart =
    | ContentNode
    | DivergingGatewayNode
    | DivergingGatewayBranch
    | ConvergingGatewayBranch
    | ConvergingGatewayNode
    | EndNode;

export type ModelElement = StartNode | ModelElementExclStart;
