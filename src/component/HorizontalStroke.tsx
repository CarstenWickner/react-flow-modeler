import * as React from "react";

import { ConnectionType, ElementType } from "../types/GridCellData";

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
    | ({
          outgoingConnection?: never;
          optional?: never;
          selected: boolean;
          onSelect: (followingElementId?: string) => void;
      } & (
          | { incomingConnection?: ConnectionType; followingElementId?: string; gatewayId?: never }
          | { incomingConnection?: never; followingElementId?: never; gatewayId: string }
      ))
    | ({ incomingConnection?: never; followingElementId?: never; selected?: never; onSelect?: never } & (
          | { outgoingConnection?: never; optional?: boolean }
          | { outgoingConnection: ConnectionType; optional?: never }
      )),
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
        const { onSelect, followingElementId } = this.props;
        console.log(`selecting connector to: ${followingElementId}`);
        onSelect(followingElementId);
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { incomingConnection, outgoingConnection, optional, selected, children } = this.props;
        return (
            <>
                {incomingConnection && <div className={`stroke-vertical ${getConnectionClassName(incomingConnection)}`} />}
                <div className={`stroke-horizontal${selected ? " selected" : ""}${optional ? " optional" : ""}`}>
                    {children && (
                        <>
                            <div className="top-label" onClick={this.onTopLabelClick}>
                                <div ref={this.topLabelRef} onClick={this.onTopLabelClick}>
                                    {children}
                                </div>
                            </div>
                            <div
                                className="bottom-spacing"
                                style={(this.topLabelRef.current && { minHeight: `${this.state.wrapperTopHeight}px` }) || undefined}
                            />
                        </>
                    )}
                </div>
                {outgoingConnection && <div className={`stroke-vertical ${getConnectionClassName(outgoingConnection)}`} />}
            </>
        );
    }
}
