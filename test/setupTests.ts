import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { ModelElement, ElementType } from "../src/types/ModelElement";

configure({
    adapter: new Adapter()
});

/**
 * Override console.error and console.warn to fail any tests where they are called.
 */
console.error = (message: Error | string): never => {
    throw message instanceof Error ? message : new Error(message);
};
console.warn = (message: Error | string): never => {
    throw message instanceof Error ? message : new Error(message);
};

const serializeModelElement = (value: ModelElement): string => {
    switch (value.type) {
        case ElementType.StartNode:
            return "StartNode";
        case ElementType.ContentNode:
            return `ContentNode { "id": "${value.id}" }`;
        case ElementType.DivergingGatewayNode:
            return `DivergingGatewayNode { "id": "${value.id}" }`;
        case ElementType.DivergingGatewayBranch:
            return `DivergingGatewayBranch { "followingElement": ${
                value.followingElement ? serializeModelElement(value.followingElement) : undefined
            } }`;
        case ElementType.ConvergingGatewayBranch:
            return `ConvergingGatewayBranch { "gateway": ${value.followingElement ? serializeModelElement(value.followingElement) : undefined} }`;
        case ElementType.ConvergingGatewayNode:
            return `ConvergingGatewayNode { "followingElement": ${
                value.followingElement ? serializeModelElement(value.followingElement) : undefined
            } }`;
        case ElementType.EndNode:
            return "EndNode";
        default:
            return "ModelElement";
    }
};

// add custom serializer for FlowElements in snapshots
expect.addSnapshotSerializer({
    test(value: unknown): boolean {
        return (
            value &&
            value.hasOwnProperty("type") &&
            value.hasOwnProperty("columnIndex") &&
            value.hasOwnProperty("rowCount") &&
            !value.hasOwnProperty("colStartIndex") &&
            !value.hasOwnProperty("rowStartIndex")
        );
    },
    print: serializeModelElement
});
