import { TransactionBuilder, Keypair } from "@stellar/stellar-sdk";
import { getServer } from "./client";
import type { Network } from "./types";
import { NETWORKS } from "./constants";

export const BASE_FEE = "100";

export async function buildAndSubmitTransaction(
  secretKey: string,
  network: Network,
  addOperations: (builder: TransactionBuilder) => TransactionBuilder,
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const keypair = Keypair.fromSecret(secretKey);
    const server = getServer(network);
    const account = await server.loadAccount(keypair.publicKey());

    const builder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORKS[network].networkPassphrase,
    });

    const transaction = addOperations(builder).setTimeout(30).build();
    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);

    return { success: true, hash: result.hash };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transaction failed",
    };
  }
}
