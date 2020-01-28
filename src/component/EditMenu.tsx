import * as React from "react";

import { FlowElementReference } from "../model/FlowElement";
import { ElementType } from "../types/GridCellData";
import { FlowModelerProps, MenuOptions } from "../types/FlowModelerProps";
import { addContentElement } from "../model/action/addContentElement";

const onClickStopPropagation = (event: React.MouseEvent): void => event.stopPropagation();

export class EditMenu extends React.Component<{
    targetType:
        | ElementType.Start
        | ElementType.Content
        | ElementType.GatewayDiverging
        | ElementType.GatewayConverging
        | ElementType.ConnectGatewayToElement;
    referenceElement?: FlowElementReference;
    branchIndex?: number;
    menuOptions?: FlowModelerProps["options"]["editActions"];
    onChange?: (change: (originalFlow: FlowModelerProps["flow"]) => FlowModelerProps["flow"]) => void;
}> {
    renderMenuItem(options: MenuOptions, defaultClassName: string, onClick: (event: React.MouseEvent) => void): React.ReactNode {
        const { targetType, referenceElement, branchIndex } = this.props;
        if (options && options.isActionAllowed && !options.isActionAllowed(targetType, referenceElement, branchIndex)) {
            return null;
        }
        return (
            <span title={options && options.title} className={(options && options.className) || `menu-item ${defaultClassName}`} onClick={onClick} />
        );
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

    onAddDivergingBranchClick = (): void => {
        const { targetType, onChange, referenceElement } = this.props;
        if (targetType === ElementType.GatewayDiverging) {
            // TODO call model change method
            onChange(() => (referenceElement ? null : null));
        }
    };

    renderAddDivergingBranchItem(): React.ReactNode {
        const { targetType, menuOptions } = this.props;
        if (targetType !== ElementType.GatewayDiverging) {
            return null;
        }
        return this.renderMenuItem(menuOptions ? menuOptions.addDivergingBranch : undefined, "add-branch", this.onAddDivergingBranchClick);
    }

    onAddDivergingGatewayClick = (): void => {
        const { targetType, onChange, referenceElement } = this.props;
        if (targetType !== ElementType.GatewayDiverging) {
            // TODO call model change method
            onChange(() => (referenceElement ? null : null));
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

    onChangeNextElementClick = (): void => {
        const { targetType, onChange, referenceElement } = this.props;
        if (targetType !== ElementType.GatewayDiverging && targetType !== ElementType.GatewayConverging) {
            // TODO call model change method
            onChange(() => (referenceElement ? null : null));
        }
    };

    renderChangeNextElementItem(): React.ReactNode {
        const { targetType, menuOptions } = this.props;
        if (targetType === ElementType.GatewayDiverging || targetType === ElementType.GatewayConverging) {
            return null;
        }
        return this.renderMenuItem(menuOptions ? menuOptions.changeNextElement : undefined, "change-next", this.onChangeNextElementClick);
    }

    onRemoveClick = (): void => {
        const { targetType, onChange, referenceElement } = this.props;
        if (targetType !== ElementType.Start && targetType !== ElementType.GatewayConverging) {
            // TODO call model change method
            onChange(() => (referenceElement ? null : null));
        }
    };

    renderRemoveItem(): React.ReactNode {
        const { targetType, menuOptions } = this.props;
        if (targetType === ElementType.Start || targetType === ElementType.GatewayConverging) {
            return null;
        }
        return this.renderMenuItem(menuOptions ? menuOptions.removeElement : undefined, "remove", this.onRemoveClick);
    }

    render(): React.ReactNode {
        const { onChange } = this.props;
        if (!onChange) {
            return null;
        }
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
