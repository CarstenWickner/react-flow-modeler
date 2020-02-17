import { ContentNode, ConvergingGatewayNode, DivergingGatewayBranch, DivergingGatewayNode, StartNode } from "./ModelElement";

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
    };
    renderContent: (target: ContentNode) => React.ReactNode;
    renderGatewayConditionType?: (target: DivergingGatewayNode) => React.ReactNode;
    renderGatewayConditionValue?: (target: DivergingGatewayBranch) => React.ReactNode;
    onChange?: ({}: {
        changedFlow: {
            firstElementId: string;
            elements: { [key: string]: FlowContent | FlowGatewayDiverging };
        };
    }) => void;
    editActions?: {
        addDivergingBranch?: {
            className?: string;
            title?: string;
            isActionAllowed?: (gateway: DivergingGatewayNode) => boolean;
            getBranchConditionData?: (gateway: DivergingGatewayNode) => { [key: string]: unknown };
        };
        addFollowingContentElement?: {
            className?: string;
            title?: string;
            isActionAllowed?: (element: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode) => boolean;
            getContentData?: (leadingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode) => { [key: string]: unknown };
        };
        addFollowingDivergingGateway?: {
            className?: string;
            title?: string;
            isActionAllowed?: (element: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode) => boolean;
            getGatewayData?: (leadingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode) => { [key: string]: unknown };
            getBranchConditionData?: (
                leadingElement: StartNode | ContentNode | DivergingGatewayBranch | ConvergingGatewayNode
            ) => Array<{ [key: string]: unknown }>;
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
}
