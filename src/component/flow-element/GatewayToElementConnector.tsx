import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

export const GatewayToElementConnector: React.FunctionComponent<{
    connectionType: "first" | "middle" | "last";
    children?: React.ReactChild;
}> = ({ connectionType, children }) => <HorizontalStroke incomingConnection={connectionType}>{children}</HorizontalStroke>;
