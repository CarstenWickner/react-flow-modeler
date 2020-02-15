import { FlowContent, FlowGatewayDiverging } from "../../src/types/FlowModelerProps";

export const cont = (nextId: string): FlowContent => ({ nextElementId: nextId });

export const divGw = (...nextIds: Array<string>): FlowGatewayDiverging => ({ nextElements: nextIds.map((id) => ({ id })) });
