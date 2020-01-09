import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";
import { ConnectionType } from "../../types/GridCellData";

export const ElementToGatewayConnector: React.FunctionComponent<{
    connectionType: ConnectionType;
}> = ({ connectionType }) => <HorizontalStroke outgoingConnection={connectionType} />;
