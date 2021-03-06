import * as React from "react";
import { DndProvider } from "react-dnd";
import { TestBackend } from "react-dnd-test-backend";
import { shallow, mount } from "enzyme";

import { EditMenu } from "../../src/component/EditMenu";
import { createMinimalElementTreeStructure } from "../../src/model/modelUtils";
import {
    StartNode,
    ElementType,
    ModelElement,
    StepNode,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    DivergingGatewayNode
} from "../../src/types/ModelElement";
import { FlowModelerProps } from "../../src/types/FlowModelerProps";
import { EditActionResult } from "../../src/types/EditAction";

import { step, divGw } from "../model/testUtils";

describe("renders correctly", () => {
    const { elementsInTree }: { elementsInTree: Array<ModelElement> } = createMinimalElementTreeStructure({
        firstElementId: "a",
        elements: { a: divGw("b", "c", null), b: step("c"), c: {} }
    });
    const onChange = (): void => {};
    it("for start element", () => {
        const component = shallow(
            <EditMenu referenceElement={elementsInTree.find((entry) => entry.type === ElementType.StartNode) as StartNode} onChange={onChange} />
        );
        expect(component).toMatchSnapshot();
    });
    it("for step element", () => {
        const component = shallow(
            <EditMenu
                referenceElement={elementsInTree.find((entry) => entry.type === ElementType.StepNode && entry.id === "b") as StepNode}
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
    it("for diverging gateway", () => {
        const component = shallow(
            <EditMenu
                referenceElement={
                    elementsInTree.find((entry) => entry.type === ElementType.DivergingGatewayNode && entry.id === "a") as DivergingGatewayNode
                }
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
    it("for converging gateway", () => {
        const component = shallow(
            <EditMenu
                referenceElement={
                    elementsInTree.find(
                        (entry) =>
                            entry.type === ElementType.ConvergingGatewayNode &&
                            entry.followingElement.type === ElementType.StepNode &&
                            entry.followingElement.id === "c"
                    ) as ConvergingGatewayNode
                }
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
    it("for diverging gateway branch", () => {
        const component = shallow(
            <EditMenu
                referenceElement={
                    elementsInTree.find(
                        (entry) => entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement.id === "a" && entry.branchIndex === 1
                    ) as DivergingGatewayBranch
                }
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
    it.each`
        action           | optionKey                         | isAllowed
        ${"add-step"}    | ${"addFollowingStepElement"}      | ${true}
        ${"add-step"}    | ${"addFollowingStepElement"}      | ${false}
        ${"add-gateway"} | ${"addFollowingDivergingGateway"} | ${true}
        ${"add-gateway"} | ${"addFollowingDivergingGateway"} | ${false}
        ${"change-next"} | ${"changeNextElement"}            | ${true}
        ${"change-next"} | ${"changeNextElement"}            | ${false}
        ${"remove"}      | ${"removeElement"}                | ${true}
        ${"remove"}      | ${"removeElement"}                | ${false}
    `("can conditionally show/hide $action action (showing: $isAllowed)", ({ action, optionKey, isAllowed }) => {
        const component = mount(
            <DndProvider backend={TestBackend}>
                <EditMenu
                    referenceElement={
                        elementsInTree.find(
                            (entry) =>
                                entry.type === ElementType.DivergingGatewayBranch && entry.precedingElement.id === "a" && entry.branchIndex === 1
                        ) as DivergingGatewayBranch
                    }
                    onChange={onChange}
                    editActions={{
                        [optionKey]: { isActionAllowed: (): boolean => isAllowed }
                    }}
                />
            </DndProvider>
        );
        expect(component.find(`.${action}`).exists()).toBe(isAllowed);
    });
    it("avoids empty menu if no items are allowed", () => {
        const component = shallow(
            <EditMenu
                referenceElement={
                    elementsInTree.find((entry) => entry.type === ElementType.DivergingGatewayNode && entry.id === "a") as DivergingGatewayNode
                }
                onChange={onChange}
                editActions={{ addDivergingBranch: { isActionAllowed: (): boolean => false } }}
            />
        );
        expect(component).toEqual({});
    });
});
describe("offers actions", () => {
    const originalFlow: FlowModelerProps["flow"] = {
        firstElementId: "a",
        elements: { a: divGw("b", "c", null), b: step("c"), c: {} }
    };
    const { elementsInTree } = createMinimalElementTreeStructure(originalFlow);
    const onChange = jest.fn((): void => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("adding following step element", () => {
        const component = mount(
            <EditMenu
                referenceElement={elementsInTree.find((entry) => entry.type === ElementType.StartNode) as StartNode}
                onChange={onChange}
                editActions={{
                    addFollowingStepElement: {
                        getStepData: (): { x: boolean } => ({ x: false })
                    }
                }}
            />
        );
        component.find(".add-step").prop("onClick")(event);
        expect(onChange.mock.calls).toHaveLength(1);
        expect(onChange.mock.calls[0]).toHaveLength(1);
        expect(onChange.mock.calls[0][0]).toBeDefined();

        const action = (onChange.mock.calls[0][0] as unknown) as (originalFlow: FlowModelerProps["flow"]) => EditActionResult;
        const actionResult = action(originalFlow);
        expect(actionResult.changedFlow.firstElementId).not.toBe("a");
        expect(actionResult.changedFlow.elements[actionResult.changedFlow.firstElementId]).toEqual({ nextElementId: "a", data: { x: false } });
    });
    it("adding following diverging gateway", () => {
        const component = mount(
            <EditMenu
                referenceElement={elementsInTree.find((entry) => entry.type === ElementType.StartNode) as StartNode}
                onChange={onChange}
                editActions={{
                    addFollowingDivergingGateway: {
                        getGatewayData: (): { x: boolean } => ({ x: true }),
                        getBranchConditionData: (): Array<{ y?: boolean; z?: boolean }> => [{ y: false }, { z: true }]
                    }
                }}
            />
        );
        component.find(".add-gateway").prop("onClick")(event);
        expect(onChange.mock.calls).toHaveLength(1);
        expect(onChange.mock.calls[0]).toHaveLength(1);
        expect(onChange.mock.calls[0][0]).toBeDefined();

        const action = (onChange.mock.calls[0][0] as unknown) as (originalFlow: FlowModelerProps["flow"]) => EditActionResult;
        const actionResult = action(originalFlow);
        expect(actionResult.changedFlow.firstElementId).not.toBe("a");
        expect(actionResult.changedFlow.elements[actionResult.changedFlow.firstElementId]).toEqual({
            data: { x: true },
            nextElements: [
                { id: "a", conditionData: { y: false } },
                { id: "a", conditionData: { z: true } }
            ]
        });
    });
    it("adding diverging branch", () => {
        const component = mount(
            <EditMenu
                referenceElement={
                    elementsInTree.find((entry) => entry.type === ElementType.DivergingGatewayNode && entry.id === "a") as DivergingGatewayNode
                }
                onChange={onChange}
                editActions={{
                    addDivergingBranch: {
                        getBranchConditionData: (): { x: boolean } => ({ x: true })
                    }
                }}
            />
        );
        component.find(".add-branch").prop("onClick")(event);
        expect(onChange.mock.calls).toHaveLength(1);
        expect(onChange.mock.calls[0]).toHaveLength(1);
        expect(onChange.mock.calls[0][0]).toBeDefined();

        const action = (onChange.mock.calls[0][0] as unknown) as (originalFlow: FlowModelerProps["flow"]) => EditActionResult;
        const actionResult = action(originalFlow);
        expect(actionResult.changedFlow.elements.a).toEqual({
            nextElements: [{ id: "b" }, { id: "c" }, { id: null }, { id: null, conditionData: { x: true } }]
        });
    });
    it("removing element", () => {
        const component = mount(
            <DndProvider backend={TestBackend}>
                <EditMenu
                    referenceElement={elementsInTree.find((entry) => entry.type === ElementType.StepNode && entry.id === "b") as StepNode}
                    onChange={onChange}
                />
            </DndProvider>
        );
        component.find(".remove").prop("onClick")(event);
        expect(onChange.mock.calls).toHaveLength(1);
        expect(onChange.mock.calls[0]).toHaveLength(1);
        expect(onChange.mock.calls[0][0]).toBeDefined();

        const action = (onChange.mock.calls[0][0] as unknown) as (originalFlow: FlowModelerProps["flow"]) => EditActionResult;
        const actionResult = action(originalFlow);
        expect(actionResult.changedFlow).toEqual({ firstElementId: "a", elements: { a: divGw("c", "c", null), c: {} } });
    });
});
