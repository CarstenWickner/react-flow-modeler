import * as React from "react";
import { shallow } from "enzyme";

import { GridCell } from "../../src/component/GridCell";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(
            <GridCell colStartIndex={1} colEndIndex={3} rowStartIndex={4} rowEndIndex={6}>
                <div>cell content</div>
            </GridCell>
        );
        expect(component).toMatchSnapshot();
    });
    it("with colStartIndex = 2 and no colEndIndex", () => {
        const component = shallow(
            <GridCell colStartIndex={2} rowStartIndex={3} rowEndIndex={5}>
                <div>cell content</div>
            </GridCell>
        );
        expect(component.prop("style")).toBeDefined();
        expect(component.prop("style")["grid-area"]).toEqual("3 / 2 / 5 / auto");
    });
    it("with rowStartIndex = 2 and no rowEndIndex", () => {
        const component = shallow(
            <GridCell colStartIndex={2} colEndIndex={5} rowStartIndex={3}>
                <div>cell content</div>
            </GridCell>
        );
        expect(component.prop("style")).toBeDefined();
        expect(component.prop("style")["grid-area"]).toEqual("3 / 2 / auto / 5");
    });
});
