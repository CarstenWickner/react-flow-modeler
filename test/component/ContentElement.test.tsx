import * as React from "react";
import { mount, shallow } from "enzyme";

import { ContentElement } from "../../src/component/ContentElement";
import { ContentNode, ElementType } from "../../src/types/ModelElement";

const mockFlowElementReference = (id: string): ContentNode => ({
    type: ElementType.ContentNode,
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
            <ContentElement
                referenceElement={mockFlowElementReference("element-id")}
                editMenu={(): React.ReactNode => <div className="edit-menu-placeholder" />}
                onLinkDrop={undefined}
                onSelect={onSelect}
            >
                {"text"}
            </ContentElement>
        );
        expect(component).toMatchSnapshot();
    });
    it("when not selected", () => {
        const component = mount(
            <ContentElement referenceElement={mockFlowElementReference("element-id")} editMenu={undefined} onLinkDrop={undefined} onSelect={onSelect}>
                {"text"}
            </ContentElement>
        );
        const contentElement = component.find(".content-element");
        expect(contentElement.hasClass("selected")).toBe(false);
        expect(component.find(".edit-menu-placeholder").exists()).toBe(false);
    });
});
describe("calls onSelect", () => {
    const onSelect = jest.fn(() => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("on click event", () => {
        const contentNode = mockFlowElementReference("element-id");
        const component = mount(
            <ContentElement referenceElement={contentNode} editMenu={undefined} onLinkDrop={undefined} onSelect={onSelect}>
                {"text"}
            </ContentElement>
        );
        component.find(".content-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toBe(contentNode);
    });
});
