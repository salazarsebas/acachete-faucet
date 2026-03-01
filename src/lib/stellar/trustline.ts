import {
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Keypair,
} from "@stellar/stellar-sdk";
import { getServer } from "./client";
import type { Network } from "./types";
import { NETWORKS } from "./constants";

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
  try {
    const keypair = Keypair.fromSecret(secretKey);
    const server = getServer(network);
    const account = await server.loadAccount(keypair.publicKey());

    const asset = new Asset(assetCode, issuer);
    const networkPassphrase =
      network === "testnet"
        ? Networks.TESTNET
        : NETWORKS[network].networkPassphrase;

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase,
    })
      .addOperation(Operation.changeTrust({ asset }))
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);

    return { success: true, hash: result.hash };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
