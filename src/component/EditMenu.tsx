import * as React from "react";

import { EditMenuItem } from "./EditMenuItem";
import { ContentNode, ConvergingGatewayNode, DivergingGatewayNode, DivergingGatewayBranch, ElementType, StartNode } from "../model/ModelElement";
import { addContentElement, addDivergingGateway } from "../model/action/addElement";
import { addBranch } from "../model/action/addBranch";
import { isChangeNextElementAllowed } from "../model/action/changeNextElement";
import { removeElement, isRemoveElementAllowed } from "../model/action/removeElement";

import { EditActionResult, DraggableType, DraggedLinkContext } from "../types/EditAction";
import { FlowModelerProps } from "../types/FlowModelerProps";

const onClickStopPropagation = (event: React.MouseEvent): void => event.stopPropagation();

export class EditMenu extends React.Component<{
    referenceElement: StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayNode | DivergingGatewayBranch;
    menuOptions?: FlowModelerProps["options"]["editActions"];
    onChange: (change: (originalFlow: FlowModelerProps["flow"]) => EditActionResult) => void;
}> {
    renderMenuItem(
        options:
            | {
                  className?: string;
                  title?: string;
              }
            | undefined,
        defaultClassName: string,
        onClick?: (event: React.MouseEvent) => void,
        dragType?: DraggableType
    ): React.ReactNode {
        const { referenceElement } = this.props;
        const dragItem: DraggedLinkContext =
            dragType === DraggableType.LINK &&
            (referenceElement.type === ElementType.Content || referenceElement.type === ElementType.ConnectGatewayToElement) &&
            isChangeNextElementAllowed(referenceElement)
                ? { type: dragType, originElement: referenceElement }
                : undefined;
        return <EditMenuItem key={defaultClassName} options={options} defaultClassName={defaultClassName} onClick={onClick} dragItem={dragItem} />;
    }

    onAddContentElementClick = (): void => {
        const { onChange, referenceElement, menuOptions } = this.props;
        const leadingElement = (referenceElement as unknown) as StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch;
        const options = menuOptions && menuOptions.addFollowingContentElement;
        const contentData = (options && options.getContentData && options.getContentData(leadingElement)) || {};
        onChange((originalFlow) => addContentElement(originalFlow, leadingElement, contentData));
    };

    renderAddContentElementItem(): React.ReactNode {
        const { referenceElement, menuOptions } = this.props;
        if (referenceElement.type === ElementType.GatewayDiverging) {
            return null;
        }
        const options = menuOptions ? menuOptions.addFollowingContentElement : undefined;
        if (options && options.isActionAllowed && !options.isActionAllowed(referenceElement)) {
            return null;
        }
        return this.renderMenuItem(options, "add-content", this.onAddContentElementClick);
    }

    onAddDivergingGatewayClick = (): void => {
        const { referenceElement, onChange, menuOptions } = this.props;
        const leadingElement = (referenceElement as unknown) as StartNode | ContentNode | ConvergingGatewayNode | DivergingGatewayBranch;
        const options = menuOptions && menuOptions.addFollowingDivergingGateway;
        const gatewayData = (options && options.getGatewayData && options.getGatewayData(leadingElement)) || undefined;
        const branchConditionData = (options && options.getBranchConditionData && options.getBranchConditionData(leadingElement)) || undefined;
        onChange((originalFlow) => addDivergingGateway(originalFlow, leadingElement, gatewayData, branchConditionData));
    };

    renderAddDivergingGatewayItem(): React.ReactNode {
        const { referenceElement, menuOptions } = this.props;
        if (referenceElement && referenceElement.type === ElementType.GatewayDiverging) {
            return null;
        }
        const options = menuOptions ? menuOptions.addFollowingDivergingGateway : undefined;
        if (
            options &&
            options.isActionAllowed &&
            !options.isActionAllowed((referenceElement as unknown) as undefined | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode)
        ) {
            return null;
        }
        return this.renderMenuItem(options, "add-gateway", this.onAddDivergingGatewayClick);
    }

    onAddDivergingBranchClick = (): void => {
        const { referenceElement, onChange, menuOptions } = this.props;
        const gateway = (referenceElement as unknown) as DivergingGatewayNode;
        const options = menuOptions && menuOptions.addDivergingBranch;
        const branchConditionData = (options && options.getBranchConditionData && options.getBranchConditionData(gateway)) || undefined;
        onChange((originalFlow) => addBranch(originalFlow, gateway, branchConditionData));
    };

    renderAddDivergingBranchItem(): React.ReactNode {
        const { referenceElement, menuOptions } = this.props;
        if (referenceElement.type !== ElementType.GatewayDiverging) {
            return null;
        }
        const options = menuOptions ? menuOptions.addDivergingBranch : undefined;
        if (options && options.isActionAllowed && !options.isActionAllowed(referenceElement)) {
            return null;
        }
        return this.renderMenuItem(options, "add-branch", this.onAddDivergingBranchClick);
    }

    renderChangeNextElementItem(): React.ReactNode {
        const { referenceElement, menuOptions } = this.props;
        if (
            (referenceElement.type !== ElementType.Content && referenceElement.type !== ElementType.ConnectGatewayToElement) ||
            !isChangeNextElementAllowed(referenceElement)
        ) {
            return null;
        }
        const options = menuOptions ? menuOptions.changeNextElement : undefined;
        if (options && options.isActionAllowed && !options.isActionAllowed(referenceElement)) {
            return null;
        }
        return this.renderMenuItem(options, "change-next", undefined, DraggableType.LINK);
    }

    onRemoveClick = (): void => {
        const { referenceElement, onChange } = this.props;
        onChange((originalFlow) => removeElement(originalFlow, (referenceElement as unknown) as ContentNode | DivergingGatewayBranch));
    };

    renderRemoveItem(): React.ReactNode {
        const { referenceElement, menuOptions } = this.props;
        if (
            (referenceElement.type !== ElementType.Content && referenceElement.type !== ElementType.ConnectGatewayToElement) ||
            !isRemoveElementAllowed(referenceElement)
        ) {
            return null;
        }
        const options = menuOptions ? menuOptions.removeElement : undefined;
        if (options && options.isActionAllowed && !options.isActionAllowed(referenceElement)) {
            return null;
        }
        return this.renderMenuItem(menuOptions ? menuOptions.removeElement : undefined, "remove", this.onRemoveClick);
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
