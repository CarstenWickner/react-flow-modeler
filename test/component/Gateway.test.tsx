import * as React from "react";
import { shallow } from "enzyme";

import { Gateway } from "../../src/component/Gateway";

describe("renders correctly", () => {
    it("as converging gateway", () => {
        const component = shallow(<Gateway type="converging" />);
        expect(component).toMatchSnapshot();
    });
    it("as diverging gateway", () => {
        const component = shallow(<Gateway type="diverging">text</Gateway>);
        expect(component).toMatchSnapshot();
    });
});
