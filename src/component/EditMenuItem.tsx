import * as React from "react";
import { useDrag } from "react-dnd";

import { DraggedLinkContext } from "../types/EditAction";
import { MenuOptions } from "../types/FlowModelerProps";

const disabledDragging: [{ isDragging: boolean }, React.LegacyRef<HTMLSpanElement>] = [{ isDragging: false }, undefined];

export const EditMenuItem: React.FC<{
    options: MenuOptions;
    defaultClassName: string;
    onClick?: (event: React.MouseEvent) => void;
    dragItem?: DraggedLinkContext;
}> = ({ options, defaultClassName, onClick, dragItem }) => {
    if (!dragItem && !onClick) {
        return null;
    }
    const [{ isDragging }, drag] = dragItem
        ? useDrag({
              item: dragItem,
              collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
          })
        : disabledDragging;
    const baseClassName = (options && options.className) || `menu-item ${defaultClassName}`;
    return (
        <span
            key={defaultClassName}
            title={options && options.title}
            className={`${baseClassName}${isDragging ? " dragging" : ""}`}
            {...{ ref: drag, onClick }}
        />
    );
};
