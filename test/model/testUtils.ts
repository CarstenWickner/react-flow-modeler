import { FlowStep, FlowGatewayDiverging } from "../../src/types/FlowModelerProps";

export const step = (nextId: string): FlowStep => ({ nextElementId: nextId });

export const divGw = (...nextIds: Array<string>): FlowGatewayDiverging => ({ nextElements: nextIds.map((id) => ({ id })) });
