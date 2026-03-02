import {
  rpc,
  Keypair,
  TransactionBuilder,
  Asset,
  Operation,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import type { Network } from "./types";
import { NETWORKS, DISTRIBUTION_AMOUNT, TESTNET_TOKENS } from "./constants";
import type { TokenCode } from "./types";

// ---------------------------------------------------------------------------
// Singleton Soroban RPC servers (mirrors client.ts pattern)
// ---------------------------------------------------------------------------

const servers: Partial<Record<Network, rpc.Server>> = {};

function getRpcServer(network: Network): rpc.Server {
  if (!servers[network]) {
    servers[network] = new rpc.Server(NETWORKS[network].sorobanRpcUrl);
  }
  return servers[network]!;
}

// ---------------------------------------------------------------------------
// SAC token distribution to C... (contract) addresses
// ---------------------------------------------------------------------------

export async function distributeTokenViaSAC(
  destination: string,
  tokenCode: TokenCode,
  network: Network,
): Promise<{ success: boolean; hash?: string; error?: string }> {
  const secretKey = process.env.DISTRIBUTOR_SECRET_KEY;
  if (!secretKey) {
    return { success: false, error: "Distributor account not configured" };
  }

  const tokenInfo = TESTNET_TOKENS[tokenCode];
  if (!tokenInfo || tokenInfo.isNative || !tokenInfo.issuer) {
    return { success: false, error: "Invalid token for SAC distribution" };
  }

  try {
    const keypair = Keypair.fromSecret(secretKey);
    const rpcServer = getRpcServer(network);
    const networkPassphrase = NETWORKS[network].networkPassphrase;

    // Derive the SAC contract ID from the classic asset
    const asset = new Asset(tokenInfo.code, tokenInfo.issuer);
    const sacContractId = asset.contractId(networkPassphrase);

    // Build the SAC transfer(from, to, amount) invocation
    const amount = BigInt(
      parseFloat(DISTRIBUTION_AMOUNT[tokenCode]) * 10_000_000,
    );

    const account = await rpcServer.getAccount(keypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: "1000000",
      networkPassphrase,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: sacContractId,
          function: "transfer",
          args: [
            new Address(keypair.publicKey()).toScVal(),
            new Address(destination).toScVal(),
            nativeToScVal(amount, { type: "i128" }),
          ],
        }),
      )
      .setTimeout(30)
      .build();

    // Simulate to get the footprint + resource fees
    const prepared = await rpcServer.prepareTransaction(tx);

    // Sign with distributor key
    prepared.sign(keypair);

    // Submit and poll for result
    const sendResult = await rpcServer.sendTransaction(prepared);

    if (sendResult.status === "ERROR") {
      return {
        success: false,
        error: `Transaction submission failed: ${sendResult.status}`,
      };
    }

    // Poll for completion
    let getResult = await rpcServer.getTransaction(sendResult.hash);
    while (getResult.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, 1000));
      getResult = await rpcServer.getTransaction(sendResult.hash);
    }

    if (getResult.status === "SUCCESS") {
      return { success: true, hash: sendResult.hash };
    }

    return {
      success: false,
      error: `Transaction failed with status: ${getResult.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "SAC transfer failed",
    };
  }
}
