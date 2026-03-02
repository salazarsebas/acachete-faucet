import type { Network, NetworkConfig, TokenCode, TokenInfo } from "./types";

export const NETWORKS: Record<Network, NetworkConfig> = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    friendbotUrl: "https://friendbot.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    sorobanRpcUrl: "https://soroban-testnet.stellar.org",
    label: "Testnet",
  },
  futurenet: {
    horizonUrl: "https://horizon-futurenet.stellar.org",
    friendbotUrl: "https://friendbot-futurenet.stellar.org",
    networkPassphrase: "Test SDF Future Network ; October 2022",
    sorobanRpcUrl: "https://rpc-futurenet.stellar.org",
    label: "Futurenet",
  },
};

export const CIRCLE_USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
export const CIRCLE_EURC_ISSUER =
  "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO";

export const TESTNET_TOKENS: Record<TokenCode, TokenInfo> = {
  XLM: {
    code: "XLM",
    name: "Stellar Lumens",
    isNative: true,
    requiresTrustline: false,
    description: "Native token of the Stellar network",
  },
  USDC: {
    code: "USDC",
    name: "USD Coin",
    issuer: CIRCLE_USDC_ISSUER,
    isNative: false,
    requiresTrustline: true,
    description: "Circle's official USD stablecoin on Stellar testnet",
  },
  EURC: {
    code: "EURC",
    name: "Euro Coin",
    issuer: CIRCLE_EURC_ISSUER,
    isNative: false,
    requiresTrustline: true,
    description: "Circle's official EUR stablecoin on Stellar testnet",
  },
};

export const EXPLORER_BASE_URL = "https://stellar-explorer.acachete.xyz";

export function buildExplorerUrl(
  network: string,
  type: "account" | "tx",
  value: string,
): string {
  return `${EXPLORER_BASE_URL}/${network}/${type}/${value}`;
}

export const DISTRIBUTION_AMOUNT: Record<TokenCode, string> = {
  XLM: process.env.DISTRIBUTION_AMOUNT_XLM || "10000",
  USDC: process.env.DISTRIBUTION_AMOUNT_USDC || "100",
  EURC: process.env.DISTRIBUTION_AMOUNT_EURC || "100",
};

export const CAPTCHA_ANSWER = "acachete.xyz";

export const BATCH_FUND_MAX = 10;
