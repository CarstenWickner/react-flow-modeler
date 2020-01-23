import * as React from "react";
import { shallow, mount } from "enzyme";

import { HorizontalStroke } from "../../src/component/HorizontalStroke";
import { ConnectionType } from "../../src/types/GridCellData";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(<HorizontalStroke>label</HorizontalStroke>);
        expect(component).toMatchSnapshot();
    });
    it("for incomingConnection = single", () => {
        const component = mount(<HorizontalStroke>text</HorizontalStroke>);
        expect(component.find(".stroke-vertical").exists()).toBe(false);
        const renderedInstance = component.instance() as HorizontalStroke;
        expect(renderedInstance.state.wrapperTopHeight).toBe(0);

        jest.spyOn(renderedInstance.topLabelRef.current, "clientHeight", "get").mockImplementation(() => 30);
        renderedInstance.componentDidUpdate();
        expect(renderedInstance.render()).toMatchSnapshot();
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
            const component = shallow(
                <HorizontalStroke incomingConnection={incomingConnection} gatewayId="id" editMenu={undefined} onSelect={(): void => {}}>
                    {label}
                </HorizontalStroke>
            );
            expect(component.find(`.stroke-vertical.${verticalStrokeClassName}`).exists()).toBe(true);
        });
    });
    it.each`
        outgoingConnection       | verticalStrokeClassName
        ${ConnectionType.First}  | ${"bottom-half"}
        ${ConnectionType.Middle} | ${"full-height"}
        ${ConnectionType.Last}   | ${"top-half"}
    `("for incomingConnection = $incomingConnection", ({ outgoingConnection, verticalStrokeClassName }) => {
        const component = shallow(<HorizontalStroke outgoingConnection={outgoingConnection} />);
        expect(component.find(`.stroke-vertical.${verticalStrokeClassName}`).exists()).toBe(true);
    });
    it("marks optional stroke via css class when there is no connection", () => {
        const component = shallow(<HorizontalStroke optional />);
        expect(component.find(".stroke-horizontal.optional").exists()).toBe(true);
    });
    it.each`
        testDescription   | includingMenu | editMenu
        ${"an edit menu"} | ${true}       | ${(): React.ReactNode => <div className="edit-menu-placeholder" />}
        ${"no edit menu"} | ${false}      | ${(): React.ReactNode => null}
    `("marks selected stroke via css class when there is $testDescription", ({ includingMenu, editMenu }) => {
        const component = shallow(<HorizontalStroke gatewayId="id" editMenu={editMenu} onSelect={(): void => {}} />);
        expect(component.find(".stroke-horizontal.selected").exists()).toBe(true);
        expect(component.find(".edit-menu-placeholder").exists()).toBe(includingMenu);
    });
});
describe("calls onSelect", () => {
    const onSelect = jest.fn(() => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("on click event when representing gateway condition", () => {
        const component = shallow(
            <HorizontalStroke editMenu={undefined} gatewayId="gateway-id" onSelect={onSelect}>
                {"text"}
            </HorizontalStroke>
        );
        component.find(".top-label").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(2);
        expect(onSelect.mock.calls[0][0]).toEqual("gateway-id");
        expect(onSelect.mock.calls[0][1]).toBeUndefined();
    });
    it("on click event when representing connection from gateway to one of its branches", () => {
        const component = shallow(
            <HorizontalStroke
                editMenu={undefined}
                incomingConnection={ConnectionType.First}
                gatewayId={"leading-gateway-id"}
                branchIndex={0}
                onSelect={onSelect}
            >
                {"text"}
            </HorizontalStroke>
        );
        component.find(".top-label").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(2);
        expect(onSelect.mock.calls[0][0]).toEqual("leading-gateway-id");
        expect(onSelect.mock.calls[0][1]).toEqual(0);
    });
});
