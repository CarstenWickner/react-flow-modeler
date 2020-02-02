export interface FlowElementReference {
    getId: () => string;
    getPrecedingElements: () => Array<FlowElementReference>;
    getFollowingElements: () => Array<FlowElementReference>;
}

export type PrecedingFlowElement = {
    element: FlowElement;
    // branch index in case of the preceding "element" being a diverging gateway, which of the element's following elements is this referring to
    branchIndex?: number;
};

export class FlowElement implements FlowElementReference {
    private id: string;
    private columnIndex: number;
    private rowCount: number;
    private precedingElements: Array<PrecedingFlowElement>;
    private followingElements: Array<FlowElement>;

    constructor(id: string) {
        this.id = id;
        this.precedingElements = [];
        this.followingElements = [];
    }

    getId(): string {
        return this.id;
    }

    getColumnIndex(): number {
        return this.columnIndex;
    }

    setColumnIndex(columnIndex: number): void {
        this.columnIndex = columnIndex;
    }

    getRowCount(): number {
        return this.rowCount;
    }

    setRowCount(rowCount: number): void {
        this.rowCount = rowCount;
    }

    getPrecedingElements(): Array<FlowElement> {
        return this.precedingElements.map(({ element }) => element);
    }

    getPrecedingElementsWithBranchIndex(): Array<PrecedingFlowElement> {
        return this.precedingElements;
    }

    addPrecedingElement(element: FlowElement, branchIndex?: number): void {
        this.precedingElements.push({ element, branchIndex });
    }

    getFollowingElements(): Array<FlowElement> {
        return this.followingElements;
    }

    addFollowingElement(element: FlowElement): void {
        this.followingElements.push(element);
    }
}
