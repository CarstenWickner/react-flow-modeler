import * as React from "react";

import { ConnectionType } from "../../types/GridCellData";

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
    { className?: string } & (
        | { incomingConnection: null | ConnectionType; outgoingConnection: null; children?: React.ReactChild }
        | { incomingConnection: null; outgoingConnection: ConnectionType }
    ),
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

    render(): React.ReactChild {
        const { className, incomingConnection, outgoingConnection, children } = this.props;
        const classNameSuffix = className ? ` ${className}` : "";
        return (
            <>
                {incomingConnection !== null && <div className={`stroke-vertical ${getConnectionClassName(incomingConnection)}${classNameSuffix}`} />}
                {!children && <div className={`stroke-horizontal${classNameSuffix}`} />}
                {children && (
                    <div className={`centered-line-wrapper${classNameSuffix}`}>
                        <div className="wrapper-top-label" ref={this.topLabelRef}>
                            {children}
                        </div>
                        <div className={`stroke-horizontal${classNameSuffix}`} />
                        <div
                            className="wrapper-bottom-spacing"
                            style={(this.topLabelRef.current && { height: `${this.state.wrapperTopHeight}px` }) || undefined}
                        />
                    </div>
                )}
                {outgoingConnection !== null && <div className={`stroke-vertical ${getConnectionClassName(outgoingConnection)}${classNameSuffix}`} />}
            </>
        );
    }

    static defaultProps: {
        incomingConnection: null;
        outgoingConnection: null;
    } = {
        incomingConnection: null,
        outgoingConnection: null
    };
}