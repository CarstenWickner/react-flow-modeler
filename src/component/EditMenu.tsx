import * as React from "react";

import { EditMenuItem } from "./EditMenuItem";
import { FlowElementReference } from "../model/FlowElement";
import { addContentElement, addDivergingGateway } from "../model/action/addElement";
import { addBranch } from "../model/action/addBranch";
import { isChangeNextElementAllowed } from "../model/action/changeNextElement";
import { removeElement, isRemoveElementAllowed } from "../model/action/removeElement";

import { SelectableElementType, EditActionResult, DraggableType } from "../types/EditAction";
import { FlowModelerProps, MenuOptions } from "../types/FlowModelerProps";
import { ElementType } from "../types/GridCellData";

const onClickStopPropagation = (event: React.MouseEvent): void => event.stopPropagation();

export class EditMenu extends React.Component<{
    targetType: SelectableElementType;
    referenceElement?: FlowElementReference;
    branchIndex?: number;
    menuOptions?: FlowModelerProps["options"]["editActions"];
    onChange: (change: (originalFlow: FlowModelerProps["flow"]) => EditActionResult) => void;
}> {
    isNextElementReferencedByOthers = (): boolean => {
        const { referenceElement, branchIndex } = this.props;
        if (!referenceElement) {
            return false;
        }
        return referenceElement.getFollowingElements()[branchIndex || 0].getPrecedingElements().length > 1;
    };

    renderMenuItem(
        options: MenuOptions,
        defaultClassName: string,
        onClick?: (event: React.MouseEvent) => void,
        dragType?: DraggableType
    ): React.ReactNode {
        const { targetType, referenceElement, branchIndex } = this.props;
        if (options && options.isActionAllowed && !options.isActionAllowed(targetType, referenceElement, branchIndex)) {
            return null;
        }
        const dragItem =
            dragType === DraggableType.LINK &&
            (targetType === ElementType.Content || targetType == ElementType.ConnectGatewayToElement) &&
            this.isNextElementReferencedByOthers()
                ? { type: dragType, originType: targetType, originElement: referenceElement, originBranchIndex: branchIndex }
                : undefined;
        return <EditMenuItem key={defaultClassName} options={options} defaultClassName={defaultClassName} onClick={onClick} dragItem={dragItem} />;
    }

    onAddContentElementClick = (): void => {
        const { targetType, onChange, referenceElement, branchIndex } = this.props;
        if (targetType !== ElementType.GatewayDiverging) {
            onChange((originalFlow) => addContentElement(originalFlow, targetType, {}, referenceElement, branchIndex));
        }
    };

    renderAddContentElementItem(): React.ReactNode {
        const { targetType, menuOptions } = this.props;
        if (targetType === ElementType.GatewayDiverging) {
            return null;
        }
        return this.renderMenuItem(menuOptions ? menuOptions.addFollowingContentElement : undefined, "add-content", this.onAddContentElementClick);
    }

    onAddDivergingGatewayClick = (): void => {
        const { targetType, onChange, referenceElement, branchIndex } = this.props;
        if (targetType !== ElementType.GatewayDiverging) {
            onChange((originalFlow) => addDivergingGateway(originalFlow, targetType, {}, referenceElement, branchIndex));
        }
    };

    renderAddDivergingGatewayItem(): React.ReactNode {
        const { targetType, menuOptions } = this.props;
        if (targetType === ElementType.GatewayDiverging) {
            return null;
        }
        return this.renderMenuItem(
            menuOptions ? menuOptions.addFollowingDivergingGateway : undefined,
            "add-gateway",
            this.onAddDivergingGatewayClick
        );
    }

    onAddDivergingBranchClick = (): void => {
        const { targetType, onChange, referenceElement } = this.props;
        if (targetType === ElementType.GatewayDiverging) {
            onChange((originalFlow) => addBranch(originalFlow, {}, referenceElement));
        }
    };

    renderAddDivergingBranchItem(): React.ReactNode {
        const { targetType, menuOptions } = this.props;
        if (targetType !== ElementType.GatewayDiverging) {
            return null;
        }
        return this.renderMenuItem(menuOptions ? menuOptions.addDivergingBranch : undefined, "add-branch", this.onAddDivergingBranchClick);
    }

    renderChangeNextElementItem(): React.ReactNode {
        const { targetType, referenceElement, branchIndex, menuOptions } = this.props;
        if (isChangeNextElementAllowed(targetType, referenceElement, branchIndex)) {
            return this.renderMenuItem(menuOptions ? menuOptions.changeNextElement : undefined, "change-next", undefined, DraggableType.LINK);
        }
        return null;
    }

    onRemoveClick = (): void => {
        const { targetType, onChange, referenceElement, branchIndex } = this.props;
        if (targetType === ElementType.Content || targetType === ElementType.ConnectGatewayToElement) {
            onChange((originalFlow) => removeElement(originalFlow, targetType, referenceElement, branchIndex));
        }
    };

    renderRemoveItem(): React.ReactNode {
        const { targetType, referenceElement, branchIndex, menuOptions } = this.props;
        if (isRemoveElementAllowed(targetType, referenceElement, branchIndex)) {
            return this.renderMenuItem(menuOptions ? menuOptions.removeElement : undefined, "remove", this.onRemoveClick);
        }
        return null;
    }

    render(): React.ReactNode {
        const menuItems = [
            this.renderAddContentElementItem(),
            this.renderAddDivergingGatewayItem(),
            this.renderAddDivergingBranchItem(),
            this.renderChangeNextElementItem(),
            this.renderRemoveItem()
        ];
        if (menuItems.some((item) => item)) {
            return (
                <div className="menu" onClick={onClickStopPropagation}>
                    {menuItems}
                </div>
            );
        }
        return null;
    }
}
