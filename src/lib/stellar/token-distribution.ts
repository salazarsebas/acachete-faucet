import { Operation, Asset } from "@stellar/stellar-sdk";
import { buildAndSubmitTransaction } from "./transaction";
import type { Network, TokenCode } from "./types";
import { TESTNET_TOKENS, DISTRIBUTION_AMOUNT } from "./constants";

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

  const asset = new Asset(tokenInfo.code, tokenInfo.issuer!);
  const amount = DISTRIBUTION_AMOUNT[tokenCode];

  return buildAndSubmitTransaction(secretKey, network, (builder) =>
    builder.addOperation(
      Operation.payment({
        destination: destinationAddress,
        asset,
        amount,
      }),
    ),
  );
}
