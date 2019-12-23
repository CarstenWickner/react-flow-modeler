import * as React from "react";

import { HorizontalStroke } from "./HorizontalStroke";

export const ElementToGatewayConnector: React.FunctionComponent<{
    connectionType: "first" | "middle" | "last";
}> = ({ connectionType }) => <HorizontalStroke outgoingConnection={connectionType} />;
