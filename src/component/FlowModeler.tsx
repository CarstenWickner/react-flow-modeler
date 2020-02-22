import * as PropTypes from "prop-types";
import * as React from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

import { StepElement } from "./StepElement";
import { EditMenu } from "./EditMenu";
import { FlowElementWrapper } from "./FlowElementWrapper";
import { Gateway } from "./Gateway";
import { GridCell } from "./GridCell";
import { HorizontalStroke, getConnectionClassName } from "./HorizontalStroke";
import { buildRenderData } from "./renderDataUtils";
import { changeNextElement } from "../model/action/changeNextElement";
import {
    StepNode,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    DivergingGatewayNode,
    ElementType,
    EndNode,
    StartNode
} from "../types/ModelElement";
import { EditActionResult, DraggedLinkContext, SelectableElementType } from "../types/EditAction";
import { FlowModelerProps } from "../types/FlowModelerProps";
import { GridCellData } from "../types/GridCellData";

import "./FlowModeler.scss";

type Selector = {
    type: SelectableElementType;
    id?: string;
    branchIndex?: number;
};

interface FlowModelerState {
    selection: null | Selector;
}

const createSelector = (
    reference: { type: ElementType.StartNode } | StepNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode
): Selector => {
    if (reference.type === ElementType.StartNode) {
        return reference;
    }
    if (reference.type === ElementType.ConvergingGatewayNode) {
        return { type: reference.type, id: reference.followingElement.type === ElementType.EndNode ? null : reference.followingElement.id };
    }
    if (reference.type === ElementType.DivergingGatewayBranch) {
        return {
            type: reference.type,
            id: reference.precedingElement.id,
            branchIndex: reference.branchIndex
        };
    }
    return { type: reference.type, id: reference.id };
};

export class FlowModeler extends React.Component<FlowModelerProps, FlowModelerState> {
    state: FlowModelerState = { selection: null };

    isTargetSelected(
        reference: { type: ElementType.StartNode } | StepNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode | null
    ): boolean {
        if (this.state.selection === null) {
            return reference === null;
        }
        if (reference === null) {
            return false;
        }
        const selector = createSelector(reference);
        return (
            this.state.selection.type === selector.type &&
            this.state.selection.id === selector.id &&
            this.state.selection.branchIndex === selector.branchIndex
        );
    }

    onSelect = (
        reference: { type: ElementType.StartNode } | StepNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode | null
    ): void => {
        const { onChange } = this.props;
        if (onChange && !this.isTargetSelected(reference)) {
            this.setState({
                selection: reference === null ? null : createSelector(reference)
            });
        }
    };

    onClickStart = (event: React.MouseEvent): void => {
        this.onSelect({ type: ElementType.StartNode });
        event.stopPropagation();
    };

    clearSelection = (event: React.MouseEvent): void => {
        this.onSelect(null);
        event.stopPropagation();
    };

    handleOnOutsideClick = (): void => {
        if (this.state.selection !== null) {
            this.onSelect(null);
        }
    };

    handleOnChange = (change: (originalFlow: FlowModelerProps["flow"]) => EditActionResult): void => {
        const { flow, onChange } = this.props;
        const { changedFlow } = change(flow);
        this.onSelect(null);
        onChange({ changedFlow });
    };

    renderEditMenu = (
        reference: StartNode | StepNode | DivergingGatewayNode | DivergingGatewayBranch | ConvergingGatewayNode
    ): undefined | (() => React.ReactNode) => {
        if (!this.isTargetSelected(reference)) {
            return undefined;
        }
        const { editActions } = this.props;
        return (): React.ReactNode => <EditMenu referenceElement={reference} editActions={editActions} onChange={this.handleOnChange} />;
    };

    handleOnLinkDrop = (
        dropTarget: StepNode | DivergingGatewayNode | ConvergingGatewayNode | EndNode,
        dragContext: DraggedLinkContext,
        dryRun?: boolean
    ): EditActionResult | undefined => {
        const { originElement } = dragContext;
        const change = (originalFlow: FlowModelerProps["flow"]): EditActionResult => changeNextElement(originalFlow, dropTarget, originElement);
        if (dryRun) {
            const { flow } = this.props;
            // perform change without calling onChange, i.e. without triggering re-render
            return change(flow);
        }
        this.handleOnChange(change);
        // onChange is expected to provide the changed flow as prop update, i.e. no need to return anything here
        return undefined;
    };

