import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

import { ElementType } from "../types/GridCellData";

export class ContentElement extends React.Component<{
    elementId: string;
    selected: boolean;
    onSelect: (elementId: string) => void;
}> {
    onClick = (event: React.MouseEvent): void => {
        const { onSelect, elementId } = this.props;
        onSelect(elementId);
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { selected, children } = this.props;
        return (
            <>
                <div className="stroke-horizontal arrow" />
                <div className={`flow-element content-element${selected ? " selected" : ""}`} onClick={this.onClick}>
                    {children}
                </div>
                <HorizontalStroke optional />
            </>
        );
    }
}
