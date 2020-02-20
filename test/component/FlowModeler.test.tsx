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
                nextElements: [
                    { id: "3.1-end", conditionData: { label: "Stop Here" } },
                    { id: "3.2", conditionData: { label: "Continue" } },
                    { conditionData: { label: "Unless it is already done" } }
                ]
            },
            "3.2": { data: { label: "Second Node" } }
        }
    };
    it("with minimal/default props", () => {
        const component = shallow(<FlowModeler flow={simpleFlow} renderStep={({ data }): React.ReactNode => <>{data.label}</>} />);
        expect(component).toMatchSnapshot();
    });
    it("with all render props", () => {
        const component = shallow(
            <FlowModeler
                flow={simpleFlow}
                options={{ verticalAlign: "bottom" }}
                renderStep={({ data }): React.ReactNode => <>{data.label}</>}
                renderGatewayConditionType={({ data }): React.ReactNode => <label>{data.label}</label>}
                renderGatewayConditionValue={({ data }): React.ReactNode => <span>{data.label}</span>}
            />
        );
        expect(component).toMatchSnapshot();
    });
});
