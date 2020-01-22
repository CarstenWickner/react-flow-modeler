import * as PropTypes from "prop-types";
import * as React from "react";

import { ContentElement } from "./ContentElement";
import { Gateway } from "./Gateway";
import { HorizontalStroke } from "./HorizontalStroke";
import { EditMenu } from "./EditMenu";
import { GridCell } from "./GridCell";
import { buildRenderData } from "./renderDataUtils";
import { GridCellData, ElementType } from "../types/GridCellData";
import { FlowModelerProps } from "../types/FlowModelerProps";

import "./FlowModeler.scss";

type SelectableElementType =
    | ElementType.Start
    | ElementType.Content
    | ElementType.GatewayDiverging
    | ElementType.GatewayConverging
    | ElementType.ConnectGatewayToElement;

interface FlowModelerState {
    selectedType: SelectableElementType;
    selectedId?: string;
}

export class FlowModeler extends React.Component<FlowModelerProps, FlowModelerState> {
    state: FlowModelerState = { selectedType: null, selectedId: null };

    isTargetSelected(type: SelectableElementType, id?: string): boolean {
        return this.state.selectedType === type && this.state.selectedId === id;
    }

    onSelect = (selectedType: SelectableElementType, selectedId?: string): void => {
        const { options } = this.props;
        if ((!options || !options.readOnly) && !this.isTargetSelected(selectedType, selectedId)) {
            this.setState({
                selectedType,
                selectedId
            });
        }
    };

    onClickStart = (event: React.MouseEvent): void => {
        this.onSelect(ElementType.Start);
        event.stopPropagation();
    };

    onSelectContent = (elementId: string): void => this.onSelect(ElementType.Content, elementId);

    onSelectGatewayDiverging = (gatewayId: string): void => this.onSelect(ElementType.GatewayDiverging, gatewayId);

    onSelectGatewayConverging = (followingElementId?: string): void => this.onSelect(ElementType.GatewayConverging, followingElementId);

    onSelectConnectGatewayToElement = (followingElementId?: string): void => this.onSelect(ElementType.ConnectGatewayToElement, followingElementId);

    clearSelection = (event: React.MouseEvent): void => {
        this.onSelect(ElementType.Content, null);
        event.stopPropagation();
    };

    renderEditMenu = (targetType: SelectableElementType, referenceElementId?: string): React.ReactNode | undefined => {
        if (!this.isTargetSelected(targetType, referenceElementId)) {
            return undefined;
        }
        const { options } = this.props;
        const menuOptions = options ? options.editActions : undefined;
        return <EditMenu targetType={targetType} referenceElementId={referenceElementId} menuOptions={menuOptions} />;
    };

    renderFlowElement(cellData: GridCellData): React.ReactNode {
        switch (cellData.type) {
            case ElementType.Start:
                const startEditMenu = this.renderEditMenu(cellData.type);
                return (
                    <>
                        <div className={`flow-element start-element${startEditMenu ? " selected" : ""}`} onClick={this.onClickStart} />
                        {startEditMenu}
                    </>
                );
            case ElementType.Content:
                const { renderContent } = this.props;
                const contentEditMenu = this.renderEditMenu(cellData.type, cellData.elementId);
                return (
                    <ContentElement elementId={cellData.elementId} editMenu={contentEditMenu} onSelect={this.onSelectContent}>
                        {renderContent({
                            elementData: cellData.data,
                            contentElementId: cellData.elementId
                        })}
                    </ContentElement>
                );
            case ElementType.GatewayDiverging:
                const { renderGatewayConditionType } = this.props;
                const divergingGatewayEditMenu = this.renderEditMenu(cellData.type, cellData.gatewayId);
                return (
                    <Gateway
                        type={cellData.type}
                        gatewayId={cellData.gatewayId}
                        editMenu={divergingGatewayEditMenu}
                        onSelect={this.onSelectGatewayDiverging}
                    >
                        {renderGatewayConditionType &&
                            renderGatewayConditionType({
                                gatewayData: cellData.data,
                                gatewayElementId: cellData.gatewayId
                            })}
                    </Gateway>
                );
            case ElementType.GatewayConverging:
                const convergingGatewayEditMenu = this.renderEditMenu(cellData.type, cellData.followingElementId);
                return (
                    <Gateway
                        type={cellData.type}
                        followingElementId={cellData.followingElementId}
                        editMenu={convergingGatewayEditMenu}
                        onSelect={this.onSelectGatewayConverging}
                    />
                );
            case ElementType.ConnectGatewayToElement:
                const { renderGatewayConditionValue } = this.props;
                const branchElementId = cellData.elementId;
                const connectorEditMenu = this.renderEditMenu(cellData.type, branchElementId);
                return (
                    <HorizontalStroke
                        incomingConnection={cellData.connectionType}
                        followingElementId={branchElementId}
                        editMenu={connectorEditMenu}
                        onSelect={this.onSelectConnectGatewayToElement}
                    >
                        {renderGatewayConditionValue &&
                            renderGatewayConditionValue({
                                conditionData: cellData.data,
                                gatewayElementId: cellData.gatewayId,
                                branchElementId
                            })}
                    </HorizontalStroke>
                );
            case ElementType.ConnectElementToGateway:
                return <HorizontalStroke outgoingConnection={cellData.connectionType} />;
            case ElementType.StrokeExtension:
                return <div className="stroke-horizontal optional" />;
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
        const { flow, options } = this.props;
        const verticalModelAlign = options && options.verticalAlign === "bottom" ? "bottom" : "top";
        const { gridCellData, columnCount } = buildRenderData(flow, verticalModelAlign);
        return (
            <div className="flow-modeler" onClick={this.clearSelection} style={{ gridTemplateColumns: `repeat(${columnCount}, max-content)` }}>
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
            readOnly: PropTypes.bool
        }),
        renderContent: PropTypes.func.isRequired,
        renderGatewayConditionType: PropTypes.func,
        renderGatewayConditionValue: PropTypes.func
    };
}
