import * as React from "react";
import { shallow } from "enzyme";

import { GatewayConnector } from "../../../src/component/flow-element/GatewayConnector";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(<GatewayConnector incomingConnection="first">label</GatewayConnector>);
        expect(component).toMatchSnapshot();
    });
});
