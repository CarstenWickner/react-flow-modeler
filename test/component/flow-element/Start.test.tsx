import * as React from "react";
import { shallow } from "enzyme";

import { Start } from "../../../src/component/flow-element/Start";

describe("renders correctly", () => {
    it("without props", () => {
        const component = shallow(<Start />);
        expect(component).toMatchSnapshot();
    });
});
