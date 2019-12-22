import * as React from "react";
import { shallow } from "enzyme";

import { Gateway } from "../../../src/component/flow-element/Gateway";

describe("renders correctly", () => {
    it("without props", () => {
        const component = shallow(<Gateway>text</Gateway>);
        expect(component).toMatchSnapshot();
    });
});
