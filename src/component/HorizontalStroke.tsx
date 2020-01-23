import * as React from "react";

import { ConnectionType } from "../types/GridCellData";

const getConnectionClassName = (connectionType: ConnectionType): string => {
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
          incomingConnection?: ConnectionType;
          gatewayId: string;
          branchIndex?: number;
          editMenu: (() => React.ReactNode) | undefined;
          onSelect: (gatewayId: string, branchIndex?: number) => void;
          outgoingConnection?: never;
          optional?: never;
      }
    | {
          incomingConnection?: never;
          gatewayId?: never;
          branchIndex?: never;
          editMenu?: never;
          onSelect?: never;
          outgoingConnection?: ConnectionType;
          optional?: boolean;
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
        const { onSelect, gatewayId, branchIndex } = this.props;
        onSelect(gatewayId, branchIndex);
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { incomingConnection, outgoingConnection, optional, editMenu, children } = this.props;
        return (
            <>
                {incomingConnection && <div className={`stroke-vertical ${getConnectionClassName(incomingConnection)}`} />}
                <div className={`stroke-horizontal${editMenu ? " selected" : ""}${optional ? " optional" : ""}`}>
                    {!optional && !outgoingConnection && (
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
                {outgoingConnection && <div className={`stroke-vertical ${getConnectionClassName(outgoingConnection)}`} />}
            </>
        );
    }
}
