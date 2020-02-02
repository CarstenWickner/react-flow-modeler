import * as React from "react";
import { mount, shallow } from "enzyme";

import { Gateway } from "../../src/component/Gateway";
import { ElementType } from "../../src/types/GridCellData";
import { FlowElementReference } from "../../src/model/FlowElement";

const mockFlowElementReference = (id: string): FlowElementReference => ({
    getId: (): string => id,
    getPrecedingElements: (): Array<FlowElementReference> => [],
    getFollowingElements: (): Array<FlowElementReference> => []
});

describe("renders correctly", () => {
    const onSelect = (): void => {};
    describe("as converging gateway", () => {
        it("with minimal props", () => {
            const component = shallow(
                <Gateway
                    type={ElementType.GatewayConverging}
                    followingElement={mockFlowElementReference("following-element-id")}
                    editMenu={(): React.ReactNode => <div className="edit-menu-placeholder" />}
                    onLinkDrop={undefined}
                    onSelect={onSelect}
                />
            );
            expect(component).toMatchSnapshot();
        });
        it("when not selected", () => {
            const component = mount(
                <Gateway
                    type={ElementType.GatewayConverging}
                    followingElement={mockFlowElementReference("following-element-id")}
                    editMenu={undefined}
                    onLinkDrop={undefined}
                    onSelect={onSelect}
                />
            );
            expect(component.find(".gateway-element").hasClass("selected")).toBe(false);
            expect(component.find(".edit-menu-placeholder").exists()).toBe(false);
        });
    });
    describe("as diverging gateway", () => {
        it("with minimal props", () => {
            const component = shallow(
                <Gateway
                    type={ElementType.GatewayDiverging}
                    gateway={mockFlowElementReference("gateway-id")}
                    editMenu={(): React.ReactNode => <div className="edit-menu-placeholder" />}
                    onLinkDrop={undefined}
                    onSelect={onSelect}
                >
                    {"text"}
                </Gateway>
            );
            expect(component).toMatchSnapshot();
        });
        it("when selected without children", () => {
            const component = mount(
                <Gateway
                    type={ElementType.GatewayDiverging}
                    gateway={mockFlowElementReference("gateway-id")}
                    editMenu={(): React.ReactNode => <div className="edit-menu-placeholder" />}
                    onLinkDrop={undefined}
                    onSelect={onSelect}
                />
            );
            expect(component.find(".gateway-element").hasClass("selected")).toBe(true);
            expect(component.find(".edit-menu-placeholder").exists()).toBe(true);
            expect(component.find("HorizontalStroke").prop("editMenu")).toBe(undefined);
        });
        it("when not selected", () => {
            const component = mount(
                <Gateway
                    type={ElementType.GatewayDiverging}
                    gateway={mockFlowElementReference("gateway-id")}
                    editMenu={undefined}
                    onLinkDrop={undefined}
                    onSelect={onSelect}
                >
                    {"text"}
                </Gateway>
            );
            expect(component.find(".gateway-element").hasClass("selected")).toBe(false);
            expect(component.find(".edit-menu-placeholder").exists()).toBe(false);
            expect(component.find("HorizontalStroke").prop("editMenu")).toBe(undefined);
        });
    });
});
describe("calls onSelect", () => {
    const onSelect = jest.fn(() => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("on click event for diverging gateway", () => {
        const component = mount(
            <Gateway
                type={ElementType.GatewayDiverging}
                editMenu={undefined}
                gateway={mockFlowElementReference("gateway-id")}
                onLinkDrop={undefined}
                onSelect={onSelect}
            >
                {"text"}
            </Gateway>
        );
        component.find(".gateway-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toEqual("gateway-id");
    });
    it("on click event for converging gateway", () => {
        const component = mount(
            <Gateway
                type={ElementType.GatewayConverging}
                editMenu={undefined}
                followingElement={mockFlowElementReference("following-element-id")}
                onLinkDrop={undefined}
                onSelect={onSelect}
            />
        );
        component.find(".gateway-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toEqual("following-element-id");
    });
});
