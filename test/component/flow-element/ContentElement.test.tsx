import * as React from "react";
import { shallow } from "enzyme";

import { ContentElement } from "../../../src/component/flow-element/ContentElement";

describe("renders correctly", () => {
    it("without props", () => {
        const component = shallow(<ContentElement>text</ContentElement>);
        expect(component).toMatchSnapshot();
    });
});
