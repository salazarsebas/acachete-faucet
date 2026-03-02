/**
 * Setup Distributor Account
 *
 * Generates a new Stellar keypair, funds it via Friendbot,
 * and prints the keys for .env.local configuration.
 *
 * Run: bun run scripts/setup-distributor.ts
 */

import { Keypair } from "@stellar/stellar-sdk";
import { FRIENDBOT_URL } from "./config";

async function main() {
  console.log("=== Stellar Distributor Account Setup ===\n");

  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();

  console.log("Generated new keypair:");
  console.log(`  Public Key:  ${publicKey}`);
  console.log(`  Secret Key:  ${secretKey}\n`);

  console.log("Funding account via Friendbot...");
  const response = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fund account:", errorText);
    process.exit(1);
  }

  const data = await response.json();
  console.log(`Account funded! TX hash: ${data.hash}\n`);

  console.log("Add these to your .env.local:");
  console.log("---");
  console.log(`DISTRIBUTOR_PUBLIC_KEY=${publicKey}`);
  console.log(`DISTRIBUTOR_SECRET_KEY=${secretKey}`);
  console.log(`DISTRIBUTION_AMOUNT_XLM=100`);
  console.log(`DISTRIBUTION_AMOUNT_USDC=100`);
  console.log(`DISTRIBUTION_AMOUNT_EURC=100`);
  console.log(`DAILY_ACCUMULATION_LIMIT=5`);
  console.log("---");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
