import * as React from "react";
import { shallow } from "enzyme";

import { ElementToGatewayConnector } from "../../../src/component/flow-element/ElementToGatewayConnector";
import { ConnectionType } from "../../../src/types/GridCellData";

describe("renders correctly", () => {
    it("with minimal/default props", () => {
        const component = shallow(<ElementToGatewayConnector connectionType={ConnectionType.First} />);
        expect(component).toMatchSnapshot();
    });
});
