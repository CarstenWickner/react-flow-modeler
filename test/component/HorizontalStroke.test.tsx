import * as React from "react";
import { mount } from "enzyme";

import { HorizontalStroke } from "../../src/component/HorizontalStroke";
import { ConnectionType } from "../../src/types/GridCellData";
import { ElementType, ConvergingGatewayBranch, DivergingGatewayBranch } from "../../src/types/ModelElement";

const mockDivergingBranch = (connectionType: ConnectionType): DivergingGatewayBranch & { connectionType: ConnectionType } => ({
    type: ElementType.DivergingGatewayBranch,
    precedingElement: undefined,
    followingElement: undefined,
    connectionType,
    columnIndex: 3,
    rowCount: 1
});
const mockConvergingBranch = (connectionType: ConnectionType): ConvergingGatewayBranch & { connectionType: ConnectionType } => ({
    type: ElementType.ConvergingGatewayBranch,
    precedingElement: undefined,
    followingElement: undefined,
    connectionType,
    columnIndex: 4,
    rowCount: 1
});
describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = mount(
            <HorizontalStroke referenceElement={mockDivergingBranch(ConnectionType.First)} editMenu={undefined} onSelect={(): void => {}}>
                label
            </HorizontalStroke>
        );
        expect(component).toMatchSnapshot();
    });
    describe.each`
        incomingConnection       | verticalStrokeClassName
        ${ConnectionType.First}  | ${"bottom-half"}
        ${ConnectionType.Middle} | ${"full-height"}
        ${ConnectionType.Last}   | ${"top-half"}
    `("for incomingConnection = $incomingConnection", ({ incomingConnection, verticalStrokeClassName }) => {
        it.each`
            testDescription | label
            ${"with"}       | ${"text"}
            ${"without"}    | ${null}
        `("$testDescription label", ({ label }) => {
            const component = mount(
                <HorizontalStroke referenceElement={mockDivergingBranch(incomingConnection)} editMenu={undefined} onSelect={(): void => {}}>
                    {label}
                </HorizontalStroke>
            );
            expect(component.find(`.stroke-vertical.${verticalStrokeClassName}`).exists()).toBe(true);
        });
    });
    it.skip("considers height of children", () => {
        const component = mount(
            <HorizontalStroke referenceElement={mockDivergingBranch(ConnectionType.Middle)} editMenu={undefined} onSelect={(): void => {}}>
                <span style={{ height: "50px" }}>big label</span>
            </HorizontalStroke>
        );
        expect(component.find(".bottom-spacing").prop("style").minHeight).toEqual("50px");
        component.setProps({ children: <span style={{ height: "30px" }}>small label</span> });
        expect(component.find(".bottom-spacing").prop("style").minHeight).toEqual("30px");
    });
    it.each`
        outgoingConnection       | verticalStrokeClassName
        ${ConnectionType.First}  | ${"bottom-half"}
        ${ConnectionType.Middle} | ${"full-height"}
        ${ConnectionType.Last}   | ${"top-half"}
    `("for incomingConnection = $incomingConnection", ({ outgoingConnection, verticalStrokeClassName }) => {
        const component = mount(<HorizontalStroke referenceElement={mockConvergingBranch(outgoingConnection)} />);
        expect(component.find(`.stroke-vertical.${verticalStrokeClassName}`).exists()).toBe(true);
    });
    it.each`
        testDescription   | includingMenu | editMenu
        ${"an edit menu"} | ${true}       | ${(): React.ReactNode => <div className="edit-menu-placeholder" />}
        ${"no edit menu"} | ${false}      | ${(): React.ReactNode => null}
    `("marks selected stroke via css class when there is $testDescription", ({ includingMenu, editMenu }) => {
        const component = mount(
            <HorizontalStroke referenceElement={mockDivergingBranch(ConnectionType.First)} editMenu={editMenu} onSelect={(): void => {}} />
        );
        expect(component.find(".stroke-horizontal.selected").exists()).toBe(true);
        expect(component.find(".edit-menu-placeholder").exists()).toBe(includingMenu);
    });
});
describe("calls onSelect", () => {
    const onSelect = jest.fn(() => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("on click event when representing connection from gateway to one of its branches", () => {
        const branchElement = mockDivergingBranch(ConnectionType.First);
        const component = mount(
            <HorizontalStroke editMenu={undefined} referenceElement={branchElement} onSelect={onSelect}>
                {"text"}
            </HorizontalStroke>
        );
        component.find(".top-label").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toBe(branchElement);
    });
});
