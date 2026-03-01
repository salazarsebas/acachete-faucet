import {
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Keypair,
} from "@stellar/stellar-sdk";
import { getServer } from "./client";
import type { Network, TokenCode } from "./types";
import { NETWORKS, TESTNET_TOKENS, DISTRIBUTION_AMOUNT } from "./constants";

export async function distributeToken(
  destinationAddress: string,
  tokenCode: TokenCode,
  network: Network,
): Promise<{ success: boolean; hash?: string; error?: string }> {
  const secretKey = process.env.DISTRIBUTOR_SECRET_KEY;
  if (!secretKey) {
    return {
      success: false,
      error: "Distributor account not configured",
    };
  }

  const tokenInfo = TESTNET_TOKENS[tokenCode];
  if (!tokenInfo || tokenInfo.isNative) {
    return {
      success: false,
      error: "Token distribution only available for non-native assets",
    };
  }

  try {
    const keypair = Keypair.fromSecret(secretKey);
    const server = getServer(network);
    const account = await server.loadAccount(keypair.publicKey());

    const asset = new Asset(tokenInfo.code, tokenInfo.issuer!);
    const amount = DISTRIBUTION_AMOUNT[tokenCode];
    const networkPassphrase =
      network === "testnet"
        ? Networks.TESTNET
        : NETWORKS[network].networkPassphrase;

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset,
          amount,
        }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);

    return { success: true, hash: result.hash };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Distribution failed",
    };
  }
}
