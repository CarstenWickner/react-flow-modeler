import * as React from "react";

import { FlowElementWrapper } from "./FlowElementWrapper";
import { HorizontalStroke } from "./HorizontalStroke";
import { FlowElementReference } from "../model/FlowElement";

import { onLinkDropCallback } from "../types/EditAction";
import { ElementType } from "../types/GridCellData";

const returnNull = (): null => null;

export class Gateway extends React.Component<
    {
        editMenu: (() => React.ReactNode) | undefined;
        onLinkDrop: onLinkDropCallback | undefined;
    } & (
        | { type: ElementType.GatewayDiverging; gateway: FlowElementReference; followingElement?: never; onSelect: (gatewayId: string) => void }
        | {
              type: ElementType.GatewayConverging;
              gateway?: never;
              followingElement: FlowElementReference;
              onSelect: (followingElementId: string | null) => void;
          }
    )
> {
    onClick = (event: React.MouseEvent): void => {
        const { gateway, followingElement, onSelect } = this.props;
        onSelect((gateway || followingElement).getId());
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { type, gateway, followingElement, editMenu, onLinkDrop: onDrop, onSelect, children } = this.props;
        const cssType = type == ElementType.GatewayDiverging ? "diverging" : "converging";
        return (
            <>
                <FlowElementWrapper
                    elementTypeClassName={`gateway-element ${cssType}`}
                    referenceElement={gateway || followingElement}
                    editMenu={editMenu}
                    onLinkDrop={onDrop}
                    onClick={this.onClick}
                />
                {type === ElementType.GatewayConverging && <HorizontalStroke optional />}
                {type === ElementType.GatewayDiverging && (
                    // if this gateway is selected, provide a function as editMenu to indicate that, but let the function not render a second menu
                    <HorizontalStroke gatewayId={gateway.getId()} editMenu={children && editMenu ? returnNull : undefined} onSelect={onSelect}>
                        {children}
                    </HorizontalStroke>
                )}
            </>
        );
    }
}
