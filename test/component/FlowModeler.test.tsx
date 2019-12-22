import * as React from "react";
import { shallow } from "enzyme";

import { FlowModeler } from "../../src/component/FlowModeler";

describe("renders correctly", () => {
    const simpleFlow = {
        firstElementId: "1",
        elements: {
            "1": { data: { label: "First Node" }, nextElementId: "2" },
            "2": {
                data: { label: "Alternatives" },
                nextElements: [{ conditionData: { label: "Stop Here" } }, { id: "3.2", conditionData: { label: "Continue" } }]
            },
            "3.2": { data: { label: "Second Node" } }
        }
    };
    it("with minimal/default props", () => {
        const component = shallow(<FlowModeler flow={simpleFlow} renderContent={(data): React.ReactChild => <>{data.label}</>} />);
        expect(component).toMatchSnapshot();
    });
    it("with all render props", () => {
        const component = shallow(
            <FlowModeler
                flow={simpleFlow}
                renderContent={(data): React.ReactChild => <>{data.label}</>}
                renderGatewayConditionType={(data): React.ReactChild => <label>{data.label}</label>}
                renderGatewayConditionValue={(data): React.ReactChild => <span>{data.label}</span>}
            />
        );
        expect(component).toMatchSnapshot();
    });
});
