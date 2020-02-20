import { StepNode, ConvergingGatewayNode, DivergingGatewayBranch, DivergingGatewayNode, StartNode } from "./ModelElement";

export interface FlowStep {
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
        elements: { [key: string]: FlowStep | FlowGatewayDiverging };
    };
    options?: {
        verticalAlign?: "top" | "middle" | "bottom";
    };
    renderStep: (target: StepNode) => React.ReactNode;
    renderGatewayConditionType?: (target: DivergingGatewayNode) => React.ReactNode;
    renderGatewayConditionValue?: (target: DivergingGatewayBranch) => React.ReactNode;
    onChange?: ({}: {
        changedFlow: {
            firstElementId: string;
            elements: { [key: string]: FlowStep | FlowGatewayDiverging };
        };
    }) => void;
    editActions?: {
        addDivergingBranch?: {
            className?: string;
            title?: string;
            isActionAllowed?: (gateway: DivergingGatewayNode) => boolean;
            getBranchConditionData?: (gateway: DivergingGatewayNode) => { [key: string]: unknown };
        };
        addFollowingStepElement?: {
            className?: string;
            title?: string;
            isActionAllowed?: (element: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode) => boolean;
            getStepData?: (leadingElement: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode) => { [key: string]: unknown };
        };
        addFollowingDivergingGateway?: {
            className?: string;
            title?: string;
            isActionAllowed?: (element: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode) => boolean;
            getGatewayData?: (leadingElement: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode) => { [key: string]: unknown };
            getBranchConditionData?: (
                leadingElement: StartNode | StepNode | DivergingGatewayBranch | ConvergingGatewayNode
            ) => Array<{ [key: string]: unknown }>;
        };
        changeNextElement?: {
            className?: string;
            title?: string;
            isActionAllowed?: (element: StepNode | DivergingGatewayBranch) => boolean;
        };
        removeElement?: {
            className?: string;
            title?: string;
            isActionAllowed?: (element: StepNode | DivergingGatewayBranch) => boolean;
        };
    };
}
