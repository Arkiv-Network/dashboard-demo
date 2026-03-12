import { useState } from "react";
import { getArkivClient } from "../helpers/getArkivClient";
import { arkivClientContext } from "../context/arkivClientContext";
import { ENTITY_CREATOR, PROTOCOL_VERSION } from "../constants";

export function ArkivClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(getArkivClient);

  return (
    <arkivClientContext.Provider
      value={{
        client,
        entityCreator: ENTITY_CREATOR,
        protocolVersion: PROTOCOL_VERSION,
      }}
    >
      {children}
    </arkivClientContext.Provider>
  );
}
