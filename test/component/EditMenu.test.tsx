import * as React from "react";
import { shallow } from "enzyme";

import { EditMenu } from "../../src/component/EditMenu";
import { ElementType } from "../../src/types/GridCellData";
import { createMinimalElementTreeStructure } from "../../src/model/modelUtils";
import { FlowElement } from "../../src/model/FlowElement";

describe("renders correctly", () => {
    const { elementsInTree }: { elementsInTree: Map<string, FlowElement> } = createMinimalElementTreeStructure({
        firstElementId: "a",
        elements: {
            a: { nextElements: [{ id: "b" }, { id: "c" }, {}] },
            b: { nextElementId: "c" },
            c: {}
        }
    });
    const onChange = (): void => {};
    it("for start element", () => {
        const component = shallow(<EditMenu targetType={ElementType.Start} onChange={onChange} />);
        expect(component).toMatchSnapshot();
    });
    it("for content element", () => {
        const component = shallow(<EditMenu targetType={ElementType.Content} referenceElement={elementsInTree.get("b")} onChange={onChange} />);
        expect(component).toMatchSnapshot();
    });
    it("for diverging gateway", () => {
        const component = shallow(
            <EditMenu targetType={ElementType.GatewayDiverging} referenceElement={elementsInTree.get("a")} onChange={onChange} />
        );
        expect(component).toMatchSnapshot();
    });
    it("for converging gateway", () => {
        const component = shallow(
            <EditMenu targetType={ElementType.GatewayConverging} referenceElement={elementsInTree.get("c")} onChange={onChange} />
        );
        expect(component).toMatchSnapshot();
    });
    it("for diverging gateway branch", () => {
        const component = shallow(
            <EditMenu targetType={ElementType.GatewayConverging} referenceElement={elementsInTree.get("a")} branchIndex={1} onChange={onChange} />
        );
        expect(component).toMatchSnapshot();
    });
});
