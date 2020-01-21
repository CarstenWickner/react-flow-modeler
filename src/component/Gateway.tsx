import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";
import { ElementType } from "../types/GridCellData";

export class Gateway extends React.Component<
    { selected: boolean } & (
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
        const { type, gatewayId, selected, onSelect, children } = this.props;
        const cssType = type == ElementType.GatewayDiverging ? "diverging" : "converging";
        return (
            <>
                <div className="stroke-horizontal arrow" />
                <div className={`flow-element gateway-element ${cssType}${selected ? " selected" : ""}`} onClick={this.onClick}>
                </div>
                {type === ElementType.GatewayConverging && <HorizontalStroke optional />}
                {type === ElementType.GatewayDiverging && (
                    <HorizontalStroke gatewayId={gatewayId} selected={selected && !!children} onSelect={onSelect}>
                        {children}
                    </HorizontalStroke>
                )}
            </>
        );
    }
}
