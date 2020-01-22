import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

import { ElementType } from "../types/GridCellData";

export class Gateway extends React.Component<
    { editMenu: React.ReactNode | undefined } & (
        | { type: ElementType.GatewayDiverging; gatewayId: string; followingElementId?: never; onSelect: (gatewayId: string) => void }
        | {
              type: ElementType.GatewayConverging;
              gatewayId?: never;
              followingElementId: string | null;
              onSelect: (followingElementId: string | null) => void;
          }
    )
> {
    onClick = (event: React.MouseEvent): void => {
        const { gatewayId, followingElementId, onSelect } = this.props;
        onSelect(gatewayId || followingElementId);
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { type, gatewayId, editMenu, onSelect, children } = this.props;
        const cssType = type == ElementType.GatewayDiverging ? "diverging" : "converging";
        return (
            <>
                <div className="stroke-horizontal arrow" />
                <div className={`flow-element gateway-element ${cssType}${editMenu ? " selected" : ""}`} onClick={this.onClick}>
                    {editMenu}
                </div>
                {type === ElementType.GatewayConverging && <HorizontalStroke optional />}
                {type === ElementType.GatewayDiverging && (
                    <HorizontalStroke gatewayId={gatewayId} editMenu={children ? editMenu : undefined} onSelect={onSelect}>
                        {children}
                    </HorizontalStroke>
                )}
            </>
        );
    }
}
