import { createContext } from "react";

export const SettingCtx = createContext<{
  solanaCluster: "mainnet-beta" | "devnet" | "testnet";
}>({ solanaCluster: "devnet" });
