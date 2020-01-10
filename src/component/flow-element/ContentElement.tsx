import * as React from "react";

export const ContentElement: React.FunctionComponent<{
    children: React.ReactNode;
}> = ({ children }) => (
    <>
        <div className="arrow" />
        <div className="flow-element content-element">{children}</div>
    </>
);
