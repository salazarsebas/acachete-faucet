export const DISTRIBUTOR_PUBLIC_KEY = process.env.DISTRIBUTOR_PUBLIC_KEY || "";
export const DISTRIBUTOR_SECRET_KEY = process.env.DISTRIBUTOR_SECRET_KEY || "";
export const DAILY_ACCUMULATION_LIMIT = parseInt(
  process.env.DAILY_ACCUMULATION_LIMIT || "5",
  10,
);
export const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";
