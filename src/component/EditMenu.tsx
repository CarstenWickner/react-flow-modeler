import * as React from "react";

import { ElementType } from "../types/GridCellData";
import { FlowModelerProps, MenuOptions } from "../types/FlowModelerProps";

export class EditMenu extends React.Component<{
    targetType:
        | ElementType.Start
        | ElementType.Content
        | ElementType.GatewayDiverging
        | ElementType.GatewayConverging
        | ElementType.ConnectGatewayToElement;
    referenceElementId: string;
    menuOptions?: FlowModelerProps["options"]["editActions"];
}> {
    onClick = (event: React.MouseEvent): void => event.stopPropagation();

    renderMenuItem = (options: MenuOptions, defaultClassName: string): React.ReactNode => {
        const { targetType, referenceElementId } = this.props;
        return (
            (!options || !options.isActionAllowed || options.isActionAllowed(targetType, referenceElementId)) && (
                <span title={options && options.title} className={(options && options.className) || defaultClassName} />
            )
        );
    };

    render(): React.ReactNode {
        const { targetType, menuOptions } = this.props;
        const { addDivergingBranch, addFollowingContentElement, addFollowingDivergingGateway, changeNextElement, removeElement } = menuOptions || {};
        return (
            <div className="menu" onClick={this.onClick}>
                {targetType === ElementType.GatewayDiverging && this.renderMenuItem(addDivergingBranch, "menu-item add-branch")}
                {targetType !== ElementType.GatewayDiverging && this.renderMenuItem(addFollowingContentElement, "menu-item add-content")}
                {targetType !== ElementType.GatewayDiverging && this.renderMenuItem(addFollowingDivergingGateway, "menu-item add-gateway")}
                {targetType !== ElementType.GatewayDiverging &&
                    targetType !== ElementType.GatewayConverging &&
                    this.renderMenuItem(changeNextElement, "menu-item change-next")}
                {targetType !== ElementType.Start &&
                    targetType !== ElementType.GatewayConverging &&
                    this.renderMenuItem(removeElement, "menu-item remove")}
            </div>
        );
    }
}
