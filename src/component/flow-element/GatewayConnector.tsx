import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

export const GatewayConnector: React.FunctionComponent<{
    incomingConnection: "first" | "middle" | "last";
    children?: React.ReactChild;
}> = ({ incomingConnection, children }) => <HorizontalStroke incomingConnection={incomingConnection}>{children}</HorizontalStroke>;
