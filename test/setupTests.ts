import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

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

// add custom serializer for FlowElements in snapshots
expect.addSnapshotSerializer({
    test(value: unknown): boolean {
        return value && value.hasOwnProperty("id") && value.hasOwnProperty("precedingElements") && value.hasOwnProperty("followingElements");
    },
    print(value: { getId: () => string }): string {
        return `FlowElement { "id": "${value.getId()}" }`;
    }
});
expect.addSnapshotSerializer({
    test(value: unknown): boolean {
        return value && value.hasOwnProperty("getId") && value.hasOwnProperty("getPrecedingElements") && value.hasOwnProperty("getFollowingElements");
    },
    print(value: { getId: () => string }): string {
        return `FlowElementReference { "id": "${value.getId()}" }`;
    }
});
