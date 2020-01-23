import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

export class ContentElement extends React.Component<{
    elementId: string;
    editMenu: (() => React.ReactNode) | undefined;
    onSelect: (elementId: string) => void;
}> {
    onClick = (event: React.MouseEvent): void => {
        const { onSelect, elementId } = this.props;
        onSelect(elementId);
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { editMenu, children } = this.props;
        return (
            <>
                <div className="stroke-horizontal arrow" />
                <div className="flow-element-wrapper">
                    <div className={`flow-element content-element${editMenu ? " selected" : ""}`} onClick={this.onClick}>
                        {children}
                    </div>
                    {editMenu && editMenu()}
                </div>
                <HorizontalStroke optional />
            </>
        );
    }
}
