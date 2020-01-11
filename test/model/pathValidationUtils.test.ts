import { validatePaths } from "../../src/model/pathValidationUtils";

describe("validatePaths()", () => {
    const ref = (nextId: string): { nextElementId: string } => ({ nextElementId: nextId });
    it.each`
        testDescription            | flowElements
        ${"direct self-reference"} | ${{ a: ref("a") }}
        ${"nested one level"}      | ${{ a: ref("b"), b: ref("a") }}
        ${"nested six levels"}     | ${{ a: ref("b"), b: ref("c"), c: ref("d"), d: ref("e"), e: ref("f"), f: ref("g"), g: ref("a") }}
    `("throws error for circular reference – $testDescription", ({ flowElements }) => {
        const execution = (): never =>
            validatePaths({
                firstElementId: "a",
                elements: flowElements
            });
        expect(execution).toThrowError("Circular reference to element: a");
    });
    it("throws error for multiple references on non-neighbouring paths", () => {
        const execution = (): never =>
            validatePaths({
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }] },
                    b: ref("f"),
                    c: {},
                    d: ref("f"),
                    e: ref("b"),
                    f: {}
                }
            });
        expect(execution).toThrowError("Multiple references only valid from neighbouring paths. Invalid references to: 'b', 'f'");
    });
});
