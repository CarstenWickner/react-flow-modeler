import { StepNode, DivergingGatewayBranch, DivergingGatewayNode, ConvergingGatewayNode, ElementType, EndNode } from "./ModelElement";
import { FlowModelerProps } from "./FlowModelerProps";

export type SelectableElementType =
    | ElementType.StartNode
    | ElementType.StepNode
    | ElementType.DivergingGatewayNode
    | ElementType.ConvergingGatewayNode
    | ElementType.DivergingGatewayBranch;

export interface EditActionResult {
    changedFlow: FlowModelerProps["flow"];
}

export enum DraggableType {
    LINK = "link"
}

export interface DraggedLinkContext {
    type: DraggableType.LINK;
    originElement: StepNode | DivergingGatewayBranch;
}

export type onLinkDropCallback = {
    (dropTarget: StepNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode, dragContext: DraggedLinkContext, dryRun?: never): void;
    (dropTarget: StepNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode, dragContext: DraggedLinkContext, dryRun?: true): EditActionResult;
};
