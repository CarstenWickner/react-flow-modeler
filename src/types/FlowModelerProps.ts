export interface FlowContent {
    nextElementId?: string;
    data?: { [key: string]: unknown };
}

export interface FlowGatewayDiverging {
    nextElements: Array<{
        id?: string;
        conditionData?: { [key: string]: unknown };
    }>;
    data?: { [key: string]: unknown };
}

export interface FlowModelerProps {
    flow: {
        firstElementId: string;
        elements: { [key: string]: FlowContent | FlowGatewayDiverging };
    };
    options?: {
        verticalAlign?: "top" | "middle" | "bottom";
    };
    renderContent: (elementData: { [key: string]: unknown }, contentElementId: string) => React.ReactChild;
    renderGatewayConditionType?: (gatewayData: { [key: string]: unknown }, gatewayElementId: string) => React.ReactChild;
    renderGatewayConditionValue?: (conditionData: { [key: string]: unknown }, branchElementId: string, gatewayElementId: string) => React.ReactChild;
}
