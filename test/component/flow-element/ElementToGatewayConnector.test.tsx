import * as React from "react";
import { shallow } from "enzyme";

import { ElementToGatewayConnector } from "../../../src/component/flow-element/ElementToGatewayConnector";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(<ElementToGatewayConnector connectionType="first" />);
        expect(component).toMatchSnapshot();
    });
});
