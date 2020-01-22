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
            withLabel
            ${"w/"}
            ${"w/o"}
        `("$withLabel label", ({ withLabel }) => {
            const component = shallow(
                <HorizontalStroke incomingConnection={incomingConnection} editMenu={undefined} onSelect={(): void => {}}>
                    {withLabel === "w/" ? "text" : null}
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
        testDescription             | incomingConnection
        ${"no connection"}          | ${undefined}
        ${"an incoming connection"} | ${ConnectionType.First}
    `("marks selected stroke via css class when there is $testDescription", ({ incomingConnection }) => {
        const component = shallow(
            <HorizontalStroke
                editMenu={<div className="edit-menu-placeholder" />}
                incomingConnection={incomingConnection}
                onSelect={(): void => {}}
            />
        );
        expect(component.find(".stroke-horizontal.selected").exists()).toBe(true);
    });
});
describe("calls onSelect", () => {
    const onSelect = jest.fn(() => {});
    const event = ({ stopPropagation: jest.fn(() => {}) } as unknown) as React.MouseEvent;
    it("on click event when representing gateway condition", () => {
        const component = shallow(
            <HorizontalStroke editMenu={undefined} gatewayId={"gateway-id"} onSelect={onSelect}>
                {"text"}
            </HorizontalStroke>
        );
        component.find(".top-label").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toEqual("gateway-id");
    });
    it("on click event when representing connection to gateway branch", () => {
        const component = shallow(
            <HorizontalStroke
                editMenu={undefined}
                incomingConnection={ConnectionType.First}
                followingElementId={"following-element-id"}
                onSelect={onSelect}
            >
                {"text"}
            </HorizontalStroke>
        );
        component.find(".top-label").prop("onClick")(event);
        expect(onSelect.mock.calls).toHaveLength(1);
        expect(onSelect.mock.calls[0]).toHaveLength(1);
        expect(onSelect.mock.calls[0][0]).toEqual("following-element-id");
    });
});
