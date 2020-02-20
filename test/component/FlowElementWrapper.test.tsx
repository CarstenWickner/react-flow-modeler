import * as React from "react";
import { shallow } from "enzyme";

import { FlowElementWrapper } from "../../src/component/FlowElementWrapper";
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
            <FlowElementWrapper
                elementTypeClassName="some-element"
                referenceElement={mockFlowElementReference("element-id")}
                editMenu={(): React.ReactNode => <div className="edit-menu-placeholder" />}
                onLinkDrop={undefined}
                onSelect={onSelect}
            >
                {"text"}
            </FlowElementWrapper>
        );
        expect(component).toMatchSnapshot();
    });
    it("when not selected", () => {
        const component = shallow(
            <FlowElementWrapper
                elementTypeClassName="some-element"
                referenceElement={mockFlowElementReference("element-id")}
                editMenu={undefined}
                onLinkDrop={undefined}
                onSelect={onSelect}
            >
                {"text"}
            </FlowElementWrapper>
        );
        const stepElement = component.find(".some-element");
        expect(stepElement.hasClass("selected")).toBe(false);
        expect(component.find(".edit-menu-placeholder").exists()).toBe(false);
    });
});
