export const enum ElementType {
    StartNode = "start",
    StepNode = "step",
    DivergingGatewayNode = "div-gw",
    ConvergingGatewayNode = "conv-gw",
    DivergingGatewayBranch = "div-branch",
    ConvergingGatewayBranch = "conv-branch",
    EndNode = "end"
}

interface BaseModelNode {
    columnIndex: number;
    rowCount: number;
}

export interface StartNode extends BaseModelNode {
    type: ElementType.StartNode;
    followingElement: StepNode | DivergingGatewayNode | EndNode;
}

export interface StepNode extends BaseModelNode {
    type: ElementType.StepNode;
    id: string;
    precedingElement: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode;
    followingElement: StepNode | DivergingGatewayNode | ConvergingGatewayBranch | EndNode;
    data?: { [key: string]: unknown };
}

export interface DivergingGatewayNode extends BaseModelNode {
    type: ElementType.DivergingGatewayNode;
    id: string;
    precedingElement: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode;
    followingBranches: Array<DivergingGatewayBranch>;
    data?: { [key: string]: unknown };
}

export interface DivergingGatewayBranch extends BaseModelNode {
    type: ElementType.DivergingGatewayBranch;
    precedingElement: DivergingGatewayNode;
    branchIndex: number;
    followingElement: StepNode | DivergingGatewayNode | ConvergingGatewayBranch;
    data?: { [key: string]: unknown };
}

export interface ConvergingGatewayNode extends BaseModelNode {
    type: ElementType.ConvergingGatewayNode;
    precedingBranches: Array<ConvergingGatewayBranch>;
    followingElement: StepNode | DivergingGatewayNode | EndNode;
}

export interface ConvergingGatewayBranch extends BaseModelNode {
    type: ElementType.ConvergingGatewayBranch;
    precedingElement: StepNode | DivergingGatewayBranch;
    followingElement: ConvergingGatewayNode;
    branchIndex: number;
}

export interface EndNode extends BaseModelNode {
    type: ElementType.EndNode;
    precedingElement: StartNode | StepNode | ConvergingGatewayNode;
}

export type ModelElementExclStart =
    | StepNode
    | DivergingGatewayNode
    | DivergingGatewayBranch
    | ConvergingGatewayBranch
    | ConvergingGatewayNode
    | EndNode;

export type ModelElement = StartNode | ModelElementExclStart;
