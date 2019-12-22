import { buildRenderData } from "../../src/component/renderDataUtils";

describe("buildRenderData()", () => {
    it.each`
        testDescription             | input
        ${"no elements"}            | ${{ elements: [], firstElementId: "0" }}
        ${"invalid firstElementId"} | ${{ elements: [{ id: "a" }], firstElementId: "b" }}
    `("returns two cells: one start and one end if $testDescription provided", ({ input }) => {
        const result = buildRenderData(input);
        expect(result.columnCount).toBe(2);
        expect(result.gridCellData).toHaveLength(2);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "start"
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            elementType: "end"
        });
    });
    it("includes content elements", () => {
        const result = buildRenderData({
            elements: [
                { id: "one", nextElementId: "two" },
                { id: "two", data: { label: "text" } }
            ],
            firstElementId: "one"
        });
        expect(result.columnCount).toBe(4);
        expect(result.gridCellData).toHaveLength(4);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "start"
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "content",
            elementId: "one"
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "content",
            elementId: "two",
            elementData: { label: "text" }
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            elementType: "end"
        });
    });
    it("can handle gateway without children", () => {
        const result = buildRenderData({
            elements: [{ id: "one", nextElements: [] }],
            firstElementId: "one"
        });
        expect(result.columnCount).toBe(4);
        expect(result.gridCellData).toHaveLength(6);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 3,
            elementType: "start"
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 3,
            elementType: "gateway",
            elementId: "one"
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "gateway-connector",
            connectionType: "first",
            elementId: undefined,
            elementData: undefined
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            elementType: "end"
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            elementType: "gateway-connector",
            connectionType: "last",
            elementId: undefined,
            elementData: undefined
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 2,
            elementType: "end"
        });
    });
    it("can handle gateway with single child", () => {
        const result = buildRenderData({
            elements: [
                { id: "one", nextElements: [{ id: "two", conditionData: { label: "condition" } }] },
                { id: "two", data: { label: "text" } }
            ],
            firstElementId: "one"
        });
        expect(result.columnCount).toBe(5);
        expect(result.gridCellData).toHaveLength(8);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 3,
            elementType: "start"
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 3,
            elementType: "gateway",
            elementId: "one"
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "gateway-connector",
            connectionType: "first",
            elementId: "two",
            elementData: { label: "condition" }
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "content",
            elementId: "two",
            elementData: { label: "text" }
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 1,
            elementType: "end"
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            elementType: "gateway-connector",
            connectionType: "last",
            elementId: undefined,
            elementData: undefined
        });
        expect(result.gridCellData[6]).toEqual({
            colStartIndex: 4,
            colEndIndex: 5,
            rowStartIndex: 2,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[7]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 2,
            elementType: "end"
        });
    });
    it("includes data for gateway and its children", () => {
        const result = buildRenderData({
            elements: [
                {
                    id: "one",
                    data: { label: "text-one" },
                    nextElements: [{ id: "two", conditionData: { label: "cond-1" } }, { conditionData: { label: "cond-2" } }, { id: "three" }]
                },
                { id: "two", data: { label: "text-two" } },
                { id: "three", data: { label: "text-three" } }
            ],
            firstElementId: "one"
        });
        expect(result.columnCount).toBe(5);
        expect(result.gridCellData).toHaveLength(11);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 4,
            elementType: "start"
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 4,
            elementType: "gateway",
            elementId: "one",
            elementData: { label: "text-one" }
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "gateway-connector",
            connectionType: "first",
            elementId: "two",
            elementData: { label: "cond-1" }
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "content",
            elementId: "two",
            elementData: { label: "text-two" }
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 1,
            elementType: "end"
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            elementId: undefined,
            elementType: "gateway-connector",
            connectionType: "middle",
            elementData: { label: "cond-2" }
        });
        expect(result.gridCellData[6]).toEqual({
            colStartIndex: 4,
            colEndIndex: 5,
            rowStartIndex: 2,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[7]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 2,
            elementType: "end"
        });
        expect(result.gridCellData[8]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 3,
            rowEndIndex: 4,
            elementType: "gateway-connector",
            connectionType: "last",
            elementId: "three",
            elementData: undefined
        });
        expect(result.gridCellData[9]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 3,
            rowEndIndex: 4,
            elementType: "content",
            elementId: "three",
            elementData: { label: "text-three" }
        });
        expect(result.gridCellData[10]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 3,
            elementType: "end"
        });
    });
    it("considers combination of content and gateway elements", () => {
        const result = buildRenderData({
            firstElementId: "1",
            elements: [
                {
                    id: "1",
                    nextElements: [
                        {
                            id: "2.1"
                        },
                        {},
                        {
                            id: "2.3"
                        }
                    ]
                },
                {
                    id: "2.1",
                    nextElementId: "3.1"
                },
                {
                    id: "2.3",
                    nextElements: [
                        {},
                        {
                            id: "3.3.2"
                        }
                    ]
                },
                {
                    id: "3.1"
                },
                {
                    id: "3.3.2",
                    nextElements: [
                        {},
                        {
                            id: "4.3.2.2"
                        },
                        {
                            id: "4.3.2.3"
                        }
                    ]
                },
                {
                    id: "4.3.2.2"
                }
            ]
        });
        expect(result.columnCount).toBe(9);
        expect(result.gridCellData).toHaveLength(28);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 7,
            elementType: "start"
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 7,
            elementType: "gateway",
            elementId: "1",
            elementData: undefined
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "gateway-connector",
            connectionType: "first",
            elementId: "2.1",
            elementData: undefined
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "content",
            elementId: "2.1",
            elementData: undefined
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 6,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "content",
            elementId: "3.1",
            elementData: undefined
        });
        expect(result.gridCellData[6]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 1,
            rowEndIndex: 2,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[7]).toEqual({
            colStartIndex: 8,
            colEndIndex: 9,
            rowStartIndex: 1,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[8]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 1,
            elementType: "end"
        });
        expect(result.gridCellData[9]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            elementType: "gateway-connector",
            connectionType: "middle",
            elementId: undefined,
            elementData: undefined
        });
        expect(result.gridCellData[10]).toEqual({
            colStartIndex: 4,
            colEndIndex: 9,
            rowStartIndex: 2,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[11]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 2,
            elementType: "end"
        });
        expect(result.gridCellData[12]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 3,
            rowEndIndex: 7,
            elementType: "gateway-connector",
            connectionType: "last",
            elementId: "2.3",
            elementData: undefined
        });
        expect(result.gridCellData[13]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 3,
            rowEndIndex: 7,
            elementType: "gateway",
            elementId: "2.3",
            elementData: undefined
        });
        expect(result.gridCellData[14]).toEqual({
            colStartIndex: 5,
            rowEndIndex: 4,
            rowStartIndex: 3,
            elementType: "gateway-connector",
            connectionType: "first",
            elementId: undefined,
            elementData: undefined
        });
        expect(result.gridCellData[15]).toEqual({
            colStartIndex: 6,
            colEndIndex: 9,
            rowStartIndex: 3,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[16]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 3,
            elementType: "end"
        });
        expect(result.gridCellData[17]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 4,
            rowEndIndex: 7,
            elementType: "gateway-connector",
            connectionType: "last",
            elementId: "3.3.2",
            elementData: undefined
        });
        expect(result.gridCellData[18]).toEqual({
            colStartIndex: 6,
            rowStartIndex: 4,
            rowEndIndex: 7,
            elementType: "gateway",
            elementId: "3.3.2",
            elementData: undefined
        });
        expect(result.gridCellData[19]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 4,
            rowEndIndex: 5,
            elementType: "gateway-connector",
            connectionType: "first",
            elementId: undefined,
            elementData: undefined
        });
        expect(result.gridCellData[20]).toEqual({
            colStartIndex: 8,
            colEndIndex: 9,
            rowStartIndex: 4,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[21]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 4,
            elementType: "end"
        });
        expect(result.gridCellData[22]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 5,
            rowEndIndex: 6,
            elementType: "gateway-connector",
            connectionType: "middle",
            elementId: "4.3.2.2",
            elementData: undefined
        });
        expect(result.gridCellData[23]).toEqual({
            colStartIndex: 8,
            rowStartIndex: 5,
            rowEndIndex: 6,
            elementType: "content",
            elementId: "4.3.2.2",
            elementData: undefined
        });
        expect(result.gridCellData[24]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 5,
            elementType: "end"
        });
        expect(result.gridCellData[25]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 6,
            rowEndIndex: 7,
            elementType: "gateway-connector",
            connectionType: "last",
            elementId: "4.3.2.3",
            elementData: undefined
        });
        expect(result.gridCellData[26]).toEqual({
            colStartIndex: 8,
            colEndIndex: 9,
            rowStartIndex: 6,
            elementType: "stroke-extension"
        });
        expect(result.gridCellData[27]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 6,
            elementType: "end"
        });
    });
});
