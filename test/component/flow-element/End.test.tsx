import * as React from "react";
import { shallow } from "enzyme";

import { End } from "../../../src/component/flow-element/End";

describe("renders correctly", () => {
    it("without props", () => {
        const component = shallow(<End />);
        expect(component).toMatchSnapshot();
    });
});