    renderFlowElement(cellData: GridCellData, editable: boolean): React.ReactNode {
        const onLinkDrop = editable ? this.handleOnLinkDrop : undefined;
        switch (cellData.type) {
            case ElementType.StartNode:
                const startEditMenu = editable && this.renderEditMenu(cellData);
                return (
                    <>
                        <div className={`flow-element start-element${startEditMenu ? " selected" : ""}`} onClick={this.onClickStart} />
                        {startEditMenu && startEditMenu()}
                    </>
                );
            case ElementType.StepNode:
                const { renderStep } = this.props;
                return (
                    <StepElement
                        referenceElement={cellData}
                        editMenu={editable ? this.renderEditMenu(cellData) : undefined}
                        onLinkDrop={onLinkDrop}
                        onSelect={this.onSelect}
                    >
                        {renderStep(cellData)}
                    </StepElement>
                );
            case ElementType.DivergingGatewayNode:
                const { renderGatewayConditionType } = this.props;
                return (
                    <Gateway
                        gateway={cellData}
                        editMenu={editable ? this.renderEditMenu(cellData) : undefined}
                        onLinkDrop={onLinkDrop}
                        onSelect={this.onSelect}
                    >
                        {renderGatewayConditionType && renderGatewayConditionType(cellData)}
                    </Gateway>
                );
            case ElementType.ConvergingGatewayNode:
                return (
                    <Gateway
                        gateway={cellData}
                        editMenu={editable ? this.renderEditMenu(cellData) : undefined}
                        onLinkDrop={onLinkDrop}
                        onSelect={this.onSelect}
                    />
                );
            case ElementType.DivergingGatewayBranch:
                const { renderGatewayConditionValue } = this.props;
                return (
                    <HorizontalStroke
                        referenceElement={cellData}
                        editMenu={editable ? this.renderEditMenu(cellData) : undefined}
                        onSelect={this.onSelect}
                    >
                        {renderGatewayConditionValue && renderGatewayConditionValue(cellData)}
                    </HorizontalStroke>
                );
            case ElementType.ConvergingGatewayBranch:
                return (
                    <>
                        <div className="stroke-horizontal" />
                        <div className={`stroke-vertical ${getConnectionClassName(cellData)}`} />
                    </>
                );
            case ElementType.EndNode:
                return <FlowElementWrapper referenceElement={cellData} elementTypeClassName="end-element" onLinkDrop={onLinkDrop} />;
        }
    }

    renderGridCell = (editable: boolean): ((cellData: GridCellData) => React.ReactNode) => {
        const { options } = this.props;
        const verticalAlign = options ? options.verticalAlign : undefined;
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
                    {this.renderFlowElement(cellData, editable)}
                </GridCell>
            );
        };
    };

    render(): React.ReactElement {
        const { flow, options, onChange } = this.props;
        const { gridCellData, columnCount } = buildRenderData(flow, options && options.verticalAlign === "bottom" ? "bottom" : "top");
        return (
            <OutsideClickHandler onOutsideClick={this.handleOnOutsideClick}>
                <DndProvider backend={Backend}>
                    <div
                        className={`flow-modeler${onChange ? " editable" : ""}`}
                        onClick={onChange ? this.clearSelection : undefined}
                        style={{ gridTemplateColumns: `repeat(${columnCount}, max-content)` }}
                    >
                        {gridCellData.map(this.renderGridCell(!!onChange))}
                    </div>
                </DndProvider>
            </OutsideClickHandler>
        );
    }

    static propTypes = {
        flow: PropTypes.shape({
            firstElementId: PropTypes.string,
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
        renderStep: PropTypes.func.isRequired,
        renderGatewayConditionType: PropTypes.func,
        renderGatewayConditionValue: PropTypes.func,
        onChange: PropTypes.func,
        editActions: PropTypes.shape({
            addDivergingBranch: PropTypes.shape({
                className: PropTypes.string,
                title: PropTypes.string,
                isActionAllowed: PropTypes.func,
                getBranchConditionData: PropTypes.func
            }),
            addFollowingStepElement: PropTypes.shape({
                className: PropTypes.string,
                title: PropTypes.string,
                isActionAllowed: PropTypes.func,
                getStepData: PropTypes.func
            }),
            addFollowingDivergingGateway: PropTypes.shape({
                className: PropTypes.string,
                title: PropTypes.string,
                isActionAllowed: PropTypes.func,
                getGatewayData: PropTypes.func,
                getBranchConditionData: PropTypes.func
            }),
            changeNextElement: PropTypes.shape({
                className: PropTypes.string,
                title: PropTypes.string,
                isActionAllowed: PropTypes.func
            }),
            removeElement: PropTypes.shape({
                className: PropTypes.string,
                title: PropTypes.string,
                isActionAllowed: PropTypes.func
            })
        })
    };
}
