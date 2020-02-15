import * as React from "react";
import { shallow } from "enzyme";

import { EditMenu } from "../../src/component/EditMenu";
import { createMinimalElementTreeStructure } from "../../src/model/modelUtils";
import {
    StartNode,
    ElementType,
    ModelElement,
    ContentNode,
    ConvergingGatewayNode,
    DivergingGatewayBranch,
    DivergingGatewayNode
} from "../../src/model/ModelElement";

describe("renders correctly", () => {
    const { elementsInTree }: { elementsInTree: Array<ModelElement> } = createMinimalElementTreeStructure({
        firstElementId: "a",
        elements: {
            a: { nextElements: [{ id: "b" }, { id: "c" }, {}] },
            b: { nextElementId: "c" },
            c: {}
        }
    });
    const onChange = (): void => {};
    it("for start element", () => {
        const component = shallow(
            <EditMenu referenceElement={elementsInTree.find((entry) => entry.type === ElementType.Start) as StartNode} onChange={onChange} />
        );
        expect(component).toMatchSnapshot();
    });
    it("for content element", () => {
        const component = shallow(
            <EditMenu
                referenceElement={elementsInTree.find((entry) => entry.type === ElementType.Content && entry.id === "b") as ContentNode}
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
    it("for diverging gateway", () => {
        const component = shallow(
            <EditMenu
                referenceElement={
                    elementsInTree.find((entry) => entry.type === ElementType.GatewayDiverging && entry.id === "a") as DivergingGatewayNode
                }
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
    it("for converging gateway", () => {
        const component = shallow(
            <EditMenu
                referenceElement={
                    elementsInTree.find(
                        (entry) =>
                            entry.type === ElementType.GatewayConverging &&
                            entry.followingElement.type === ElementType.Content &&
                            entry.followingElement.id === "c"
                    ) as ConvergingGatewayNode
                }
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
    it("for diverging gateway branch", () => {
        const component = shallow(
            <EditMenu
                referenceElement={
                    elementsInTree.find(
                        (entry) => entry.type === ElementType.ConnectGatewayToElement && entry.precedingElement.id === "a" && entry.branchIndex === 1
                    ) as DivergingGatewayBranch
                }
                onChange={onChange}
            />
        );
        expect(component).toMatchSnapshot();
    });
});
