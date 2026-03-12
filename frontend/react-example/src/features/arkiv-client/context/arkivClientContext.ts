import type { PublicArkivClient } from "@arkiv-network/sdk";
import { createContext } from "react";

export const arkivClientContext = createContext<{
  client: PublicArkivClient | null;
  entityCreator: `0x${string}`;
  protocolVersion: string;
}>({
  client: null,
  entityCreator: "0x",
  protocolVersion: "",
});
