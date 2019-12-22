import * as React from "react";

export const GridCell: React.FunctionComponent<{
    colStartIndex: number;
    colEndIndex?: number;
    rowStartIndex: number;
    rowEndIndex?: number;
    children: React.ReactChild;
}> = ({ colStartIndex, colEndIndex, rowStartIndex, rowEndIndex, children }) => (
    <div
        className="grid-cell"
        style={
            {
                "grid-area": `${rowStartIndex} / ${colStartIndex} / ${rowEndIndex || "auto"} / ${colEndIndex || "auto"}`
            } as React.CSSProperties
        }
    >
        {children}
    </div>
);
