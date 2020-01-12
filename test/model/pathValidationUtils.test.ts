import { validatePaths, checkForCircularReference } from "../../src/model/pathValidationUtils";
import { createElementTree } from "../../src/model/modelUtils";
import { FlowModelerProps } from "../../src/types/FlowModelerProps";

const ref = (nextId: string): { nextElementId: string } => ({ nextElementId: nextId });

describe("checkForCircularReference()", () => {
    it.each`
        testDescription                | flowElements
        ${"direct self-reference"}     | ${{ a: ref("a") }}
        ${"nested one level"}          | ${{ a: ref("b"), b: ref("a") }}
        ${"nested six levels"}         | ${{ a: ref("b"), b: ref("c"), c: ref("d"), d: ref("e"), e: ref("f"), f: ref("g"), g: ref("a") }}
        ${"behind diverging gateway"}  | ${{ a: { nextElements: [{ id: "b" }, { id: "c" }] }, b: {}, c: ref("d"), d: ref("a") }}
        ${"behind converging gateway"} | ${{ a: { nextElements: [{ id: "b" }, { id: "c" }] }, b: ref("d"), c: ref("d"), d: ref("a") }}
    `("throws error for circular reference – $testDescription", ({ flowElements }) => {
        const execution = (): never => checkForCircularReference("a", flowElements);
        expect(execution).toThrowError("Circular reference to element: a");
    });
    it("accepts non-circular references", () => {
        const flowElements = {
            a: ref("b"),
            b: { nextElements: [{ id: "c" }, { id: "d" }, { id: "e" }] },
            c: ref("f"),
            d: { nextElements: [{ id: "d1" }, { id: "d2" }] },
            d1: ref("f"),
            d2: ref("f"),
            e: ref("f"),
            f: {}
        };
        const execution = (): never => checkForCircularReference("a", flowElements);
        expect(execution).not.toThrowError();
    });
});

describe("validatePaths()", () => {
    describe.each`
        testDescription                | firstElementId | additionalElements
        ${"root"}                      | ${"a"}         | ${{}}
        ${"behind content element"}    | ${"root"}      | ${{ root: ref("a") }}
        ${"behind converging gateway"} | ${"root"}      | ${{ root: { nextElements: [{ id: "x" }, { id: "y" }] }, x: ref("a"), y: ref("a") }}
    `(
        "properly performs validation when gateway is $testDescription",
        ({ firstElementId, additionalElements }: { firstElementId: string; additionalElements: FlowModelerProps["flow"]["elements"] }) => {
            it("accepts link between diverging gateway and one of its children", () => {
                const elements = {
                    ...additionalElements,
                    a: { nextElements: [{ id: "b" }, { id: "c" }] },
                    b: ref("c"),
                    c: {}
                };
                const treeRootElement = createElementTree({ firstElementId, elements }, "top");
                const execution = (): never => validatePaths(treeRootElement);
                expect(execution).not.toThrowError();
            });
            it("accepts link between neighbouring children of diverging gateway", () => {
                const elements = {
                    ...additionalElements,
                    a: { nextElements: [{ id: "b" }, { id: "c" }] },
                    b: ref("d"),
                    c: ref("d"),
                    d: {}
                };
                const treeRootElement = createElementTree({ firstElementId, elements }, "top");
                const execution = (): never => validatePaths(treeRootElement);
                expect(execution).not.toThrowError();
            });
            it("accepts links between multiple ancestors of nested diverging gateways", () => {
                const elements = {
                    ...additionalElements,
                    a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }] },
                    b: ref("bc"),
                    c: ref("bc"),
                    bc: ref("f"),
                    d: ref("de"),
                    e: ref("de"),
                    de: ref("f"),
                    f: {}
                };
                const treeRootElement = createElementTree({ firstElementId, elements }, "top");
                const execution = (): never => validatePaths(treeRootElement);
                expect(execution).not.toThrowError();
            });
            it("throws error for multiple references on non-neighbouring paths", () => {
                const elements = {
                    ...additionalElements,
                    a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }] },
                    b: ref("f"),
                    c: {},
                    d: ref("f"),
                    e: ref("b"),
                    f: {}
                };
                const treeRootElement = createElementTree({ firstElementId, elements }, "top");
                const execution = (): never => validatePaths(treeRootElement);
                expect(execution).toThrowError("Multiple references only valid from neighbouring paths. Invalid references to: 'b', 'f'");
            });
        }
    );
});
