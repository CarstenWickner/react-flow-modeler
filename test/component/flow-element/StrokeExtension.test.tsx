import * as React from "react";
import { shallow } from "enzyme";

import { StrokeExtension } from "../../../src/component/flow-element/StrokeExtension";

describe("renders correctly", () => {
    it("without props", () => {
        const component = shallow(<StrokeExtension />);
        expect(component).toMatchSnapshot();
    });
});
