import * as React from "react";

import { ConnectionType } from "../types/GridCellData";
import { DivergingGatewayNode, DivergingGatewayBranch, ConvergingGatewayBranch, ElementType } from "../model/ModelElement";

export const getConnectionClassName = ({ connectionType }: { connectionType: ConnectionType }): string => {
    switch (connectionType) {
        case ConnectionType.First:
            return "bottom-half";
        case ConnectionType.Middle:
            return "full-height";
        case ConnectionType.Last:
            return "top-half";
    }
};

export class HorizontalStroke extends React.Component<
    | {
          referenceElement: { connectionType: ConnectionType } & ConvergingGatewayBranch;
          onSelect?: never;
          editMenu?: never;
      }
    | {
          referenceElement: DivergingGatewayNode | ({ connectionType: ConnectionType } & DivergingGatewayBranch);
          onSelect: (element: DivergingGatewayNode | DivergingGatewayBranch) => void;
          editMenu: (() => React.ReactNode) | undefined;
      },
    { wrapperTopHeight: number }
> {
    readonly topLabelRef = React.createRef<HTMLDivElement>();
    state = { wrapperTopHeight: 0 };

    componentDidMount(): void {
        // trigger consideration of element height already after initial rendering
        this.componentDidUpdate();
    }

    componentDidUpdate(): void {
        if (this.topLabelRef.current && this.state.wrapperTopHeight !== this.topLabelRef.current.clientHeight) {
            // setting to state mostly to re-trigger rendering (the value could also be accessed directly during render())
            this.setState({ wrapperTopHeight: this.topLabelRef.current.clientHeight });
        }
    }

    onTopLabelClick = (event: React.MouseEvent): void => {
        const { onSelect, referenceElement } = this.props;
        onSelect((referenceElement as unknown) as DivergingGatewayNode | DivergingGatewayBranch);
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { referenceElement, editMenu, children } = this.props;
        return (
            <>
                {referenceElement && referenceElement.type === ElementType.ConnectGatewayToElement && (
                    <div className={`stroke-vertical ${getConnectionClassName(referenceElement)}`} />
                )}
                <div className={`stroke-horizontal${editMenu ? " selected" : ""}`}>
                    {referenceElement.type !== ElementType.ConnectElementToGateway && (
                        <>
                            <div className="top-label" onClick={this.onTopLabelClick}>
                                {children && <div ref={this.topLabelRef}>{children}</div>}
                            </div>
                            <div
                                className="bottom-spacing"
                                style={(children && this.topLabelRef.current && { minHeight: `${this.state.wrapperTopHeight}px` }) || undefined}
                            />
                        </>
                    )}
                </div>
                {editMenu && editMenu()}
                {referenceElement && referenceElement.type === ElementType.ConnectElementToGateway && (
                    <div className={`stroke-vertical ${getConnectionClassName(referenceElement)}`} />
                )}
            </>
        );
    }
}
