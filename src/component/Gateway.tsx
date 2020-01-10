import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

export const Gateway: React.FunctionComponent<{ type: "converging"; children?: never } | { type: "diverging"; children?: React.ReactNode }> = ({
    type,
    children
}) => (
    <>
        <div className="arrow" />
        <div className={`flow-element gateway-element ${type}`} />
        {type === "converging" && <HorizontalStroke className="optional" />}
        {type === "diverging" && <HorizontalStroke>{children}</HorizontalStroke>}
    </>
);
