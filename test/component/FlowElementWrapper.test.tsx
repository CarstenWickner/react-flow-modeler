import * as React from "react";
import { shallow } from "enzyme";

import { FlowElementWrapper } from "../../src/component/FlowElementWrapper";
import { FlowElementReference } from "../../src/model/FlowElement";

const mockFlowElementReference = (id: string): FlowElementReference => ({
    getId: (): string => id,
    getPrecedingElements: (): Array<FlowElementReference> => [],
    getFollowingElements: (): Array<FlowElementReference> => []
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
        const contentElement = component.find(".some-element");
        expect(contentElement.hasClass("selected")).toBe(false);
        expect(component.find(".edit-menu-placeholder").exists()).toBe(false);
    });
});