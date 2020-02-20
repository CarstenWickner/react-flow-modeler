import * as React from "react";

import { FlowElementWrapper } from "./FlowElementWrapper";
import { HorizontalStroke } from "./HorizontalStroke";

import { ConvergingGatewayNode, DivergingGatewayNode, ElementType, DivergingGatewayBranch } from "../types/ModelElement";
import { onLinkDropCallback } from "../types/EditAction";

const returnNull = (): null => null;

export class Gateway extends React.Component<{
    gateway: DivergingGatewayNode | ConvergingGatewayNode;
    onSelect: (reference: DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode) => void;
    editMenu: (() => React.ReactNode) | undefined;
    onLinkDrop: onLinkDropCallback | undefined;
}> {
    onClick = (event: React.MouseEvent): void => {
        const { onSelect, gateway } = this.props;
        onSelect(gateway);
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { gateway, editMenu, onLinkDrop: onDrop, onSelect, children } = this.props;
        const cssType = gateway.type == ElementType.DivergingGatewayNode ? "diverging" : "converging";
        return (
            <>
                <FlowElementWrapper
                    elementTypeClassName={`gateway-element ${cssType}`}
                    referenceElement={gateway}
                    editMenu={editMenu}
                    onLinkDrop={onDrop}
                    onClick={this.onClick}
                />
                {gateway.type === ElementType.ConvergingGatewayNode && <div className="stroke-horizontal optional" />}
                {gateway.type === ElementType.DivergingGatewayNode && (
                    // if this gateway is selected, provide a function as editMenu to indicate that, but let the function not render a second menu
                    <HorizontalStroke referenceElement={gateway} editMenu={children && editMenu ? returnNull : undefined} onSelect={onSelect}>
                        {children}
                    </HorizontalStroke>
                )}
            </>
        );
    }
}
