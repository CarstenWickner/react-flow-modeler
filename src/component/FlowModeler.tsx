import * as PropTypes from "prop-types";
import * as React from "react";

import { ContentElement } from "./ContentElement";
import { Gateway } from "./Gateway";
import { HorizontalStroke } from "./HorizontalStroke";
import { EditMenu } from "./EditMenu";
import { GridCell } from "./GridCell";
import { buildRenderData } from "./renderDataUtils";
import { FlowElementReference } from "../model/FlowElement";
import { GridCellData, ElementType } from "../types/GridCellData";
import { FlowModelerProps } from "../types/FlowModelerProps";

import "./FlowModeler.scss";

const menuOptionsPropType = PropTypes.shape({
    className: PropTypes.string,
    title: PropTypes.string,
    isActionAllowed: PropTypes.func
});

type SelectableElementType =
    | ElementType.Start
    | ElementType.Content
    | ElementType.GatewayDiverging
    | ElementType.GatewayConverging
    | ElementType.ConnectGatewayToElement;

interface FlowModelerState {
    selection: null | { type: SelectableElementType; id?: string; branchIndex?: number };
}

export class FlowModeler extends React.Component<FlowModelerProps, FlowModelerState> {
    state: FlowModelerState = { selection: null };

    isTargetSelected(type: SelectableElementType, id?: string, branchIndex?: number): boolean {
        return (
            this.state.selection !== null &&
            this.state.selection.type === type &&
            this.state.selection.id === id &&
            this.state.selection.branchIndex == branchIndex
        );
    }

    onSelect = (type: SelectableElementType | null, id?: string, branchIndex?: number): void => {
        const { onChange } = this.props;
        if (onChange && !this.isTargetSelected(type, id, branchIndex)) {
            this.setState({
                selection: type === null ? null : { type, id, branchIndex }
            });
        }
    };

    onClickStart = (event: React.MouseEvent): void => {
        this.onSelect(ElementType.Start);
        event.stopPropagation();
    };

    onSelectContent = (elementId: string): void => this.onSelect(ElementType.Content, elementId);

    onSelectGatewayDiverging = (gatewayId: string): void => this.onSelect(ElementType.GatewayDiverging, gatewayId);

    onSelectGatewayConverging = (followingElementId: string | null): void => this.onSelect(ElementType.GatewayConverging, followingElementId);

    onSelectConnectGatewayToElement = (gatewayId: string, branchIndex: number): void =>
        this.onSelect(ElementType.ConnectGatewayToElement, gatewayId, branchIndex);

    clearSelection = (event: React.MouseEvent): void => {
        this.onSelect(null);
        event.stopPropagation();
    };

    handleOnChange = (change: (originalFlow: FlowModelerProps["flow"]) => FlowModelerProps["flow"]): void => {
        const { flow, onChange } = this.props;
        onChange({ changedFlow: change(flow) });
    };

    renderEditMenu = (
        targetType: SelectableElementType,
        reference?: FlowElementReference,
        branchIndex?: number
    ): undefined | (() => React.ReactNode) => {
        if (!this.isTargetSelected(targetType, reference ? reference.getId() : undefined, branchIndex)) {
            return undefined;
        }
        const { options } = this.props;
        const menuOptions = options ? options.editActions : undefined;
        return (): React.ReactNode => (
            <EditMenu
                targetType={targetType}
                referenceElement={reference}
                branchIndex={branchIndex}
                menuOptions={menuOptions}
                onChange={this.handleOnChange}
            />
        );
    };

