export interface FlowElement {
    id: string;
    data?: { [key: string]: unknown };
}

export interface FlowContent extends FlowElement {
    nextElementId?: string;
}

export interface FlowGateway extends FlowElement {
    nextElements: Array<{
        id?: string;
        conditionData?: { [key: string]: unknown };
    }>;
}

export interface FlowModelerProps {
    flow: {
        elements: Array<FlowContent | FlowGateway>;
        firstElementId: string;
    };
    renderContent: (data: { [key: string]: unknown }, contentElementId: string) => React.ReactChild;
    renderGatewayConditionType?: (data: { [key: string]: unknown }, gatewayElementId: string) => React.ReactChild;
    renderGatewayConditionValue?: (data: { [key: string]: unknown }, branchElementId: string) => React.ReactChild;
}
