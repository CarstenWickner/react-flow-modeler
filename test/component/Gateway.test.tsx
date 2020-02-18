import * as React from "react";
import { mount, shallow } from "enzyme";

import { Gateway } from "../../src/component/Gateway";
import { ConvergingGatewayNode, DivergingGatewayNode, ElementType } from "../../src/types/ModelElement";

const mockDivergingGateway = (id: string): DivergingGatewayNode => ({
    type: ElementType.DivergingGatewayNode,
    id,
    precedingElement: undefined,
    followingBranches: [],
    columnIndex: 2,
    rowCount: 2
});
const mockConvergingGateway = (): ConvergingGatewayNode => ({
    type: ElementType.ConvergingGatewayNode,
    precedingBranches: [],
    followingElement: undefined,
    columnIndex: 5,
    rowCount: 2
});

describe("renders correctly", () => {
    const onSelect = (): void => {};
    describe("as converging gateway", () => {
        it("with minimal props", () => {
            const component = shallow(
                <Gateway
                    gateway={mockConvergingGateway()}
                    editMenu={(): React.ReactNode => <div className="edit-menu-placeholder" />}
                    onLinkDrop={undefined}
                    onSelect={onSelect}
                />
            );
            expect(component).toMatchSnapshot();
        });
        it("when not selected", () => {
            const component = mount(<Gateway gateway={mockConvergingGateway()} editMenu={undefined} onLinkDrop={undefined} onSelect={onSelect} />);
            expect(component.find(".gateway-element").hasClass("selected")).toBe(false);
            expect(component.find(".edit-menu-placeholder").exists()).toBe(false);
        });
    });
    describe("as diverging gateway", () => {
        it("with minimal props", () => {
            const component = shallow(
                <Gateway
                    gateway={mockDivergingGateway("gateway-id")}
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
                    gateway={mockDivergingGateway("gateway-id")}
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
                <Gateway gateway={mockDivergingGateway("gateway-id")} editMenu={undefined} onLinkDrop={undefined} onSelect={onSelect}>
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
        const gatewayElement = mockDivergingGateway("gateway-id");
        const component = mount(
            <Gateway editMenu={undefined} gateway={gatewayElement} onLinkDrop={undefined} onSelect={onSelect}>
                {"text"}
            </Gateway>
        );
        component.find(".gateway-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toBe(gatewayElement);
    });
    it("on click event for converging gateway", () => {
        const gatewayElement = mockConvergingGateway();
        const component = mount(<Gateway editMenu={undefined} gateway={gatewayElement} onLinkDrop={undefined} onSelect={onSelect} />);
        component.find(".gateway-element").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toBe(gatewayElement);
    });
});
