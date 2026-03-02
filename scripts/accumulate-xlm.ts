/**
 * XLM Accumulation Script
 *
 * Generates N keypairs, funds each via Friendbot (10,000 XLM each),
 * then transfers all XLM to the distributor account.
 *
 * Run: bun run scripts/accumulate-xlm.ts
 */

import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";
import {
  DISTRIBUTOR_PUBLIC_KEY,
  DAILY_ACCUMULATION_LIMIT,
  HORIZON_TESTNET_URL,
  FRIENDBOT_URL,
} from "./config";

const server = new Horizon.Server(HORIZON_TESTNET_URL);

async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function transferXLM(
  fromKeypair: Keypair,
  toPublicKey: string,
  amount: string,
): Promise<string | null> {
  try {
    const account = await server.loadAccount(fromKeypair.publicKey());

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: toPublicKey,
          asset: Asset.native(),
          amount,
        }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(fromKeypair);
    const result = await server.submitTransaction(transaction);
    return result.hash;
  } catch (error) {
    console.error(
      `Transfer failed from ${fromKeypair.publicKey()}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function main() {
  if (!DISTRIBUTOR_PUBLIC_KEY) {
    console.error(
      "DISTRIBUTOR_PUBLIC_KEY not set. Run setup-distributor.ts first.",
    );
    process.exit(1);
  }

  const limit = DAILY_ACCUMULATION_LIMIT;
  console.log(`=== XLM Accumulation Script ===`);
  console.log(`Distributor: ${DISTRIBUTOR_PUBLIC_KEY}`);
  console.log(`Accounts to generate: ${limit}\n`);

  let totalFunded = 0;
  let totalTransferred = 0;

  for (let i = 0; i < limit; i++) {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();

    console.log(`[${i + 1}/${limit}] Generated: ${publicKey}`);

    // Fund via Friendbot
    const funded = await fundWithFriendbot(publicKey);
    if (!funded) {
      console.log(`  [FAIL] Could not fund via Friendbot`);
      continue;
    }
    console.log(`  [OK] Funded with 10,000 XLM`);
    totalFunded++;

    // Wait a moment for the ledger to close
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Transfer XLM to distributor (leave 2 XLM for fees/reserves)
    const transferAmount = "9998";
    const hash = await transferXLM(
      keypair,
      DISTRIBUTOR_PUBLIC_KEY,
      transferAmount,
    );

    if (hash) {
      console.log(`  [OK] Transferred ${transferAmount} XLM → TX: ${hash}`);
      totalTransferred++;
    } else {
      console.log(`  [FAIL] Transfer failed`);
    }

    console.log();
  }

  console.log(`=== Summary ===`);
  console.log(`Funded: ${totalFunded}/${limit}`);
  console.log(`Transferred: ${totalTransferred}/${limit}`);
  console.log(`Approximate XLM accumulated: ${totalTransferred * 9998} XLM`);
}

main().catch((err) => {
  console.error("Accumulation failed:", err);
  process.exit(1);
});
