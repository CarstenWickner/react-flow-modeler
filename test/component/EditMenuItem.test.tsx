import * as React from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-test-backend";
import { mount, shallow } from "enzyme";

import { EditMenuItem } from "../../src/component/EditMenuItem";
import { DraggableType } from "../../src/types/EditAction";
import { ElementType } from "../../src/model/ModelElement";
import { DraggedLinkContext } from "../../build/types/EditAction";

describe("renders correctly", () => {
    it("for clicking", () => {
        const onClick = (): void => {};
        const component = shallow(<EditMenuItem options={undefined} defaultClassName="for-clicking" onClick={onClick} />);
        const element = component.find(".menu-item.for-clicking");
        expect(element.exists()).toBe(true);
        expect(element.prop("title")).toBeUndefined();
        expect(element.prop("onClick")).toBe(onClick);
    });
    it("for dragging", () => {
        const dragItem: DraggedLinkContext = {
            type: DraggableType.LINK,
            originElement: {
                type: ElementType.Content,
                id: "id",
                precedingElement: undefined,
                followingElement: undefined
            }
        };
        const component = mount(
            <DndProvider backend={Backend}>
                <EditMenuItem options={undefined} defaultClassName="for-dragging" dragItem={dragItem} />
            </DndProvider>
        );
        const element = component.find(".menu-item.for-dragging");
        expect(element.exists()).toBe(true);
        expect(element.prop("title")).toBeUndefined();
        expect(element.prop("onClick")).toBeUndefined();
    });
    it("considering given options", () => {
        const options = { className: "clickable", title: "Click me!" };
        const onClick = (): void => {};
        const component = shallow(<EditMenuItem options={options} defaultClassName="for-clicking" onClick={onClick} />);
        const element = component.find(".clickable");
        expect(element.exists()).toBe(true);
        expect(element.hasClass("menu-item")).toBe(false);
        expect(element.hasClass("for-clicking")).toBe(false);
        expect(element.prop("title")).toEqual("Click me!");
        expect(element.prop("onClick")).toBe(onClick);
    });
});
it("not rendered without dragging or clicking enabled", () => {
    const wrapper = shallow(<EditMenuItem options={undefined} defaultClassName="something" />);
    expect(wrapper).toEqual({});
});
