import { createValidatedElementTree, isFlowValid } from "../../src/model/pathValidationUtils";
import { FlowModelerProps } from "../../src/types/FlowModelerProps";

const ref = (nextId: string): { nextElementId: string } => ({ nextElementId: nextId });

describe("createValidatedElementTree() / isFlowValid()", () => {
    describe.each`
        testDescription                | flowElements
        ${"direct self-reference"}     | ${{ a: ref("a") }}
        ${"nested one level"}          | ${{ a: ref("b"), b: ref("a") }}
        ${"nested six levels"}         | ${{ a: ref("b"), b: ref("c"), c: ref("d"), d: ref("e"), e: ref("f"), f: ref("g"), g: ref("a") }}
        ${"behind diverging gateway"}  | ${{ a: { nextElements: [{ id: "b" }, { id: "c" }] }, b: {}, c: ref("d"), d: ref("a") }}
        ${"behind converging gateway"} | ${{ a: { nextElements: [{ id: "b" }, { id: "c" }] }, b: ref("d"), c: ref("d"), d: ref("a") }}
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
                b: { nextElements: [{ id: "c" }, { id: "d" }, { id: "e" }] },
                c: ref("f"),
                d: { nextElements: [{ id: "d1" }, { id: "d2" }] },
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
        ${"behind empty diverging gateway"} | ${"root"}      | ${{ root: { nextElements: [{ id: "a" }, { id: "a" }] } }}
        ${"behind converging gateway"}      | ${"root"}      | ${{ root: { nextElements: [{ id: "x" }, { id: "y" }] }, x: ref("a"), y: ref("a") }}
    `(
        "properly performs validation when gateway is $testDescription",
        ({ firstElementId, additionalElements }: { firstElementId: string; additionalElements: FlowModelerProps["flow"]["elements"] }) => {
            describe("accepts link between diverging gateway and one of its children", () => {
                const flow = {
                    firstElementId,
                    elements: {
                        ...additionalElements,
                        a: { nextElements: [{ id: "b" }, { id: "c" }] },
                        b: ref("c"),
                        c: {}
                    }
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
                    elements: {
                        ...additionalElements,
                        a: { nextElements: [{ id: "b" }, { id: "c" }] },
                        b: ref("d"),
                        c: ref("d"),
                        d: {}
                    }
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
                        a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }] },
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
                        a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }] },
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
            ${"to same element"}                      | ${{ a: { nextElements: [{ id: "b" }, { id: "b" }, { id: "b" }] }, b: {} }}
            ${"with intermediate converging gateway"} | ${{ a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "b" }] }, b: {}, c: ref("b") }}
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
            testDescription                             | elements
            ${"pointing to invalid converging gateway"} | ${{ a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "b" }] }, b: ref("c"), c: {} }}
            ${"pointing to end"}                        | ${{ a: { nextElements: [{ id: "b" }, {}, { id: "b" }] }, b: {} }}
        `("throws error for interrupted references – $testDescription", ({ elements }) => {
            const flow = { firstElementId: "a", elements };

            it("createValidatedElementTree() throws error", () => {
                const execution = (): never => createValidatedElementTree(flow, "top");
                expect(execution).toThrowError("Multiple references only valid from neighbouring paths. Invalid references to: 'b'");
            });
            it("isFlowValid() returns false", () => {
                expect(isFlowValid(flow)).toBe(false);
            });
        });
    });
});
