import * as React from "react";
import { useDrop } from "react-dnd";

import { isFlowValid } from "../model/pathValidationUtils";

import { ContentNode, ConvergingGatewayNode, DivergingGatewayNode, ElementType, EndNode, ModelElementExclStart } from "../types/ModelElement";
import { DraggableType, DraggedLinkContext, onLinkDropCallback } from "../types/EditAction";

const isTargetAncestorOfDragItem = (
    originElement: ModelElementExclStart,
    referenceElement: ContentNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode
): boolean => {
    if (originElement === referenceElement) {
        return true;
    }
    if (originElement.type === ElementType.ConvergingGatewayNode) {
        return originElement.precedingBranches.some((branch) => isTargetAncestorOfDragItem(branch, referenceElement));
    }
    return (
        originElement.precedingElement.type !== ElementType.StartNode && isTargetAncestorOfDragItem(originElement.precedingElement, referenceElement)
    );
};

const isDropValid = (referenceElement: ContentNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode, onDrop: onLinkDropCallback) => (
    dragContext: DraggedLinkContext
): boolean =>
    !isTargetAncestorOfDragItem(dragContext.originElement, referenceElement) &&
    dragContext.originElement.followingElement !== referenceElement &&
    isFlowValid(onDrop(referenceElement, dragContext, true).changedFlow);

const disabledDropping: [{ isOver: boolean; canDrop: false }, React.LegacyRef<HTMLDivElement>] = [{ isOver: false, canDrop: false }, undefined];

export const FlowElementWrapper: React.FC<{
    elementTypeClassName: string;
    referenceElement: ContentNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode;
    editMenu?: (() => React.ReactNode) | undefined;
    onLinkDrop?: onLinkDropCallback | undefined;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ elementTypeClassName, referenceElement, editMenu, onLinkDrop, onClick, children }) => {
    const [{ isOver, canDrop }, drop] = onLinkDrop
        ? useDrop({
              accept: DraggableType.LINK,
              canDrop: isDropValid(referenceElement, onLinkDrop),
              drop: (dragContext: DraggedLinkContext) => onLinkDrop(referenceElement, dragContext),
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
