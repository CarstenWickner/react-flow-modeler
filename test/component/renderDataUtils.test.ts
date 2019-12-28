import { buildRenderData } from "../../src/component/renderDataUtils";
import { ConnectionType, ElementType } from "../../src/types/GridCellData";

describe("buildRenderData()", () => {
    it.each`
        testDescription             | input
        ${"no elements"}            | ${{ elements: {}, firstElementId: "0" }}
        ${"invalid firstElementId"} | ${{ elements: { a: {} }, firstElementId: "b" }}
    `("returns two cells: one start and one end if $testDescription provided", ({ input }) => {
        const result = buildRenderData(input);
        expect(result.columnCount).toBe(2);
        expect(result.gridCellData).toHaveLength(2);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Start
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            type: ElementType.End
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
        expect(result.columnCount).toBe(4);
        expect(result.gridCellData).toHaveLength(4);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Start
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Content,
            elementId: "one"
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Content,
            elementId: "two",
            data: { label: "text" }
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            type: ElementType.End
        });
    });
    it("can handle gateway without children", () => {
        const result = buildRenderData({
            elements: { one: { nextElements: [] } },
            firstElementId: "one"
        });
        expect(result.columnCount).toBe(4);
        expect(result.gridCellData).toHaveLength(6);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 3,
            type: ElementType.Start
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 3,
            type: ElementType.GatewayDiverging,
            gatewayId: "one"
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.First,
            gatewayId: "one",
            elementId: undefined,
            data: undefined
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            type: ElementType.End
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Last,
            gatewayId: "one",
            elementId: undefined,
            data: undefined
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 2,
            type: ElementType.End
        });
    });
    it("can handle gateway with single child", () => {
        const result = buildRenderData({
            elements: {
                one: { nextElements: [{ id: "two", conditionData: { label: "condition" } }] },
                two: { data: { label: "text" } }
            },
            firstElementId: "one"
        });
        expect(result.columnCount).toBe(5);
        expect(result.gridCellData).toHaveLength(8);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 3,
            type: ElementType.Start
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 3,
            type: ElementType.GatewayDiverging,
            gatewayId: "one"
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.First,
            gatewayId: "one",
            elementId: "two",
            data: { label: "condition" }
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Content,
            elementId: "two",
            data: { label: "text" }
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 1,
            type: ElementType.End
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Last,
            gatewayId: "one",
            elementId: undefined,
            data: undefined
        });
        expect(result.gridCellData[6]).toEqual({
            colStartIndex: 4,
            colEndIndex: 5,
            rowStartIndex: 2,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[7]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 2,
            type: ElementType.End
        });
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
        expect(result.columnCount).toBe(5);
        expect(result.gridCellData).toHaveLength(11);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 4,
            type: ElementType.Start
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 4,
            type: ElementType.GatewayDiverging,
            gatewayId: "one",
            data: { label: "text-one" }
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.First,
            gatewayId: "one",
            elementId: "two",
            data: { label: "cond-1" }
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Content,
            elementId: "two",
            data: { label: "text-two" }
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 1,
            type: ElementType.End
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Middle,
            gatewayId: "one",
            elementId: undefined,
            data: { label: "cond-2" }
        });
        expect(result.gridCellData[6]).toEqual({
            colStartIndex: 4,
            colEndIndex: 5,
            rowStartIndex: 2,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[7]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 2,
            type: ElementType.End
        });
        expect(result.gridCellData[8]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 3,
            rowEndIndex: 4,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Last,
            gatewayId: "one",
            elementId: "three",
            data: undefined
        });
        expect(result.gridCellData[9]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 3,
            rowEndIndex: 4,
            type: ElementType.Content,
            elementId: "three",
            data: { label: "text-three" }
        });
        expect(result.gridCellData[10]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 3,
            type: ElementType.End
        });
    });
    it("considers combination of content and gateway elements", () => {
        const result = buildRenderData({
            firstElementId: "1",
            elements: {
                "1": {
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
                "2.1": {
                    nextElementId: "3.1"
                },
                "2.3": {
                    nextElements: [
                        {},
                        {
                            id: "3.3.2"
                        }
                    ]
                },
                "3.1": {},
                "3.3.2": {
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
                "4.3.2.2": {}
            }
        });
        expect(result.columnCount).toBe(9);
        expect(result.gridCellData).toHaveLength(28);
        expect(result.gridCellData[0]).toEqual({
            colStartIndex: 1,
            rowStartIndex: 1,
            rowEndIndex: 7,
            type: ElementType.Start
        });
        expect(result.gridCellData[1]).toEqual({
            colStartIndex: 2,
            rowStartIndex: 1,
            rowEndIndex: 7,
            type: ElementType.GatewayDiverging,
            gatewayId: "1",
            data: undefined
        });
        expect(result.gridCellData[2]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.First,
            gatewayId: "1",
            elementId: "2.1",
            data: undefined
        });
        expect(result.gridCellData[3]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Content,
            elementId: "2.1",
            data: undefined
        });
        expect(result.gridCellData[4]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[5]).toEqual({
            colStartIndex: 6,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.Content,
            elementId: "3.1",
            data: undefined
        });
        expect(result.gridCellData[6]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 1,
            rowEndIndex: 2,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[7]).toEqual({
            colStartIndex: 8,
            colEndIndex: 9,
            rowStartIndex: 1,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[8]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 1,
            type: ElementType.End
        });
        expect(result.gridCellData[9]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 2,
            rowEndIndex: 3,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Middle,
            gatewayId: "1",
            elementId: undefined,
            data: undefined
        });
        expect(result.gridCellData[10]).toEqual({
            colStartIndex: 4,
            colEndIndex: 9,
            rowStartIndex: 2,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[11]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 2,
            type: ElementType.End
        });
        expect(result.gridCellData[12]).toEqual({
            colStartIndex: 3,
            rowStartIndex: 3,
            rowEndIndex: 7,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Last,
            gatewayId: "1",
            elementId: "2.3",
            data: undefined
        });
        expect(result.gridCellData[13]).toEqual({
            colStartIndex: 4,
            rowStartIndex: 3,
            rowEndIndex: 7,
            type: ElementType.GatewayDiverging,
            gatewayId: "2.3",
            data: undefined
        });
        expect(result.gridCellData[14]).toEqual({
            colStartIndex: 5,
            rowEndIndex: 4,
            rowStartIndex: 3,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.First,
            gatewayId: "2.3",
            elementId: undefined,
            data: undefined
        });
        expect(result.gridCellData[15]).toEqual({
            colStartIndex: 6,
            colEndIndex: 9,
            rowStartIndex: 3,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[16]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 3,
            type: ElementType.End
        });
        expect(result.gridCellData[17]).toEqual({
            colStartIndex: 5,
            rowStartIndex: 4,
            rowEndIndex: 7,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Last,
            gatewayId: "2.3",
            elementId: "3.3.2",
            data: undefined
        });
        expect(result.gridCellData[18]).toEqual({
            colStartIndex: 6,
            rowStartIndex: 4,
            rowEndIndex: 7,
            type: ElementType.GatewayDiverging,
            gatewayId: "3.3.2",
            data: undefined
        });
        expect(result.gridCellData[19]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 4,
            rowEndIndex: 5,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.First,
            gatewayId: "3.3.2",
            elementId: undefined,
            data: undefined
        });
        expect(result.gridCellData[20]).toEqual({
            colStartIndex: 8,
            colEndIndex: 9,
            rowStartIndex: 4,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[21]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 4,
            type: ElementType.End
        });
        expect(result.gridCellData[22]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 5,
            rowEndIndex: 6,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Middle,
            gatewayId: "3.3.2",
            elementId: "4.3.2.2",
            data: undefined
        });
        expect(result.gridCellData[23]).toEqual({
            colStartIndex: 8,
            rowStartIndex: 5,
            rowEndIndex: 6,
            type: ElementType.Content,
            elementId: "4.3.2.2",
            data: undefined
        });
        expect(result.gridCellData[24]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 5,
            type: ElementType.End
        });
        expect(result.gridCellData[25]).toEqual({
            colStartIndex: 7,
            rowStartIndex: 6,
            rowEndIndex: 7,
            type: ElementType.ConnectGatewayToElement,
            connectionType: ConnectionType.Last,
            gatewayId: "3.3.2",
            elementId: "4.3.2.3",
            data: undefined
        });
        expect(result.gridCellData[26]).toEqual({
            colStartIndex: 8,
            colEndIndex: 9,
            rowStartIndex: 6,
            type: ElementType.StrokeExtension
        });
        expect(result.gridCellData[27]).toEqual({
            colStartIndex: 9,
            rowStartIndex: 6,
            type: ElementType.End
        });
    });
});
