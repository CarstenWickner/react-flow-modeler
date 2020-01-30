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
