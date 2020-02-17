export const enum ElementType {
    StartNode = 1,
    ContentNode,
    DivergingGatewayNode,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    ConvergingGatewayBranch,
    EndNode
}

interface BaseModelNode {
    columnIndex: number;
    rowCount: number;
}

export interface StartNode extends BaseModelNode {
    type: ElementType.StartNode;
    followingElement: ContentNode | DivergingGatewayNode | EndNode;
}

export interface ContentNode extends BaseModelNode {
    type: ElementType.ContentNode;
    id: string;
    precedingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode;
    followingElement: ContentNode | DivergingGatewayNode | ConvergingGatewayBranch | EndNode;
    data?: { [key: string]: unknown };
}

export interface DivergingGatewayNode extends BaseModelNode {
    type: ElementType.DivergingGatewayNode;
    id: string;
    precedingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode;
    followingBranches: Array<DivergingGatewayBranch>;
    data?: { [key: string]: unknown };
}

export interface DivergingGatewayBranch extends BaseModelNode {
    type: ElementType.DivergingGatewayBranch;
    precedingElement: DivergingGatewayNode;
    branchIndex: number;
    followingElement: ContentNode | DivergingGatewayNode | ConvergingGatewayBranch;
    data?: { [key: string]: unknown };
}

export interface ConvergingGatewayNode extends BaseModelNode {
    type: ElementType.ConvergingGatewayNode;
    precedingBranches: Array<ConvergingGatewayBranch>;
    followingElement: ContentNode | DivergingGatewayNode | EndNode;
}

export interface ConvergingGatewayBranch extends BaseModelNode {
    type: ElementType.ConvergingGatewayBranch;
    precedingElement: ContentNode | DivergingGatewayBranch;
    followingElement: ConvergingGatewayNode;
    branchIndex: number;
}

export interface EndNode extends BaseModelNode {
    type: ElementType.EndNode;
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
