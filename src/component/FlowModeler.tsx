import * as PropTypes from "prop-types";
import * as React from "react";

import { ContentElement } from "./ContentElement";
import { Gateway } from "./Gateway";
import { HorizontalStroke } from "./HorizontalStroke";
import { GridCell } from "./GridCell";
import { buildRenderData } from "./renderDataUtils";
import { GridCellData, ElementType } from "../types/GridCellData";
import { FlowModelerProps } from "../types/FlowModelerProps";

import "./FlowModeler.scss";

export class FlowModeler extends React.Component<FlowModelerProps> {
    renderFlowElement(cellData: GridCellData): React.ReactNode {
        switch (cellData.type) {
            case ElementType.Start:
                return <div className="flow-element start-element" />;
            case ElementType.Content:
                const { renderContent } = this.props;
                return (
                    <ContentElement>
                        {renderContent({
                            elementData: cellData.data,
                            contentElementId: cellData.elementId
                        })}
                    </ContentElement>
                );
            case ElementType.GatewayDiverging:
                const { renderGatewayConditionType } = this.props;
                return (
                    <Gateway type="diverging">
                        {renderGatewayConditionType &&
                            renderGatewayConditionType({
                                gatewayData: cellData.data,
                                gatewayElementId: cellData.gatewayId
                            })}
                    </Gateway>
                );
            case ElementType.GatewayConverging:
                return <Gateway type="converging" />;
            case ElementType.ConnectGatewayToElement:
                const { renderGatewayConditionValue } = this.props;
                return (
                    <HorizontalStroke incomingConnection={cellData.connectionType}>
                        {renderGatewayConditionValue &&
                            renderGatewayConditionValue({
                                conditionData: cellData.data,
                                branchElementId: cellData.elementId,
                                gatewayElementId: cellData.gatewayId
                            })}
                    </HorizontalStroke>
                );
            case ElementType.ConnectElementToGateway:
                return <HorizontalStroke outgoingConnection={cellData.connectionType} />;
            case ElementType.StrokeExtension:
                return <div className="stroke-horizontal" />;
            case ElementType.End:
                return (
                    <>
                        <div className="arrow" />
                        <div className="flow-element end-element" />
                    </>
                );
        }
    }

    renderGridCell = ((cellData: GridCellData): React.ReactNode => {
        const { options } = this.props;
        const verticalAlign = options && options.verticalAlign;
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
    }).bind(this);

    render(): React.ReactElement {
        const { flow, options } = this.props;
        const verticalModelAlign = options && options.verticalAlign === "bottom" ? "bottom" : "top";
        const { gridCellData, columnCount } = buildRenderData(flow, verticalModelAlign);
        return (
            <div className="flow-modeler" style={{ gridTemplateColumns: `repeat(${columnCount}, max-content)` }}>
                {gridCellData.map(this.renderGridCell)}
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
            verticalAlign: PropTypes.oneOf(["top", "middle", "bottom"])
        }),
        renderContent: PropTypes.func.isRequired,
        renderGatewayConditionType: PropTypes.func,
        renderGatewayConditionValue: PropTypes.func
    };
}
