import { FlowElementReference } from "../model/FlowElement";
import { FlowModelerProps } from "./FlowModelerProps";
import { ElementType } from "./GridCellData";

export type SelectableElementType =
    | ElementType.Start
    | ElementType.Content
    | ElementType.GatewayDiverging
    | ElementType.GatewayConverging
    | ElementType.ConnectGatewayToElement;

export type EditActionResult = {
    changedFlow: FlowModelerProps["flow"];
};

export enum DraggableType {
    LINK = "link"
}

export interface DraggedLinkContext {
    type: DraggableType.LINK;
    originType: ElementType.Content | ElementType.ConnectGatewayToElement;
    originElement?: FlowElementReference;
    originBranchIndex?: number;
}

export type onLinkDropCallback = {
    (dropTarget: FlowElementReference, dragContext: DraggedLinkContext, dryRun?: never): void;
    (dropTarget: FlowElementReference, dragContext: DraggedLinkContext, dryRun?: true): EditActionResult;
};
