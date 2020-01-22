import { ElementType } from "./GridCellData";

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

export interface MenuOptions {
    className?: string;
    title?: string;
    isActionAllowed?: (contextType: ElementType, referenceElementId: string) => boolean;
}

export interface FlowModelerProps {
    flow: {
        firstElementId: string;
        elements: { [key: string]: FlowContent | FlowGatewayDiverging };
    };
    options?: {
        verticalAlign?: "top" | "middle" | "bottom";
        readOnly?: boolean;
        editActions?: {
            addDivergingBranch?: MenuOptions;
            addFollowingContentElement?: MenuOptions;
            addFollowingDivergingGateway?: MenuOptions;
            changeNextElement?: MenuOptions;
            removeElement?: MenuOptions;
        };
    };
    renderContent: (params: { elementData: { [key: string]: unknown }; contentElementId: string }) => React.ReactNode;
    renderGatewayConditionType?: (params: { gatewayData: { [key: string]: unknown }; gatewayElementId: string }) => React.ReactNode;
    renderGatewayConditionValue?: (params: {
        conditionData: { [key: string]: unknown };
        branchElementId: string;
        gatewayElementId: string;
    }) => React.ReactNode;
}
