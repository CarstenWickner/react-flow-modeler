import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

export const Gateway: React.FunctionComponent<{ type: "converging" } | { type: "diverging"; children?: React.ReactChild }> = ({ type, children }) => (
    <>
        <div className="arrow" />
        <div className={`flow-element gateway-element ${type}`} />
        {type === "diverging" && <HorizontalStroke>{children}</HorizontalStroke>}
    </>
);
