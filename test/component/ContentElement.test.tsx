import * as React from "react";
import { shallow } from "enzyme";

import { ContentElement } from "../../src/component/ContentElement";

describe("renders correctly", () => {
    it("without props", () => {
        const component = shallow(<ContentElement>text</ContentElement>);
        expect(component).toMatchSnapshot();
    });
});
