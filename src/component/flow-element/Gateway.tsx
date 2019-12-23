import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

export const Gateway: React.FunctionComponent<{
    children?: React.ReactChild;
}> = ({ children }) => (
    <>
        <div className="arrow" />
        <div className="flow-element gateway-element" />
        <HorizontalStroke>{children}</HorizontalStroke>
    </>
);
