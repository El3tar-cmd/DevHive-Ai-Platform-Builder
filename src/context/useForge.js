import { useContext } from "react";
import { ForgeContext } from "./ForgeContextCore.js";

export function useForge() {
  const ctx = useContext(ForgeContext);
  if (!ctx) throw new Error("useForge must be used within <ForgeProvider>");
  return ctx;
}
