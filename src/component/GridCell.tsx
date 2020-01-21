import * as React from "react";

export const GridCell: React.FunctionComponent<{
    colStartIndex: number;
    colEndIndex?: number;
    rowStartIndex: number;
    rowEndIndex?: number;
}> = ({ colStartIndex, colEndIndex, rowStartIndex, rowEndIndex, children }) => (
    <div
        className="grid-cell"
        style={
            {
                gridArea: `${rowStartIndex} / ${colStartIndex} / ${rowEndIndex || "auto"} / ${colEndIndex || "auto"}`
            } as React.CSSProperties
        }
    >
        {children}
    </div>
);
