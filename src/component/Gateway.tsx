import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

import { ElementType } from "../types/GridCellData";

const returnNull = (): null => null;

export class Gateway extends React.Component<
    { editMenu: (() => React.ReactNode) | undefined } & (
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
                <div className="flow-element-wrapper">
                    <div className={`flow-element gateway-element ${cssType}${editMenu ? " selected" : ""}`} onClick={this.onClick} />
                    {editMenu && editMenu()}
                </div>
                {type === ElementType.GatewayConverging && <HorizontalStroke optional />}
                {type === ElementType.GatewayDiverging && (
                    // if this gateway is selected, provide a function as editMenu to indicate that, but let the function not render a second menu
                    <HorizontalStroke gatewayId={gatewayId} editMenu={children && editMenu ? returnNull : undefined} onSelect={onSelect}>
                        {children}
                    </HorizontalStroke>
                )}
            </>
        );
    }
}
