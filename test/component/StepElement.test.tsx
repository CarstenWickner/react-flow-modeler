import * as React from "react";
import { mount, shallow } from "enzyme";

import { StepElement } from "../../src/component/StepElement";
import { StepNode, ElementType } from "../../src/types/ModelElement";

const mockFlowElementReference = (id: string): StepNode => ({
    type: ElementType.StepNode,
    id,
    precedingElement: undefined,
    followingElement: undefined,
    columnIndex: 2,
    rowCount: 1
});

describe("renders correctly", () => {
    const onSelect = (): void => {};
    it("with minimal props", () => {
        const component = shallow(
            <StepElement
                referenceElement={mockFlowElementReference("element-id")}
                editMenu={(): React.ReactNode => <div className="edit-menu-placeholder" />}
                onLinkDrop={undefined}
                onSelect={onSelect}
            >
                {"text"}
            </StepElement>
        );
        expect(component).toMatchSnapshot();
    });
    it("when not selected", () => {
        const component = mount(
            <StepElement referenceElement={mockFlowElementReference("element-id")} editMenu={undefined} onLinkDrop={undefined} onSelect={onSelect}>
                {"text"}
            </StepElement>
        );
        const stepElement = component.find(".step-element");
        expect(stepElement.hasClass("selected")).toBe(false);
        expect(component.find(".edit-menu-placeholder").exists()).toBe(false);
    });
});
describe("calls onSelect", () => {
    const onSelect = jest.fn(() => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("on click event", () => {
        const stepNode = mockFlowElementReference("element-id");
        const component = mount(
            <StepElement referenceElement={stepNode} editMenu={undefined} onLinkDrop={undefined} onSelect={onSelect}>
                {"text"}
            </StepElement>
        );
        component.find(".step-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toBe(stepNode);
    });
});
