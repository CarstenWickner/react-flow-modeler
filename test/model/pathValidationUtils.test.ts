import { createValidatedElementTree, isFlowValid } from "../../src/model/pathValidationUtils";
import { FlowModelerProps } from "../../src/types/FlowModelerProps";

import { cont, divGw } from "./testUtils";

describe("createValidatedElementTree() / isFlowValid()", () => {
    describe.each`
        testDescription                | flowElements
        ${"direct self-reference"}     | ${{ a: cont("a") }}
        ${"nested one level"}          | ${{ a: cont("b"), b: cont("a") }}
        ${"nested six levels"}         | ${{ a: cont("b"), b: cont("c"), c: cont("d"), d: cont("e"), e: cont("f"), f: cont("g"), g: cont("a") }}
        ${"behind diverging gateway"}  | ${{ a: divGw("b", "c"), b: {}, c: cont("d"), d: cont("a") }}
        ${"behind converging gateway"} | ${{ a: divGw("b", "c"), b: cont("d"), c: cont("d"), d: cont("a") }}
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
                a: cont("b"),
                b: divGw("c", "d", "e"),
                c: cont("f"),
                d: divGw("d1", "d2"),
                d1: cont("f"),
                d2: cont("f"),
                e: cont("f"),
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
        ${"behind content element"}         | ${"root"}      | ${{ root: cont("a") }}
        ${"behind empty diverging gateway"} | ${"root"}      | ${{ root: divGw("a", "a") }}
        ${"behind converging gateway"}      | ${"root"}      | ${{ root: divGw("x", "y"), x: cont("a"), y: cont("a") }}
    `(
        "properly performs validation when gateway is $testDescription",
        ({ firstElementId, additionalElements }: { firstElementId: string; additionalElements: FlowModelerProps["flow"]["elements"] }) => {
            describe("accepts link between diverging gateway and one of its children", () => {
                const flow = {
                    firstElementId,
                    elements: { ...additionalElements, a: divGw("b", "c"), b: cont("c"), c: {} }
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
                    elements: { ...additionalElements, a: divGw("b", "c"), b: cont("d"), c: cont("d"), d: {} }
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
                        a: divGw("b", "c", "d", "e"),
                        b: cont("bc"),
                        c: cont("bc"),
                        bc: cont("f"),
                        d: cont("de"),
                        e: cont("de"),
                        de: cont("f"),
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
                        a: divGw("b", "c", "d", "e"),
                        b: cont("f"),
                        c: {},
                        d: cont("f"),
                        e: cont("b"),
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
            ${"to same element"}                      | ${{ a: divGw("b", "b", "b"), b: {} }}
            ${"with intermediate converging gateway"} | ${{ a: divGw("b", "c", "b"), b: {}, c: cont("b") }}
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
            ${"invalid converging gateway (1)"} | ${{ a: divGw("x", "b", "x"), x: cont("b"), b: {} }}
            ${"invalid converging gateway (2)"} | ${{ a: divGw("x", "b", "c"), x: {}, b: {}, c: cont("x") }}
            ${"invalid converging gateway (3)"} | ${{ a: divGw("b", "c", "x"), b: cont("x"), c: {}, x: {} }}
            ${"invalid converging gateway (4)"} | ${{ a: divGw("b", "c"), b: divGw("x", "d"), x: {}, c: cont("x"), d: {} }}
            ${"invalid converging gateway (5)"} | ${{ a: divGw("b", "c"), b: cont("x"), x: {}, c: divGw("d", "x"), d: {} }}
            ${"end"}                            | ${{ a: divGw("x", null, "x"), x: {} }}
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
