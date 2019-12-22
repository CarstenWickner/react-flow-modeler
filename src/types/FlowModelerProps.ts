export interface FlowContent {
    nextElementId?: string;
    data?: { [key: string]: unknown };
}

export interface FlowGateway {
    nextElements: Array<{
        id?: string;
        conditionData?: { [key: string]: unknown };
    }>;
    data?: { [key: string]: unknown };
}

export interface FlowModelerProps {
    flow: {
        firstElementId: string;
        elements: { [key: string]: FlowContent | FlowGateway };
    };
    renderContent: (elementData: { [key: string]: unknown }, contentElementId: string) => React.ReactChild;
    renderGatewayConditionType?: (gatewayData: { [key: string]: unknown }, gatewayElementId: string) => React.ReactChild;
    renderGatewayConditionValue?: (conditionData: { [key: string]: unknown }, branchElementId: string) => React.ReactChild;
}
