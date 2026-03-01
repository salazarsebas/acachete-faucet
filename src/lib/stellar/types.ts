export type Network = "testnet" | "futurenet";

export type AddressType = "G" | "C" | "invalid";

export type TokenCode = "XLM" | "USDC" | "EURC";

export interface TokenInfo {
  code: TokenCode;
  name: string;
  issuer?: string;
  isNative: boolean;
  requiresTrustline: boolean;
  description: string;
}

export interface NetworkConfig {
  horizonUrl: string;
  friendbotUrl: string;
  networkPassphrase: string;
  label: string;
}

export interface FundingResult {
  success: boolean;
  message: string;
  hash?: string;
  explorerUrl?: string;
}

export interface AccountBalance {
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
  balance: string;
}

export interface NetworkStatus {
  online: boolean;
  lastLedger: number;
  protocolVersion: number;
  timestamp: string;
}

export interface BatchFundResult {
  address: string;
  success: boolean;
  hash?: string;
  error?: string;
}
