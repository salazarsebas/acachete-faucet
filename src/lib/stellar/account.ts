import { getServer } from "./client";
import type { AccountBalance, Network } from "./types";

export async function accountExists(
  address: string,
  network: Network,
): Promise<boolean> {
  try {
    const server = getServer(network);
    await server.loadAccount(address);
    return true;
  } catch {
    return false;
  }
}

export async function getBalances(
  address: string,
  network: Network,
): Promise<AccountBalance[]> {
  const server = getServer(network);
  const account = await server.loadAccount(address);

  return account.balances.map((b) => {
    if (b.asset_type === "native") {
      return {
        assetType: "native",
        assetCode: "XLM",
        balance: b.balance,
      };
    }
    return {
      assetType: b.asset_type,
      assetCode: "asset_code" in b ? b.asset_code : undefined,
      assetIssuer: "asset_issuer" in b ? b.asset_issuer : undefined,
      balance: b.balance,
    };
  });
}

export async function hasTrustline(
  address: string,
  assetCode: string,
  issuer: string,
  network: Network,
): Promise<boolean> {
  try {
    const balances = await getBalances(address, network);
    return balances.some(
      (b) => b.assetCode === assetCode && b.assetIssuer === issuer,
    );
  } catch {
    return false;
  }
}
