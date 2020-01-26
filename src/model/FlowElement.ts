export interface FlowElementReference {
    getId: () => string;
    getPrecedingElements: () => Array<FlowElementReference>;
    getFollowingElements: () => Array<FlowElementReference>;
}

export class FlowElement implements FlowElementReference {
    private id: string;
    private columnIndex: number;
    private rowCount: number;
    private precedingElements: Array<FlowElement>;
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
        return this.precedingElements;
    }

    addPrecedingElement(element: FlowElement): void {
        this.precedingElements.push(element);
    }

    getFollowingElements(): Array<FlowElement> {
        return this.followingElements;
    }

    addFollowingElement(element: FlowElement): void {
        this.followingElements.push(element);
    }
}
