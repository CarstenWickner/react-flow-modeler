import * as React from "react";
import { shallow } from "enzyme";

import { Gateway } from "../../src/component/Gateway";
import { ElementType } from "../../src/types/GridCellData";

describe("renders correctly", () => {
    const onSelect = (): void => {};
    describe("as converging gateway", () => {
        it("with minimal props", () => {
            const component = shallow(
                <Gateway
                    type={ElementType.GatewayConverging}
                    followingElementId="following-element-id"
                    editMenu={<div className="edit-menu-placeholder" />}
                    onSelect={onSelect}
                />
            );
            expect(component).toMatchSnapshot();
        });
        it("when not selected", () => {
            const component = shallow(
                <Gateway type={ElementType.GatewayConverging} followingElementId="following-element-id" editMenu={undefined} onSelect={onSelect} />
            );
            const gatewayElement = component.find(".gateway-element");
            expect(gatewayElement.hasClass("selected")).toBe(false);
            const editMenu = gatewayElement.find(".edit-menu-placeholder");
            expect(editMenu.exists()).toBe(false);
        });
    });
    describe("as diverging gateway", () => {
        it("with minimal props", () => {
            const component = shallow(
                <Gateway
                    type={ElementType.GatewayDiverging}
                    gatewayId="gateway-id"
                    editMenu={<div className="edit-menu-placeholder" />}
                    onSelect={onSelect}
                >
                    {"text"}
                </Gateway>
            );
            expect(component).toMatchSnapshot();
        });
        it("when selected without children", () => {
            const component = shallow(
                <Gateway
                    type={ElementType.GatewayDiverging}
                    gatewayId="gateway-id"
                    editMenu={<div className="edit-menu-placeholder" />}
                    onSelect={onSelect}
                />
            );
            const gatewayElement = component.find(".gateway-element");
            expect(gatewayElement.hasClass("selected")).toBe(true);
            const editMenu = gatewayElement.find(".edit-menu-placeholder");
            expect(editMenu.exists()).toBe(true);
            expect(component.find("HorizontalStroke").prop("editMenu")).toBe(undefined);
        });
        it("when not selected", () => {
            const component = shallow(
                <Gateway type={ElementType.GatewayDiverging} gatewayId="gateway-id" editMenu={undefined} onSelect={onSelect}>
                    {"text"}
                </Gateway>
            );
            const gatewayElement = component.find(".gateway-element");
            expect(gatewayElement.hasClass("selected")).toBe(false);
            const editMenu = gatewayElement.find(".edit-menu-placeholder");
            expect(editMenu.exists()).toBe(false);
            expect(component.find("HorizontalStroke").prop("editMenu")).toBe(undefined);
        });
    });
});
describe("calls onSelect", () => {
    const onSelect = jest.fn(() => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("on click event for diverging gateway", () => {
        const component = shallow(
            <Gateway type={ElementType.GatewayDiverging} editMenu={undefined} gatewayId={"gateway-id"} onSelect={onSelect}>
                {"text"}
            </Gateway>
        );
        component.find(".gateway-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toEqual("gateway-id");
    });
    it("on click event for converging gateway", () => {
        const component = shallow(
            <Gateway type={ElementType.GatewayConverging} editMenu={undefined} followingElementId={"following-element-id"} onSelect={onSelect} />
        );
        component.find(".gateway-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toEqual("following-element-id");
    });
});
