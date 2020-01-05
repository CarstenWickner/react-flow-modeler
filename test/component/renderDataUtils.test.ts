import { buildRenderData } from "../../src/component/renderDataUtils";
import { ElementType } from "../../src/types/GridCellData";

describe("buildRenderData()", () => {
    it.each`
        testDescription             | input
        ${"no elements"}            | ${{ elements: {}, firstElementId: "0" }}
        ${"invalid firstElementId"} | ${{ elements: { a: {} }, firstElementId: "b" }}
    `("returns two cells: one start and one end if $testDescription provided", ({ input }) => {
        const result = buildRenderData(input);
        expect(result).toEqual({
            columnCount: 2,
            gridCellData: [
                {
                    colStartIndex: 1,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.Start
                },
                {
                    colStartIndex: 2,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.End
                }
            ]
        });
    });
    it("includes content elements", () => {
        const result = buildRenderData({
            elements: {
                one: { nextElementId: "two" },
                two: { data: { label: "text" } }
            },
            firstElementId: "one"
        });
        expect(result).toEqual({
            columnCount: 4,
            gridCellData: [
                {
                    colStartIndex: 1,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.Start
                },
                {
                    colStartIndex: 2,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.Content,
                    elementId: "one",
                    data: undefined
                },
                {
                    colStartIndex: 3,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.Content,
                    elementId: "two",
                    data: {
                        label: "text"
                    }
                },
                {
                    colStartIndex: 4,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.End
                }
            ]
        });
    });
    it("can handle gateway without children", () => {
        const result = buildRenderData({
            elements: { one: { nextElements: [] } },
            firstElementId: "one"
        });
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 6,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "data": undefined,
                  "gatewayId": "one",
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "colEndIndex": 5,
                  "colStartIndex": 3,
                  "connectionType": 1,
                  "elementId": "one",
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 5,
                  "connectionType": 1,
                  "data": undefined,
                  "elementId": undefined,
                  "gatewayId": "one",
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 5,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 6,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 8,
                },
                Object {
                  "colEndIndex": 5,
                  "colStartIndex": 3,
                  "connectionType": 3,
                  "elementId": "one",
                  "rowEndIndex": 5,
                  "rowStartIndex": 3,
                  "type": 6,
                },
                Object {
                  "colEndIndex": 5,
                  "colStartIndex": 3,
                  "connectionType": 1,
                  "elementId": "one",
                  "rowEndIndex": 5,
                  "rowStartIndex": 3,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 5,
                  "connectionType": 3,
                  "data": undefined,
                  "elementId": undefined,
                  "gatewayId": "one",
                  "rowEndIndex": 5,
                  "rowStartIndex": 3,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 5,
                  "rowEndIndex": 5,
                  "rowStartIndex": 3,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 6,
                  "rowEndIndex": 5,
                  "rowStartIndex": 3,
                  "type": 8,
                },
                Object {
                  "colEndIndex": 5,
                  "colStartIndex": 3,
                  "connectionType": 3,
                  "elementId": "one",
                  "rowEndIndex": 7,
                  "rowStartIndex": 5,
                  "type": 6,
                },
              ],
            }
        `);
    });
    it("can handle gateway with single child", () => {
        const result = buildRenderData({
            elements: {
                one: { nextElements: [{ id: "two", conditionData: { label: "condition" } }] },
                two: { data: { label: "text" } }
            },
            firstElementId: "one"
        });
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 7,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "data": undefined,
                  "gatewayId": "one",
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "colStartIndex": 3,
                  "connectionType": 1,
                  "data": Object {
                    "label": "condition",
                  },
                  "elementId": "two",
                  "gatewayId": "one",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "data": Object {
                    "label": "text",
                  },
                  "elementId": "two",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "connectionType": 1,
                  "elementId": "two",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 7,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 8,
                },
                Object {
                  "colEndIndex": 6,
                  "colStartIndex": 3,
                  "connectionType": 3,
                  "elementId": "one",
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "connectionType": 3,
                  "data": undefined,
                  "elementId": undefined,
                  "gatewayId": "one",
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 5,
                },
              ],
            }
        `);
    });
    it("includes data for gateway and its children", () => {
        const result = buildRenderData({
            elements: {
                one: {
                    data: { label: "text-one" },
                    nextElements: [{ id: "two", conditionData: { label: "cond-1" } }, { conditionData: { label: "cond-2" } }, { id: "three" }]
                },
                two: { data: { label: "text-two" } },
                three: { data: { label: "text-three" } }
            },
            firstElementId: "one"
        });
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 7,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "data": Object {
                    "label": "text-one",
                  },
                  "gatewayId": "one",
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "colStartIndex": 3,
                  "connectionType": 1,
                  "data": Object {
                    "label": "cond-1",
                  },
                  "elementId": "two",
                  "gatewayId": "one",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "data": Object {
                    "label": "text-two",
                  },
                  "elementId": "two",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "connectionType": 1,
                  "elementId": "two",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 7,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 8,
                },
                Object {
                  "colEndIndex": 6,
                  "colStartIndex": 3,
                  "connectionType": 2,
                  "elementId": "one",
                  "rowEndIndex": 5,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "connectionType": 2,
                  "data": Object {
                    "label": "cond-2",
                  },
                  "elementId": undefined,
                  "gatewayId": "one",
                  "rowEndIndex": 5,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "elementId": "three",
                  "gatewayId": "one",
                  "rowEndIndex": 6,
                  "rowStartIndex": 5,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "data": Object {
                    "label": "text-three",
                  },
                  "elementId": "three",
                  "rowEndIndex": 6,
                  "rowStartIndex": 5,
                  "type": 2,
                },
                Object {
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "connectionType": 3,
                  "elementId": "three",
                  "rowEndIndex": 6,
                  "rowStartIndex": 5,
                  "type": 6,
                },
              ],
            }
        `);
    });
    it("considers combination of content and gateway elements", () => {
        const result = buildRenderData({
            firstElementId: "1",
            elements: {
                "1": {
                    nextElements: [{ id: "2.1" }, {}, { id: "2.3" }]
                },
                "2.1": {
                    nextElementId: "3.1"
                },
                "2.3": {
                    nextElements: [{}, { id: "3.3.2" }]
                },
                "3.1": {},
                "3.3.2": {
                    nextElements: [{}, { id: "4.3.2.2" }, {}]
                },
                "4.3.2.2": {}
            }
        });
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 11,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "data": undefined,
                  "gatewayId": "1",
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "colStartIndex": 3,
                  "connectionType": 1,
                  "data": undefined,
                  "elementId": "2.1",
                  "gatewayId": "1",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "data": undefined,
                  "elementId": "2.1",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 5,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 7,
                },
                Object {
                  "colStartIndex": 6,
                  "data": undefined,
                  "elementId": "3.1",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colEndIndex": 10,
                  "colStartIndex": 7,
                  "connectionType": 1,
                  "elementId": "3.1",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 10,
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 11,
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 8,
                },
                Object {
                  "colEndIndex": 10,
                  "colStartIndex": 3,
                  "connectionType": 2,
                  "elementId": "1",
                  "rowEndIndex": 8,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 10,
                  "connectionType": 2,
                  "data": undefined,
                  "elementId": undefined,
                  "gatewayId": "1",
                  "rowEndIndex": 8,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "elementId": "2.3",
                  "gatewayId": "1",
                  "rowEndIndex": 12,
                  "rowStartIndex": 8,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "data": undefined,
                  "gatewayId": "2.3",
                  "rowEndIndex": 12,
                  "rowStartIndex": 8,
                  "type": 3,
                },
                Object {
                  "colEndIndex": 10,
                  "colStartIndex": 5,
                  "connectionType": 2,
                  "elementId": "2.3",
                  "rowEndIndex": 12,
                  "rowStartIndex": 8,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 10,
                  "connectionType": 1,
                  "data": undefined,
                  "elementId": undefined,
                  "gatewayId": "2.3",
                  "rowEndIndex": 14,
                  "rowStartIndex": 8,
                  "type": 5,
                },
                Object {
                  "colEndIndex": 10,
                  "colStartIndex": 7,
                  "connectionType": 2,
                  "elementId": "3.3.2",
                  "rowEndIndex": 15,
                  "rowStartIndex": 12,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 5,
                  "connectionType": 3,
                  "data": undefined,
                  "elementId": "3.3.2",
                  "gatewayId": "2.3",
                  "rowEndIndex": 17,
                  "rowStartIndex": 14,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 6,
                  "data": undefined,
                  "gatewayId": "3.3.2",
                  "rowEndIndex": 17,
                  "rowStartIndex": 14,
                  "type": 3,
                },
                Object {
                  "colStartIndex": 10,
                  "connectionType": 1,
                  "data": undefined,
                  "elementId": undefined,
                  "gatewayId": "3.3.2",
                  "rowEndIndex": 20,
                  "rowStartIndex": 14,
                  "type": 5,
                },
                Object {
                  "colEndIndex": 10,
                  "colStartIndex": 9,
                  "connectionType": 2,
                  "elementId": "4.3.2.2",
                  "rowEndIndex": 16,
                  "rowStartIndex": 15,
                  "type": 6,
                },
                Object {
                  "colEndIndex": 10,
                  "colStartIndex": 7,
                  "connectionType": 3,
                  "elementId": "3.3.2",
                  "rowEndIndex": 19,
                  "rowStartIndex": 16,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 7,
                  "connectionType": 2,
                  "data": undefined,
                  "elementId": "4.3.2.2",
                  "gatewayId": "3.3.2",
                  "rowEndIndex": 21,
                  "rowStartIndex": 20,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 8,
                  "data": undefined,
                  "elementId": "4.3.2.2",
                  "rowEndIndex": 21,
                  "rowStartIndex": 20,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 10,
                  "connectionType": 3,
                  "data": undefined,
                  "elementId": undefined,
                  "gatewayId": "3.3.2",
                  "rowEndIndex": 27,
                  "rowStartIndex": 21,
                  "type": 5,
                },
              ],
            }
        `);
    });
    it("consolidates multiple references to converging gateway", () => {
        const result = buildRenderData({
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "c" }] },
                b: { nextElementId: "c" },
                c: {}
            }
        });
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 8,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "data": undefined,
                  "gatewayId": "a",
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "colStartIndex": 3,
                  "connectionType": 1,
                  "data": undefined,
                  "elementId": "b",
                  "gatewayId": "a",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "data": undefined,
                  "elementId": "b",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "connectionType": 1,
                  "elementId": "b",
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 7,
                  "data": undefined,
                  "elementId": "c",
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 8,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 8,
                },
                Object {
                  "colEndIndex": 6,
                  "colStartIndex": 3,
                  "connectionType": 3,
                  "elementId": "a",
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "connectionType": 3,
                  "data": undefined,
                  "elementId": "c",
                  "gatewayId": "a",
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 7,
                  "data": undefined,
                  "elementId": "c",
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 8,
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 8,
                },
              ],
            }
        `);
    });

    const ref = (nextId: string): { nextElementId: string } => ({ nextElementId: nextId });
    it.each`
        testDescription            | flowElements
        ${"direct self-reference"} | ${{ a: ref("a") }}
        ${"nested one level"}      | ${{ a: ref("b"), b: ref("a") }}
        ${"nested six levels"}     | ${{ a: ref("b"), b: ref("c"), c: ref("d"), d: ref("e"), e: ref("f"), f: ref("g"), g: ref("a") }}
    `("throws error for circular reference – $testDescription", ({ flowElements }) => {
        const execution = (): never =>
            buildRenderData({
                elements: flowElements,
                firstElementId: "a"
            });
        expect(execution).toThrowError("Circular reference to element: a");
    });
    it("throws error for multiple references on non.neighbouring paths", () => {
        const flow = {
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }] },
                b: ref("f"),
                c: {},
                d: ref("f"),
                e: ref("b"),
                f: {}
            }
        };
        const execution = (): never => buildRenderData(flow);
        expect(execution).toThrowError("Multiple references only valid from neighbouring paths. Invalid references to: 'b', 'f'");
    });
});
