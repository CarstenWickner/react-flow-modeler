import * as React from "react";
import { HorizontalStroke } from "./HorizontalStroke";

export const ContentElement: React.FunctionComponent<{
    children: React.ReactNode;
}> = ({ children }) => (
    <>
        <div className="arrow" />
        <div className="flow-element content-element">{children}</div>
        <HorizontalStroke className="optional" />
    </>
);
