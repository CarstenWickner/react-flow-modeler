import * as React from "react";
import { shallow } from "enzyme";

import { ContentElement } from "../../src/component/ContentElement";

describe("renders correctly", () => {
    const onSelect = (): void => {};
    it("with minimal props", () => {
        const component = shallow(
            <ContentElement elementId="element-id" editMenu={<div className="edit-menu-placeholder" />} onSelect={onSelect}>
                {"text"}
            </ContentElement>
        );
        expect(component).toMatchSnapshot();
    });
    it("when not selected", () => {
        const component = shallow(
            <ContentElement elementId="element-id" editMenu={undefined} onSelect={onSelect}>
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
        const component = shallow(
            <ContentElement elementId={"element-id"} editMenu={undefined} onSelect={onSelect}>
                {"text"}
            </ContentElement>
        );
        component.find(".content-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toEqual("element-id");
    });
});
