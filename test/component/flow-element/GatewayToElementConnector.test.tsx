import * as React from "react";
import { shallow } from "enzyme";

import { GatewayToElementConnector } from "../../../src/component/flow-element/GatewayToElementConnector";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(<GatewayToElementConnector connectionType="first">label</GatewayToElementConnector>);
        expect(component).toMatchSnapshot();
    });
});
