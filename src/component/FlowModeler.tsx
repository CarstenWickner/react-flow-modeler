import * as PropTypes from "prop-types";
import * as React from "react";

import { Start, ContentElement, Gateway, GatewayToElementConnector, ElementToGatewayConnector, StrokeExtension, End } from "./flow-element";
import { GridCell } from "./GridCell";
import { buildRenderData } from "./renderDataUtils";
import { GridCellData } from "../types/GridCellData";
import { FlowModelerProps } from "../types/FlowModelerProps";

import "./FlowModeler.scss";

export class FlowModeler extends React.Component<FlowModelerProps> {
    renderFlowElement(cellData: GridCellData): React.ReactChild {
        switch (cellData.type) {
            case "start":
                return <Start />;
            case "content":
                const { renderContent } = this.props;
                return <ContentElement>{renderContent(cellData.data, cellData.elementId)}</ContentElement>;
            case "gateway-diverging":
                const { renderGatewayConditionType } = this.props;
                return <Gateway>{renderGatewayConditionType && renderGatewayConditionType(cellData.data, cellData.gatewayId)}</Gateway>;
            case "gateway-to-element":
                const { renderGatewayConditionValue } = this.props;
                return (
                    <GatewayToElementConnector connectionType={cellData.connectionType}>
                        {renderGatewayConditionValue && renderGatewayConditionValue(cellData.data, cellData.elementId, cellData.gatewayId)}
                    </GatewayToElementConnector>
                );
            case "element-to-gateway":
                return <ElementToGatewayConnector connectionType={cellData.connectionType} />;
            case "gateway-converging":
                return <Gateway />;
            case "stroke-extension":
                return <StrokeExtension />;
            case "end":
                return <End />;
        }
    }

    renderGridCell = ((cellData: GridCellData): React.ReactChild => {
        const { colStartIndex, rowStartIndex, rowEndIndex } = cellData;
        return (
            <GridCell colStartIndex={colStartIndex} rowStartIndex={rowStartIndex} rowEndIndex={rowEndIndex} key={`${colStartIndex}-${rowStartIndex}`}>
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
        renderContent: PropTypes.func.isRequired,
        renderGatewayConditionType: PropTypes.func,
        renderGatewayConditionValue: PropTypes.func
    };
}
