import { ContentNode, DivergingGatewayBranch, DivergingGatewayNode, ConvergingGatewayNode, ElementType, EndNode } from "../model/ModelElement";
import { FlowModelerProps } from "./FlowModelerProps";

export type SelectableElementType =
    | ElementType.Start
    | ElementType.Content
    | ElementType.GatewayDiverging
    | ElementType.GatewayConverging
    | ElementType.ConnectGatewayToElement;

export interface EditActionResult {
    changedFlow: FlowModelerProps["flow"];
}

export enum DraggableType {
    LINK = "link"
}

export interface DraggedLinkContext {
    type: DraggableType.LINK;
    originElement: ContentNode | DivergingGatewayBranch;
}

export type onLinkDropCallback = {
    (dropTarget: ContentNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode, dragContext: DraggedLinkContext, dryRun?: never): void;
    (
        dropTarget: ContentNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode,
        dragContext: DraggedLinkContext,
        dryRun?: true
    ): EditActionResult;
};
