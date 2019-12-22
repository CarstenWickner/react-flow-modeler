import * as React from "react";
import { shallow, mount } from "enzyme";

import { HorizontalStroke } from "../../../src/component/flow-element/HorizontalStroke";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(<HorizontalStroke incomingConnection="single">label</HorizontalStroke>);
        expect(component).toMatchSnapshot();
    });
    it("for incomingConnection = single", () => {
        const component = mount(<HorizontalStroke incomingConnection="single">text</HorizontalStroke>);
        expect(component.find(".stroke-vertical").exists()).toBe(false);
        const renderedInstance = component.instance() as HorizontalStroke;
        expect(renderedInstance.state.wrapperTopHeight).toBe(0);

        jest.spyOn(renderedInstance.topLabelRef.current, "clientHeight", "get").mockImplementation(() => 30);
        renderedInstance.componentDidUpdate();
        expect(renderedInstance.render()).toMatchSnapshot();
    });
    describe.each`
        incomingConnection | verticalStrokeClassName
        ${"first"}         | ${"bottom-half"}
        ${"middle"}        | ${"full-height"}
        ${"last"}          | ${"top-half"}
    `("for incomingConnection = $incomingConnection", ({ incomingConnection, verticalStrokeClassName }) => {
        it.each`
            withLabel
            ${"w/"}
            ${"w/o"}
        `("$withLabel label", ({ withLabel }) => {
            const component = shallow(
                <HorizontalStroke incomingConnection={incomingConnection}>{withLabel === "w/" ? "text" : null}</HorizontalStroke>
            );
            expect(component.find(`.stroke-vertical.${verticalStrokeClassName}`).exists()).toBe(true);
        });
    });
});
