import { addBranch } from "../../../src/model/action/addBranch";

import { createMinimalElementTreeStructure } from "../../../src/model/modelUtils";
import { DivergingGatewayNode } from "../../../src/types/ModelElement";

describe("addBranch()", () => {
    it("can handle gateway before end", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: {
                a: { nextElements: [{}, {}] }
            }
        };
        const gateway = createMinimalElementTreeStructure(originalFlow).start.followingElement as DivergingGatewayNode;
        const { changedFlow } = addBranch(originalFlow, gateway, { x: "y" });
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: {
                a: { nextElements: [{}, {}, { id: null, conditionData: { x: "y" } }] }
            }
        });
    });
    it("targets bottom-most converging gateway", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "b" }, { id: "c" }] },
                b: { nextElementId: "c" },
                c: {}
            }
        };
        const gateway = createMinimalElementTreeStructure(originalFlow).start.followingElement as DivergingGatewayNode;
        const { changedFlow } = addBranch(originalFlow, gateway, undefined);
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "b" }, { id: "c" }, { id: "c", conditionData: undefined }] },
                b: { nextElementId: "c" },
                c: {}
            }
        });
    });
    it("targets closest converging gateway", () => {
        const originalFlow = {
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "c" }] },
                b: { nextElementId: "d" },
                c: { nextElementId: "d" },
                d: {}
            }
        };
        const gateway = createMinimalElementTreeStructure(originalFlow).start.followingElement as DivergingGatewayNode;
        const { changedFlow } = addBranch(originalFlow, gateway, { x: "y" });
        expect(changedFlow).not.toBe(originalFlow);
        expect(changedFlow).toEqual({
            firstElementId: "a",
            elements: {
                a: { nextElements: [{ id: "b" }, { id: "c" }, { id: "d", conditionData: { x: "y" } }] },
                b: { nextElementId: "d" },
                c: { nextElementId: "d" },
                d: {}
            }
        });
    });
});
