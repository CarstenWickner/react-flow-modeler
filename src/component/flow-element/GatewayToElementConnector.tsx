import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";
import { ConnectionType } from "../../types/GridCellData";

export const GatewayToElementConnector: React.FunctionComponent<{
    connectionType: ConnectionType;
    children?: React.ReactChild;
}> = ({ connectionType, children }) => <HorizontalStroke incomingConnection={connectionType}>{children}</HorizontalStroke>;
