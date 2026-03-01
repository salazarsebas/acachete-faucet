import { Horizon } from "@stellar/stellar-sdk";
import type { Network } from "./types";
import { NETWORKS } from "./constants";

const servers: Partial<Record<Network, Horizon.Server>> = {};

export function getServer(network: Network): Horizon.Server {
  if (!servers[network]) {
    servers[network] = new Horizon.Server(NETWORKS[network].horizonUrl);
  }
  return servers[network]!;
}
