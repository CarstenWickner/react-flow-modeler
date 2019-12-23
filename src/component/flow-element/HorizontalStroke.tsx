import * as React from "react";

const getConnectionClassName = (connectionType: "first" | "middle" | "last"): string => {
    switch (connectionType) {
        case "first":
            return "bottom-half";
        case "middle":
            return "full-height";
        case "last":
            return "top-half";
    }
};

export class HorizontalStroke extends React.Component<
    | { incomingConnection: "single" | "first" | "middle" | "last"; outgoingConnection: "single"; children?: React.ReactChild }
    | { incomingConnection: "single"; outgoingConnection: "first" | "middle" | "last" },
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
        const { incomingConnection, outgoingConnection, children } = this.props;
        return (
            <>
                {incomingConnection !== "single" && <div className={`stroke-vertical ${getConnectionClassName(incomingConnection)}`} />}
                {!children && <div className="stroke-horizontal" />}
                {children && (
                    <div className="centered-line-wrapper">
                        <div className="wrapper-top-label" ref={this.topLabelRef}>
                            {children}
                        </div>
                        <div className="stroke-horizontal" />
                        <div
                            className="wrapper-bottom-spacing"
                            style={(this.topLabelRef.current && { height: `${this.state.wrapperTopHeight}px` }) || undefined}
                        />
                    </div>
                )}
                {outgoingConnection !== "single" && <div className={`stroke-vertical ${getConnectionClassName(outgoingConnection)}`} />}
            </>
        );
    }

    static defaultProps = {
        incomingConnection: "single",
        outgoingConnection: "single"
    };
}
