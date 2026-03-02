import { Operation, Asset } from "@stellar/stellar-sdk";
import { buildAndSubmitTransaction } from "./transaction";
import type { Network } from "./types";

export function buildTrustlineTransaction(
  sourcePublicKey: string,
  assetCode: string,
  issuer: string,
  network: Network,
) {
  return {
    assetCode,
    issuer,
    network,
    sourcePublicKey,
  };
}

export async function createAndSubmitTrustline(
  secretKey: string,
  assetCode: string,
  issuer: string,
  network: Network,
): Promise<{ success: boolean; hash?: string; error?: string }> {
  const asset = new Asset(assetCode, issuer);

  return buildAndSubmitTransaction(secretKey, network, (builder) =>
    builder.addOperation(Operation.changeTrust({ asset })),
  );
}
