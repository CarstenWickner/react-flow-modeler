import { ContentNode, ConvergingGatewayNode, DivergingGatewayBranch, DivergingGatewayNode, StartNode } from "../model/ModelElement";

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
        firstElementId: string | null;
        elements: { [key: string]: FlowContent | FlowGatewayDiverging };
    };
    options?: {
        verticalAlign?: "top" | "middle" | "bottom";
        editActions?: {
            addDivergingBranch?: {
                className?: string;
                title?: string;
                isActionAllowed?: (gateway: DivergingGatewayNode) => boolean;
            };
            addFollowingContentElement?: {
                className?: string;
                title?: string;
                isActionAllowed?: (element: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode) => boolean;
            };
            addFollowingDivergingGateway?: {
                className?: string;
                title?: string;
                isActionAllowed?: (element: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode) => boolean;
            };
            changeNextElement?: {
                className?: string;
                title?: string;
                isActionAllowed?: (element: ContentNode | DivergingGatewayBranch) => boolean;
            };
            removeElement?: {
                className?: string;
                title?: string;
                isActionAllowed?: (element: ContentNode | DivergingGatewayBranch) => boolean;
            };
        };
    };
    renderContent: (target: ContentNode) => React.ReactNode;
    renderGatewayConditionType?: (target: DivergingGatewayNode) => React.ReactNode;
    renderGatewayConditionValue?: (target: DivergingGatewayBranch) => React.ReactNode;
    onChange?: ({
        changedFlow
    }: {
        changedFlow: {
            firstElementId: string;
            elements: { [key: string]: FlowContent | FlowGatewayDiverging };
        };
    }) => void;
}
