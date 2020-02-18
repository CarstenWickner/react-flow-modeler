import { buildRenderData } from "../../src/component/renderDataUtils";
import { ElementType } from "../../src/types/ModelElement";

describe("buildRenderData()", () => {
    it.each`
        testDescription             | input
        ${"no elements"}            | ${{ elements: {}, firstElementId: "0" }}
        ${"invalid firstElementId"} | ${{ elements: { a: {} }, firstElementId: "b" }}
    `("returns two cells: one start and one end if $testDescription provided", ({ input }) => {
        const result = buildRenderData(input, "top");
        expect(result).toMatchObject({
            columnCount: 2,
            gridCellData: [
                {
                    colStartIndex: 1,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.StartNode
                },
                {
                    colStartIndex: 2,
                    rowStartIndex: 1,
                    rowEndIndex: 2,
                    type: ElementType.EndNode
                }
            ]
        });
    });
    it("includes content elements", () => {
        const result = buildRenderData(
            {
                elements: {
                    one: { nextElementId: "two" },
                    two: { data: { label: "text" } }
                },
                firstElementId: "one"
            },
            "top"
        );
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 4,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "columnIndex": 1,
                  "followingElement": ContentNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "columnIndex": 2,
                  "data": undefined,
                  "followingElement": ContentNode { "id": "two" },
                  "id": "one",
                  "precedingElement": StartNode,
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "data": Object {
                    "label": "text",
                  },
                  "followingElement": EndNode,
                  "id": "two",
                  "precedingElement": ContentNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "precedingElement": ContentNode { "id": "two" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 7,
                },
              ],
            }
        `);
    });
    it("can handle gateway without children", () => {
        const result = buildRenderData(
            {
                elements: { one: { nextElements: [] } },
                firstElementId: "one"
            },
            "top"
        );
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 6,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "columnIndex": 1,
                  "followingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "columnIndex": 2,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  ],
                  "id": "one",
                  "precedingElement": StartNode,
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 1,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": 5,
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "connectionType": 1,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "followingElement": EndNode,
                  "precedingBranches": Array [
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  ],
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "precedingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 7,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": 5,
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "connectionType": 3,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 6,
                },
              ],
            }
        `);
    });
    it("can handle gateway with single child", () => {
        const result = buildRenderData(
            {
                elements: {
                    one: { nextElements: [{ id: "two", conditionData: { label: "condition" } }] },
                    two: { data: { label: "text" } }
                },
                firstElementId: "one"
            },
            "top"
        );
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 7,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "columnIndex": 1,
                  "followingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "columnIndex": 2,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ContentNode { "id": "two" } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  ],
                  "id": "one",
                  "precedingElement": StartNode,
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 1,
                  "data": Object {
                    "label": "condition",
                  },
                  "followingElement": ContentNode { "id": "two" },
                  "precedingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "data": Object {
                    "label": "text",
                  },
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "id": "two",
                  "precedingElement": DivergingGatewayBranch { "followingElement": ContentNode { "id": "two" } },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 1,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": ContentNode { "id": "two" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "followingElement": EndNode,
                  "precedingBranches": Array [
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  ],
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 7,
                  "columnIndex": 7,
                  "precedingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 7,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": 6,
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "connectionType": 3,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 6,
                },
              ],
            }
        `);
    });
    it("includes data for gateway and its children", () => {
        const result = buildRenderData(
            {
                elements: {
                    one: {
                        data: { label: "text-one" },
                        nextElements: [{ id: "two", conditionData: { label: "cond-1" } }, { conditionData: { label: "cond-2" } }, { id: "three" }]
                    },
                    two: { data: { label: "text-two" } },
                    three: { data: { label: "text-three" } }
                },
                firstElementId: "one"
            },
            "top"
        );
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 7,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "columnIndex": 1,
                  "followingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "columnIndex": 2,
                  "data": Object {
                    "label": "text-one",
                  },
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ContentNode { "id": "two" } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                    DivergingGatewayBranch { "followingElement": ContentNode { "id": "three" } },
                  ],
                  "id": "one",
                  "precedingElement": StartNode,
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 1,
                  "data": Object {
                    "label": "cond-1",
                  },
                  "followingElement": ContentNode { "id": "two" },
                  "precedingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "data": Object {
                    "label": "text-two",
                  },
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "id": "two",
                  "precedingElement": DivergingGatewayBranch { "followingElement": ContentNode { "id": "two" } },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 1,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": ContentNode { "id": "two" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "followingElement": EndNode,
                  "precedingBranches": Array [
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  ],
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 7,
                  "columnIndex": 7,
                  "precedingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 7,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 2,
                  "data": Object {
                    "label": "cond-2",
                  },
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": 6,
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "connectionType": 2,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "branchIndex": 2,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": ContentNode { "id": "three" },
                  "precedingElement": DivergingGatewayNode { "id": "one" },
                  "rowCount": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 3,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "data": Object {
                    "label": "text-three",
                  },
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "id": "three",
                  "precedingElement": DivergingGatewayBranch { "followingElement": ContentNode { "id": "three" } },
                  "rowCount": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 3,
                  "type": 2,
                },
                Object {
                  "branchIndex": 2,
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 3,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": ContentNode { "id": "three" },
                  "rowCount": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 3,
                  "type": 6,
                },
              ],
            }
        `);
    });
    it("considers combination of content and gateway elements", () => {
        const result = buildRenderData(
            {
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
            },
            "top"
        );
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 11,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "columnIndex": 1,
                  "followingElement": DivergingGatewayNode { "id": "1" },
                  "rowCount": 6,
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "columnIndex": 2,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ContentNode { "id": "2.1" } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                    DivergingGatewayBranch { "followingElement": DivergingGatewayNode { "id": "2.3" } },
                  ],
                  "id": "1",
                  "precedingElement": StartNode,
                  "rowCount": 6,
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 1,
                  "data": undefined,
                  "followingElement": ContentNode { "id": "2.1" },
                  "precedingElement": DivergingGatewayNode { "id": "1" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "data": undefined,
                  "followingElement": ContentNode { "id": "3.1" },
                  "id": "2.1",
                  "precedingElement": DivergingGatewayBranch { "followingElement": ContentNode { "id": "2.1" } },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "id": "3.1",
                  "precedingElement": ContentNode { "id": "2.1" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": 10,
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "connectionType": 1,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": ContentNode { "id": "3.1" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 10,
                  "columnIndex": 10,
                  "followingElement": EndNode,
                  "precedingBranches": Array [
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  ],
                  "rowCount": 6,
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 11,
                  "columnIndex": 11,
                  "precedingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "rowCount": 6,
                  "rowEndIndex": 7,
                  "rowStartIndex": 1,
                  "type": 7,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 2,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "1" },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": 10,
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "connectionType": 2,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "branchIndex": 2,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": DivergingGatewayNode { "id": "2.3" },
                  "precedingElement": DivergingGatewayNode { "id": "1" },
                  "rowCount": 4,
                  "rowEndIndex": 7,
                  "rowStartIndex": 3,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                    DivergingGatewayBranch { "followingElement": DivergingGatewayNode { "id": "3.3.2" } },
                  ],
                  "id": "2.3",
                  "precedingElement": DivergingGatewayBranch { "followingElement": DivergingGatewayNode { "id": "2.3" } },
                  "rowCount": 4,
                  "rowEndIndex": 7,
                  "rowStartIndex": 3,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 1,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "2.3" },
                  "rowCount": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 3,
                  "type": 5,
                },
                Object {
                  "branchIndex": 2,
                  "colEndIndex": 10,
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "connectionType": 2,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 3,
                  "type": 6,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": DivergingGatewayNode { "id": "3.3.2" },
                  "precedingElement": DivergingGatewayNode { "id": "2.3" },
                  "rowCount": 3,
                  "rowEndIndex": 7,
                  "rowStartIndex": 4,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                    DivergingGatewayBranch { "followingElement": ContentNode { "id": "4.3.2.2" } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  ],
                  "id": "3.3.2",
                  "precedingElement": DivergingGatewayBranch { "followingElement": DivergingGatewayNode { "id": "3.3.2" } },
                  "rowCount": 3,
                  "rowEndIndex": 7,
                  "rowStartIndex": 4,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 7,
                  "columnIndex": 7,
                  "connectionType": 1,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "3.3.2" },
                  "rowCount": 1,
                  "rowEndIndex": 5,
                  "rowStartIndex": 4,
                  "type": 5,
                },
                Object {
                  "branchIndex": 3,
                  "colEndIndex": 10,
                  "colStartIndex": 8,
                  "columnIndex": 8,
                  "connectionType": 2,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 5,
                  "rowStartIndex": 4,
                  "type": 6,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 7,
                  "columnIndex": 7,
                  "connectionType": 2,
                  "data": undefined,
                  "followingElement": ContentNode { "id": "4.3.2.2" },
                  "precedingElement": DivergingGatewayNode { "id": "3.3.2" },
                  "rowCount": 1,
                  "rowEndIndex": 6,
                  "rowStartIndex": 5,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 8,
                  "columnIndex": 8,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "id": "4.3.2.2",
                  "precedingElement": DivergingGatewayBranch { "followingElement": ContentNode { "id": "4.3.2.2" } },
                  "rowCount": 1,
                  "rowEndIndex": 6,
                  "rowStartIndex": 5,
                  "type": 2,
                },
                Object {
                  "branchIndex": 4,
                  "colEndIndex": 10,
                  "colStartIndex": 9,
                  "columnIndex": 9,
                  "connectionType": 2,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": ContentNode { "id": "4.3.2.2" },
                  "rowCount": 1,
                  "rowEndIndex": 6,
                  "rowStartIndex": 5,
                  "type": 6,
                },
                Object {
                  "branchIndex": 2,
                  "colEndIndex": undefined,
                  "colStartIndex": 7,
                  "columnIndex": 7,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "3.3.2" },
                  "rowCount": 1,
                  "rowEndIndex": 7,
                  "rowStartIndex": 6,
                  "type": 5,
                },
                Object {
                  "branchIndex": 5,
                  "colEndIndex": 10,
                  "colStartIndex": 8,
                  "columnIndex": 8,
                  "connectionType": 3,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 7,
                  "rowStartIndex": 6,
                  "type": 6,
                },
              ],
            }
        `);
    });
    it("consolidates multiple references to converging gateway", () => {
        const result = buildRenderData(
            {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{ id: "b" }, { id: "c" }] },
                    b: { nextElementId: "c" },
                    c: {}
                }
            },
            "top"
        );
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 8,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "columnIndex": 1,
                  "followingElement": DivergingGatewayNode { "id": "a" },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "columnIndex": 2,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ContentNode { "id": "b" } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } } },
                  ],
                  "id": "a",
                  "precedingElement": StartNode,
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 1,
                  "data": undefined,
                  "followingElement": ContentNode { "id": "b" },
                  "precedingElement": DivergingGatewayNode { "id": "a" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                  "id": "b",
                  "precedingElement": DivergingGatewayBranch { "followingElement": ContentNode { "id": "b" } },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": 6,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 1,
                  "followingElement": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } },
                  "precedingElement": ContentNode { "id": "b" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "followingElement": ContentNode { "id": "c" },
                  "precedingBranches": Array [
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                  ],
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 7,
                  "columnIndex": 7,
                  "data": undefined,
                  "followingElement": EndNode,
                  "id": "c",
                  "precedingElement": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 2,
                },
                Object {
                  "colStartIndex": 8,
                  "columnIndex": 8,
                  "precedingElement": ContentNode { "id": "c" },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 7,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                  "precedingElement": DivergingGatewayNode { "id": "a" },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": 6,
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "connectionType": 3,
                  "followingElement": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } } },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 6,
                },
              ],
            }
        `);
    });
    it("can handle overlapping gateways (2)", () => {
        const result = buildRenderData(
            {
                firstElementId: "a",
                elements: {
                    a: { nextElements: [{ id: "b" }, { id: "c" }] },
                    b: { nextElements: [{}, { id: "c" }] },
                    c: {}
                }
            },
            "top"
        );
        expect(result).toMatchInlineSnapshot(`
            Object {
              "columnCount": 11,
              "gridCellData": Array [
                Object {
                  "colStartIndex": 1,
                  "columnIndex": 1,
                  "followingElement": DivergingGatewayNode { "id": "a" },
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 1,
                },
                Object {
                  "colStartIndex": 2,
                  "columnIndex": 2,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": DivergingGatewayNode { "id": "b" } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } } },
                  ],
                  "id": "a",
                  "precedingElement": StartNode,
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 1,
                  "data": undefined,
                  "followingElement": DivergingGatewayNode { "id": "b" },
                  "precedingElement": DivergingGatewayNode { "id": "a" },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "data": undefined,
                  "followingBranches": Array [
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                    DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } } },
                  ],
                  "id": "b",
                  "precedingElement": DivergingGatewayBranch { "followingElement": DivergingGatewayNode { "id": "b" } },
                  "rowCount": 2,
                  "rowEndIndex": 3,
                  "rowStartIndex": 1,
                  "type": 3,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": undefined,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 1,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "precedingElement": DivergingGatewayNode { "id": "b" },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 5,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": 10,
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "connectionType": 1,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } } },
                  "rowCount": 1,
                  "rowEndIndex": 2,
                  "rowStartIndex": 1,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 10,
                  "columnIndex": 10,
                  "followingElement": EndNode,
                  "precedingBranches": Array [
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  ],
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 11,
                  "columnIndex": 11,
                  "precedingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "rowCount": 3,
                  "rowEndIndex": 4,
                  "rowStartIndex": 1,
                  "type": 7,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 5,
                  "columnIndex": 5,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                  "precedingElement": DivergingGatewayNode { "id": "b" },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 5,
                },
                Object {
                  "branchIndex": 0,
                  "colEndIndex": 7,
                  "colStartIndex": 6,
                  "columnIndex": 6,
                  "connectionType": 1,
                  "followingElement": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } } },
                  "rowCount": 1,
                  "rowEndIndex": 3,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "colStartIndex": 7,
                  "columnIndex": 7,
                  "followingElement": ContentNode { "id": "c" },
                  "precedingBranches": Array [
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                    ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                  ],
                  "rowCount": 2,
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 4,
                },
                Object {
                  "colStartIndex": 8,
                  "columnIndex": 8,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": EndNode } },
                  "id": "c",
                  "precedingElement": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } },
                  "rowCount": 2,
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 2,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": 10,
                  "colStartIndex": 9,
                  "columnIndex": 9,
                  "connectionType": 3,
                  "followingElement": ConvergingGatewayNode { "followingElement": EndNode },
                  "precedingElement": ContentNode { "id": "c" },
                  "rowCount": 2,
                  "rowEndIndex": 4,
                  "rowStartIndex": 2,
                  "type": 6,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": undefined,
                  "colStartIndex": 3,
                  "columnIndex": 3,
                  "connectionType": 3,
                  "data": undefined,
                  "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } },
                  "precedingElement": DivergingGatewayNode { "id": "a" },
                  "rowCount": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 3,
                  "type": 5,
                },
                Object {
                  "branchIndex": 1,
                  "colEndIndex": 7,
                  "colStartIndex": 4,
                  "columnIndex": 4,
                  "connectionType": 3,
                  "followingElement": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } },
                  "precedingElement": DivergingGatewayBranch { "followingElement": ConvergingGatewayBranch { "gateway": ConvergingGatewayNode { "followingElement": ContentNode { "id": "c" } } } },
                  "rowCount": 1,
                  "rowEndIndex": 4,
                  "rowStartIndex": 3,
                  "type": 6,
                },
              ],
            }
        `);
    });

    const ref = (nextId: string): { nextElementId: string } => ({ nextElementId: nextId });
    it("throws error for circular reference", () => {
        const execution = (): never =>
            buildRenderData(
                {
                    elements: { a: ref("a") },
                    firstElementId: "a"
                },
                "top"
            );
        expect(execution).toThrowError("Circular reference to element: a");
    });
    it("throws error for multiple references on non-neighbouring paths", () => {
        const execution = (): never =>
            buildRenderData(
                {
                    firstElementId: "a",
                    elements: {
                        a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }] },
                        b: ref("f"),
                        c: {},
                        d: ref("f"),
                        e: ref("b"),
                        f: {}
                    }
                },
                "top"
            );
        expect(execution).toThrowError("Multiple references only valid from neighbouring paths. Invalid references to: 'b', 'f'");
    });
});
