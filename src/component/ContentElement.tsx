import * as React from "react";

import { FlowElementWrapper } from "./FlowElementWrapper";
import { HorizontalStroke } from "./HorizontalStroke";
import { FlowElementReference } from "../model/FlowElement";

import { onLinkDropCallback } from "../types/EditAction";

export class ContentElement extends React.Component<{
    referenceElement: FlowElementReference;
    editMenu: (() => React.ReactNode) | undefined;
    onLinkDrop: onLinkDropCallback | undefined;
    onSelect: (elementId: string) => void;
}> {
    onClick = (event: React.MouseEvent): void => {
        const { referenceElement, onSelect } = this.props;
        onSelect(referenceElement.getId());
        event.stopPropagation();
    };

    render(): React.ReactNode {
        const { referenceElement, editMenu, onLinkDrop: onDrop, children } = this.props;
        return (
            <>
                <FlowElementWrapper
                    elementTypeClassName="content-element"
                    referenceElement={referenceElement}
                    editMenu={editMenu}
                    onLinkDrop={onDrop}
                    onClick={this.onClick}
                >
                    {children}
                </FlowElementWrapper>
                <HorizontalStroke optional />
            </>
        );
    }
}
