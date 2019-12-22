import * as PropTypes from "prop-types";
import * as React from "react";

import { Start, ContentElement, Gateway, GatewayConnector, StrokeExtension, End } from "./flow-element";
import { GridCell } from "./GridCell";
import { buildRenderData } from "./renderDataUtils";
import { GridCellData } from "../types/GridCellData";
import { FlowModelerProps } from "../types/FlowModelerProps";

import "./FlowModeler.scss";

export class FlowModeler extends React.Component<FlowModelerProps> {
    renderFlowElement(cellData: GridCellData): React.ReactChild {
        switch (cellData.elementType) {
            case "start":
                return <Start />;
            case "content":
                const { renderContent } = this.props;
                return <ContentElement>{renderContent(cellData.elementData, cellData.elementId)}</ContentElement>;
            case "gateway":
                const { renderGatewayConditionType } = this.props;
                return <Gateway>{renderGatewayConditionType && renderGatewayConditionType(cellData.elementData, cellData.elementId)}</Gateway>;
            case "gateway-connector":
                const { renderGatewayConditionValue } = this.props;
                return (
                    <GatewayConnector incomingConnection={cellData.connectionType}>
                        {renderGatewayConditionValue && renderGatewayConditionValue(cellData.elementData, cellData.elementId)}
                    </GatewayConnector>
                );
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
            elements: PropTypes.arrayOf(
                PropTypes.oneOfType([
                    PropTypes.shape({
                        id: PropTypes.string.isRequired,
                        data: PropTypes.object,
                        nextElementId: PropTypes.string
                    }),
                    PropTypes.shape({
                        id: PropTypes.string.isRequired,
                        data: PropTypes.object,
                        nextElements: PropTypes.arrayOf(
                            PropTypes.shape({
                                id: PropTypes.string.isRequired,
                                conditionData: PropTypes.object.isRequired
                            })
                        ).isRequired
                    })
                ])
            ).isRequired,
            firstElementId: PropTypes.string.isRequired
        }).isRequired,
        renderContent: PropTypes.func.isRequired,
        renderGatewayConditionType: PropTypes.func,
        renderGatewayConditionValue: PropTypes.func
    };
}
