/**
 * Setup Token Issuer Account
 *
 * Creates an issuer account that mints USDC and EURC on testnet,
 * then sends a large supply to the distributor account.
 *
 * Flow:
 * 1. Generate issuer keypair and fund via Friendbot
 * 2. Distributor adds trustlines for the new issuer's USDC/EURC
 * 3. Issuer sends tokens to distributor
 *
 * Run: bun run scripts/setup-issuer.ts
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
  DISTRIBUTOR_SECRET_KEY,
  DISTRIBUTOR_PUBLIC_KEY,
  HORIZON_TESTNET_URL,
  FRIENDBOT_URL,
} from "./config";

const server = new Horizon.Server(HORIZON_TESTNET_URL);

const MINT_AMOUNT = "1000000"; // 1M of each token

async function addTrustline(keypair: Keypair, asset: Asset): Promise<string> {
  const account = await server.loadAccount(keypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

async function sendPayment(
  fromKeypair: Keypair,
  destination: string,
  asset: Asset,
  amount: string,
): Promise<string> {
  const account = await server.loadAccount(fromKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.payment({ destination, asset, amount }))
    .setTimeout(30)
    .build();

  tx.sign(fromKeypair);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

async function main() {
  if (!DISTRIBUTOR_SECRET_KEY || !DISTRIBUTOR_PUBLIC_KEY) {
    console.error("Distributor keys not set. Run setup-distributor.ts first.");
    process.exit(1);
  }

  console.log("=== Token Issuer Setup ===\n");

  // 1. Generate issuer keypair
  const issuerKeypair = Keypair.random();
  console.log(`Issuer Public Key:  ${issuerKeypair.publicKey()}`);
  console.log(`Issuer Secret Key:  ${issuerKeypair.secret()}\n`);

  // 2. Fund issuer via Friendbot
  console.log("Funding issuer via Friendbot...");
  const friendbotRes = await fetch(
    `${FRIENDBOT_URL}?addr=${issuerKeypair.publicKey()}`,
  );
  if (!friendbotRes.ok) {
    console.error("Failed to fund issuer:", await friendbotRes.text());
    process.exit(1);
  }
  console.log("  Issuer funded with 10,000 XLM\n");

  const distributorKeypair = Keypair.fromSecret(DISTRIBUTOR_SECRET_KEY);

  // 3. Remove old trustlines if they exist, then add new ones for our issuer
  const usdc = new Asset("USDC", issuerKeypair.publicKey());
  const eurc = new Asset("EURC", issuerKeypair.publicKey());

  console.log("Adding trustlines on distributor for new issuer...");

  // First, try to remove old trustlines (will fail silently if balance > 0 or not found)
  try {
    const oldAccount = await server.loadAccount(DISTRIBUTOR_PUBLIC_KEY);
    for (const balance of oldAccount.balances) {
      if (
        "asset_code" in balance &&
        (balance.asset_code === "USDC" || balance.asset_code === "EURC") &&
        "asset_issuer" in balance &&
        balance.asset_issuer !== issuerKeypair.publicKey()
      ) {
        if (parseFloat(balance.balance) === 0) {
          const oldAsset = new Asset(balance.asset_code, balance.asset_issuer);
          console.log(
            `  Removing old ${balance.asset_code} trustline (${balance.asset_issuer.slice(0, 8)}...)`,
          );
          const acc = await server.loadAccount(DISTRIBUTOR_PUBLIC_KEY);
          const removeTx = new TransactionBuilder(acc, {
            fee: "100",
            networkPassphrase: Networks.TESTNET,
          })
            .addOperation(
              Operation.changeTrust({ asset: oldAsset, limit: "0" }),
            )
            .setTimeout(30)
            .build();
          removeTx.sign(distributorKeypair);
          await server.submitTransaction(removeTx);
        }
      }
    }
  } catch (err) {
    // Ignore errors when removing old trustlines
    console.log(
      "  (skipped old trustline removal:",
      err instanceof Error ? err.message : "unknown",
      ")",
    );
  }

  const usdcHash = await addTrustline(distributorKeypair, usdc);
  console.log(`  USDC trustline added: ${usdcHash}`);

  const eurcHash = await addTrustline(distributorKeypair, eurc);
  console.log(`  EURC trustline added: ${eurcHash}\n`);

  // 4. Issuer sends tokens to distributor
  console.log(`Minting ${MINT_AMOUNT} USDC to distributor...`);
  const usdcPayHash = await sendPayment(
    issuerKeypair,
    DISTRIBUTOR_PUBLIC_KEY,
    usdc,
    MINT_AMOUNT,
  );
  console.log(`  TX: ${usdcPayHash}`);

  console.log(`Minting ${MINT_AMOUNT} EURC to distributor...`);
  const eurcPayHash = await sendPayment(
    issuerKeypair,
    DISTRIBUTOR_PUBLIC_KEY,
    eurc,
    MINT_AMOUNT,
  );
  console.log(`  TX: ${eurcPayHash}`);

  console.log("\n=== Done! ===\n");
  console.log("Add this to your .env.local:");
  console.log("---");
  console.log(`TOKEN_ISSUER_PUBLIC_KEY=${issuerKeypair.publicKey()}`);
  console.log(`TOKEN_ISSUER_SECRET_KEY=${issuerKeypair.secret()}`);
  console.log("---");
  console.log(
    `\nDistributor now holds ${MINT_AMOUNT} USDC and ${MINT_AMOUNT} EURC.`,
  );
}

main().catch((err) => {
  console.error("Issuer setup failed:", err);
  process.exit(1);
});
