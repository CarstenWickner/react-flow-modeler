import * as PropTypes from "prop-types";
import * as React from "react";

import { Start, ContentElement, Gateway, GatewayToElementConnector, ElementToGatewayConnector, StrokeExtension, End } from "./flow-element";
import { GridCell } from "./GridCell";
import { buildRenderData } from "./renderDataUtils";
import { GridCellData, ElementType } from "../types/GridCellData";
import { FlowModelerProps } from "../types/FlowModelerProps";

import "./FlowModeler.scss";

export class FlowModeler extends React.Component<FlowModelerProps> {
    renderFlowElement(cellData: GridCellData): React.ReactNode {
        switch (cellData.type) {
            case ElementType.Start:
                return <Start />;
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
            case ElementType.ConnectGatewayToElement:
                const { renderGatewayConditionValue } = this.props;
                return (
                    <GatewayToElementConnector connectionType={cellData.connectionType}>
                        {renderGatewayConditionValue &&
                            renderGatewayConditionValue({
                                conditionData: cellData.data,
                                branchElementId: cellData.elementId,
                                gatewayElementId: cellData.gatewayId
                            })}
                    </GatewayToElementConnector>
                );
            case ElementType.ConnectElementToGateway:
                return <ElementToGatewayConnector connectionType={cellData.connectionType} />;
            case ElementType.GatewayConverging:
                return <Gateway type="converging" />;
            case ElementType.StrokeExtension:
                return <StrokeExtension />;
            case ElementType.End:
                return <End />;
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
        const { flow } = this.props;
        const { gridCellData, columnCount } = buildRenderData(flow);
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