    renderFlowElement(cellData: GridCellData): React.ReactNode {
        switch (cellData.type) {
            case ElementType.Start:
                const startEditMenu = this.renderEditMenu(cellData.type);
                return (
                    <>
                        <div className={`flow-element start-element${startEditMenu ? " selected" : ""}`} onClick={this.onClickStart} />
                        {startEditMenu && startEditMenu()}
                    </>
                );
            case ElementType.Content:
                const { renderContent } = this.props;
                const contentEditMenu = this.renderEditMenu(cellData.type, cellData.element);
                const contentElementId = cellData.element.getId();
                return (
                    <ContentElement elementId={contentElementId} editMenu={contentEditMenu} onSelect={this.onSelectContent}>
                        {renderContent({
                            elementData: cellData.data,
                            contentElementId
                        })}
                    </ContentElement>
                );
            case ElementType.GatewayDiverging:
                const { renderGatewayConditionType } = this.props;
                const divergingGatewayEditMenu = this.renderEditMenu(cellData.type, cellData.gateway);
                return (
                    <Gateway
                        type={cellData.type}
                        gatewayId={cellData.gateway.getId()}
                        editMenu={divergingGatewayEditMenu}
                        onSelect={this.onSelectGatewayDiverging}
                    >
                        {renderGatewayConditionType &&
                            renderGatewayConditionType({
                                gatewayData: cellData.data,
                                gatewayElementId: cellData.gateway.getId()
                            })}
                    </Gateway>
                );
            case ElementType.GatewayConverging:
                const convergingGatewayEditMenu = this.renderEditMenu(cellData.type, cellData.followingElement);
                return (
                    <Gateway
                        type={cellData.type}
                        followingElementId={cellData.followingElement.getId()}
                        editMenu={convergingGatewayEditMenu}
                        onSelect={this.onSelectGatewayConverging}
                    />
                );
            case ElementType.ConnectGatewayToElement:
                const { renderGatewayConditionValue } = this.props;
                const leadingGateway = cellData.gateway;
                const branchIndex = cellData.branchIndex;
                const connectorEditMenu = this.renderEditMenu(cellData.type, leadingGateway, branchIndex);
                return (
                    <HorizontalStroke
                        incomingConnection={cellData.connectionType}
                        gatewayId={leadingGateway.getId()}
                        branchIndex={branchIndex}
                        editMenu={connectorEditMenu}
                        onSelect={this.onSelectConnectGatewayToElement}
                    >
                        {renderGatewayConditionValue &&
                            renderGatewayConditionValue({
                                conditionData: cellData.data,
                                gatewayElementId: leadingGateway.getId(),
                                branchElementId: leadingGateway.getFollowingElements()[branchIndex].getId()
                            })}
                    </HorizontalStroke>
                );
            case ElementType.ConnectElementToGateway:
                return <HorizontalStroke outgoingConnection={cellData.connectionType} />;
            case ElementType.StrokeExtension:
                return <HorizontalStroke optional />;
            case ElementType.End:
                return (
                    <>
                        <div className="stroke-horizontal arrow" />
                        <div className="flow-element end-element" />
                    </>
                );
        }
    }

    renderGridCell = (): ((cellData: GridCellData) => React.ReactNode) => {
        const { options } = this.props;
        const { verticalAlign } = options || {};
        return (cellData: GridCellData): React.ReactNode => {
            const { colStartIndex, colEndIndex, rowStartIndex, rowEndIndex } = cellData;
            return (
                <GridCell
                    colStartIndex={colStartIndex}
                    colEndIndex={colEndIndex}
                    rowStartIndex={verticalAlign === "bottom" && rowEndIndex ? rowEndIndex - 1 : rowStartIndex}
                    rowEndIndex={verticalAlign === "top" || verticalAlign === "bottom" ? undefined : rowEndIndex}
                    key={`${colStartIndex}-${rowStartIndex}`}
                >
                    {this.renderFlowElement(cellData)}
                </GridCell>
            );
        };
    };

    render(): React.ReactElement {
        const { flow, options, onChange } = this.props;
        const { gridCellData, columnCount } = buildRenderData(flow, options && options.verticalAlign === "bottom" ? "bottom" : "top");
        return (
            <div
                className={`flow-modeler${onChange ? " editable" : ""}`}
                onClick={onChange ? this.clearSelection : undefined}
                style={{ gridTemplateColumns: `repeat(${columnCount}, max-content)` }}
            >
                {gridCellData.map(this.renderGridCell())}
            </div>
        );
    }

    static propTypes = {
        flow: PropTypes.shape({
            firstElementId: PropTypes.string.isRequired,
            elements: PropTypes.objectOf(
                PropTypes.oneOfType([
                    PropTypes.shape({
                        data: PropTypes.object,
                        nextElementId: PropTypes.string
                    }),
                    PropTypes.shape({
                        data: PropTypes.object,
                        nextElements: PropTypes.arrayOf(
                            PropTypes.shape({
                                id: PropTypes.string.isRequired,
                                conditionData: PropTypes.object.isRequired
                            })
                        ).isRequired
                    })
                ])
            ).isRequired
        }).isRequired,
        options: PropTypes.shape({
            verticalAlign: PropTypes.oneOf(["top", "middle", "bottom"]),
            editActions: PropTypes.shape({
                addDivergingBranch: menuOptionsPropType,
                addFollowingContentElement: menuOptionsPropType,
                addFollowingDivergingGateway: menuOptionsPropType,
                changeNextElement: menuOptionsPropType,
                removeElement: menuOptionsPropType
            })
        }),
        renderContent: PropTypes.func.isRequired,
        renderGatewayConditionType: PropTypes.func,
        renderGatewayConditionValue: PropTypes.func,
        onChange: PropTypes.func
    };
}
