import * as React from "react";

import { FlowElementWrapper } from "./FlowElementWrapper";

import { ContentNode } from "../types/ModelElement";
import { onLinkDropCallback } from "../types/EditAction";

export class ContentElement extends React.Component<{
    referenceElement: ContentNode;
    editMenu: (() => React.ReactNode) | undefined;
    onLinkDrop: onLinkDropCallback | undefined;
    onSelect: (element: ContentNode) => void;
}> {
    onClick = (event: React.MouseEvent): void => {
        const { onSelect, referenceElement } = this.props;
        onSelect(referenceElement);
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
                <div className="stroke-horizontal optional" />
            </>
        );
    }
}
