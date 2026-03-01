import type { Network, NetworkConfig, TokenCode, TokenInfo } from "./types";

export const NETWORKS: Record<Network, NetworkConfig> = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    friendbotUrl: "https://friendbot.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    label: "Testnet",
  },
  futurenet: {
    horizonUrl: "https://horizon-futurenet.stellar.org",
    friendbotUrl: "https://friendbot-futurenet.stellar.org",
    networkPassphrase: "Test SDF Future Network ; October 2022",
    label: "Futurenet",
  },
};

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
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    isNative: false,
    requiresTrustline: true,
    description: "Circle's USD stablecoin on Stellar testnet",
  },
  EURC: {
    code: "EURC",
    name: "Euro Coin",
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    isNative: false,
    requiresTrustline: true,
    description: "Circle's EUR stablecoin on Stellar testnet",
  },
};

export const EXPLORER_BASE_URL = "https://stellar-explorer.acachete.xyz";

export const DISTRIBUTION_AMOUNT: Record<TokenCode, string> = {
  XLM: process.env.DISTRIBUTION_AMOUNT_XLM || "10000",
  USDC: process.env.DISTRIBUTION_AMOUNT_USDC || "100",
  EURC: process.env.DISTRIBUTION_AMOUNT_EURC || "100",
};

export const CAPTCHA_ANSWER = "acachete.xyz";

export const BATCH_FUND_MAX = 10;
