import { createValidatedElementTree, isFlowValid } from "../../src/model/pathValidationUtils";
import { FlowModelerProps } from "../../src/types/FlowModelerProps";

const ref = (nextId: string): { nextElementId: string } => ({ nextElementId: nextId });
const refs = (...nextIds: Array<string>): { nextElements: Array<{ id?: string }> } => ({ nextElements: nextIds.map((id) => (id ? { id } : {})) });

describe("createValidatedElementTree() / isFlowValid()", () => {
    describe.each`
        testDescription                | flowElements
        ${"direct self-reference"}     | ${{ a: ref("a") }}
        ${"nested one level"}          | ${{ a: ref("b"), b: ref("a") }}
        ${"nested six levels"}         | ${{ a: ref("b"), b: ref("c"), c: ref("d"), d: ref("e"), e: ref("f"), f: ref("g"), g: ref("a") }}
        ${"behind diverging gateway"}  | ${{ a: refs("b", "c"), b: {}, c: ref("d"), d: ref("a") }}
        ${"behind converging gateway"} | ${{ a: refs("b", "c"), b: ref("d"), c: ref("d"), d: ref("a") }}
    `("circular reference $testDescription", ({ flowElements }: { flowElements: FlowModelerProps["flow"]["elements"] }) => {
        const flow = { firstElementId: "a", elements: flowElements };

        it("createValidatedElementTree() throws error", () => {
            const execution = (): never => createValidatedElementTree(flow, "top");
            expect(execution).toThrowError("Circular reference to element: a");
        });
        it("isFlowValid() returns false", () => {
            expect(isFlowValid(flow)).toBe(false);
        });
    });

    describe("accepts non-circular references", () => {
        const flow = {
            firstElementId: "a",
            elements: {
                a: ref("b"),
                b: refs("c", "d", "e"),
                c: ref("f"),
                d: refs("d1", "d2"),
                d1: ref("f"),
                d2: ref("f"),
                e: ref("f"),
                f: {}
            }
        };
        it("createValidatedElementTree() builds model", () => {
            expect(createValidatedElementTree(flow, "top")).toBeDefined();
        });
        it("isFlowValid() returns true", () => {
            expect(isFlowValid(flow)).toBe(true);
        });
    });

    describe.each`
        testDescription                     | firstElementId | additionalElements
        ${"root"}                           | ${"a"}         | ${{}}
        ${"behind content element"}         | ${"root"}      | ${{ root: ref("a") }}
        ${"behind empty diverging gateway"} | ${"root"}      | ${{ root: refs("a", "a") }}
        ${"behind converging gateway"}      | ${"root"}      | ${{ root: refs("x", "y"), x: ref("a"), y: ref("a") }}
    `(
        "properly performs validation when gateway is $testDescription",
        ({ firstElementId, additionalElements }: { firstElementId: string; additionalElements: FlowModelerProps["flow"]["elements"] }) => {
            describe("accepts link between diverging gateway and one of its children", () => {
                const flow = {
                    firstElementId,
                    elements: { ...additionalElements, a: refs("b", "c"), b: ref("c"), c: {} }
                };
                it("createValidatedElementTree() builds model", () => {
                    expect(createValidatedElementTree(flow, "top")).toBeDefined();
                });
                it("isFlowValid() returns true", () => {
                    expect(isFlowValid(flow)).toBe(true);
                });
            });
            describe("accepts link between neighbouring children of diverging gateway", () => {
                const flow = {
                    firstElementId,
                    elements: { ...additionalElements, a: refs("b", "c"), b: ref("d"), c: ref("d"), d: {} }
                };
                it("createValidatedElementTree() builds model", () => {
                    expect(createValidatedElementTree(flow, "top")).toBeDefined();
                });
                it("isFlowValid() returns true", () => {
                    expect(isFlowValid(flow)).toBe(true);
                });
            });
            describe("accepts links between multiple ancestors of nested diverging gateways", () => {
                const flow = {
                    firstElementId,
                    elements: {
                        ...additionalElements,
                        a: refs("b", "c", "d", "e"),
                        b: ref("bc"),
                        c: ref("bc"),
                        bc: ref("f"),
                        d: ref("de"),
                        e: ref("de"),
                        de: ref("f"),
                        f: {}
                    }
                };
                it("createValidatedElementTree() builds model", () => {
                    expect(createValidatedElementTree(flow, "top")).toBeDefined();
                });
                it("isFlowValid() returns true", () => {
                    expect(isFlowValid(flow)).toBe(true);
                });
            });
            describe("detects multiple references on non-neighbouring paths", () => {
                const flow = {
                    firstElementId,
                    elements: {
                        ...additionalElements,
                        a: refs("b", "c", "d", "e"),
                        b: ref("f"),
                        c: {},
                        d: ref("f"),
                        e: ref("b"),
                        f: {}
                    }
                };
                it("createValidatedElementTree() throws error", () => {
                    const execution = (): never => createValidatedElementTree(flow, "top");
                    expect(execution).toThrowError("Multiple references only valid from neighbouring paths. Invalid references to: 'b', 'f'");
                });
                it("isFlowValid() returns false", () => {
                    expect(isFlowValid(flow)).toBe(false);
                });
            });
        }
    );
    describe("properly handles the same element being referenced multiple times from one diverging gateway", () => {
        describe.each`
            testDescription                           | elements
            ${"to same element"}                      | ${{ a: refs("b", "b", "b"), b: {} }}
            ${"with intermediate converging gateway"} | ${{ a: refs("b", "c", "b"), b: {}, c: ref("b") }}
        `("accepts uninterrupted references $testDescription", ({ elements }) => {
            const flow = { firstElementId: "a", elements };

            it("createValidatedElementTree() builds model", () => {
                expect(createValidatedElementTree(flow, "top")).toBeDefined();
            });
            it("isFlowValid() returns true", () => {
                expect(isFlowValid(flow)).toBe(true);
            });
        });
        describe.each`
            testDescription                     | elements
            ${"invalid converging gateway (1)"} | ${{ a: refs("x", "b", "x"), x: ref("b"), b: {} }}
            ${"invalid converging gateway (2)"} | ${{ a: refs("x", "b", "c"), x: {}, b: {}, c: ref("x") }}
            ${"invalid converging gateway (3)"} | ${{ a: refs("b", "c"), b: refs("x", "d"), x: {}, c: ref("x"), d: {} }}
            ${"end"}                            | ${{ a: refs("x", null, "x"), x: {} }}
        `("throws error for interrupted references – pointing to $testDescription", ({ elements }) => {
            const flow = { firstElementId: "a", elements };

            it("createValidatedElementTree() throws error", () => {
                const execution = (): never => createValidatedElementTree(flow, "top");
                expect(execution).toThrowError("Multiple references only valid from neighbouring paths. Invalid references to: 'x'");
            });
            it("isFlowValid() returns false", () => {
                expect(isFlowValid(flow)).toBe(false);
            });
        });
    });
});
