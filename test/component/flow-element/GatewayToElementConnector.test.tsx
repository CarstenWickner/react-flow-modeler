import * as React from "react";
import { shallow } from "enzyme";

import { GatewayToElementConnector } from "../../../src/component/flow-element/GatewayToElementConnector";
import { ConnectionType } from "../../../src/types/GridCellData";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(<GatewayToElementConnector connectionType={ConnectionType.First}>label</GatewayToElementConnector>);
        expect(component).toMatchSnapshot();
    });
});
