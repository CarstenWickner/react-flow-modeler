import * as React from "react";
import { useDrop } from "react-dnd";

import { FlowElementReference } from "../model/FlowElement";
import { DraggableType, DraggedLinkContext, onLinkDropCallback } from "../types/EditAction";
import { isFlowValid } from "../model/pathValidationUtils";

const isTargetAncestorOfDragItem = (originElement?: FlowElementReference, referenceElement?: FlowElementReference): boolean => {
    if (!originElement || !referenceElement) {
        // reference cannot be ancestor of the start; and end reference cannot be ancestor of anything
        return false;
    }
    if (originElement === referenceElement) {
        return true;
    }
    return originElement.getPrecedingElements().some((preceding) => isTargetAncestorOfDragItem(preceding, referenceElement));
};

const isDropValid = (referenceElement: FlowElementReference, onDrop: onLinkDropCallback) => (dragContext: DraggedLinkContext): boolean => {
    if (isTargetAncestorOfDragItem(dragContext.originElement, referenceElement)) {
        return false;
    }
    const currentNextElement = dragContext.originElement.getFollowingElements()[0];
    if (currentNextElement === referenceElement || (!referenceElement && currentNextElement.getFollowingElements().length === 0)) {
        // linking to the current follower will not change anything
        return false;
    }
    return isFlowValid(onDrop(referenceElement, dragContext, true).changedFlow);
};

const disabledDropping: [{ isOver: boolean; canDrop: false }, React.LegacyRef<HTMLDivElement>] = [{ isOver: false, canDrop: false }, undefined];

export const FlowElementWrapper: React.FC<{
    elementTypeClassName: string;
    referenceElement?: FlowElementReference;
    editMenu?: (() => React.ReactNode) | undefined;
    onLinkDrop?: onLinkDropCallback | undefined;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ elementTypeClassName, referenceElement, editMenu, onLinkDrop: onDrop, onClick, children }) => {
    const [{ isOver, canDrop }, drop] = onDrop
        ? useDrop({
              accept: DraggableType.LINK,
              canDrop: isDropValid(referenceElement, onDrop),
              drop: (dragContext: DraggedLinkContext) => onDrop(referenceElement, dragContext),
              collect: (monitor) => ({
                  isOver: !!monitor.isOver(),
                  canDrop: !!monitor.canDrop()
              })
          })
        : disabledDropping;
    return (
        <>
            <div className={`stroke-horizontal arrow${isOver && canDrop ? " can-drop" : ""}`} />
            <div className={`flow-element-wrapper${isOver ? (canDrop ? " can-drop" : " cannot-drop") : ""}`} ref={drop}>
                <div className={`flow-element ${elementTypeClassName}${editMenu ? " selected" : ""}`} onClick={onClick}>
                    {children}
                </div>
                {editMenu && editMenu()}
            </div>
        </>
    );
};
