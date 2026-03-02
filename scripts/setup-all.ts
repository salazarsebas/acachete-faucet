/**
 * Complete Faucet Setup
 *
 * Single script that bootstraps everything needed for the faucet:
 *
 *   1. Distributor account  → generates keypair, funds via Friendbot
 *   2. Trustlines           → adds trustlines to Circle's official USDC/EURC issuers
 *   3. XLM accumulation     → creates N temp accounts, funds each via
 *      Friendbot, transfers XLM to distributor
 *   4. Writes .env.local    → all keys + config ready to use
 *
 * Run:  bun run scripts/setup-all.ts
 *       bun run scripts/setup-all.ts --accounts 10
 *
 * Options:
 *   --accounts N   Number of temp accounts for XLM accumulation (default: 5)
 */

import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";
import { writeFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const FRIENDBOT_URL = "https://friendbot.stellar.org";

const CIRCLE_USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const CIRCLE_EURC_ISSUER =
  "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO";

const args = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const ACCUMULATION_COUNT = parseInt(getArg("accounts", "5"), 10);
const DISTRIBUTION_AMOUNT = "100";

const server = new Horizon.Server(HORIZON_URL);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fundFriendbot(publicKey: string): Promise<boolean> {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
  return res.ok;
}

async function submitTx(
  signerKeypair: Keypair,
  buildFn: (builder: TransactionBuilder) => TransactionBuilder,
): Promise<string> {
  const account = await server.loadAccount(signerKeypair.publicKey());
  const builder = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  });
  const tx = buildFn(builder).setTimeout(30).build();
  tx.sign(signerKeypair);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

function elapsed(start: number): string {
  return `${((Date.now() - start) / 1000).toFixed(1)}s`;
}

// ---------------------------------------------------------------------------
// Step 1: Distributor
// ---------------------------------------------------------------------------

async function createDistributor() {
  console.log("━━━ Step 1/3: Distributor Account ━━━\n");

  const keypair = Keypair.random();
  console.log(`  Public Key:  ${keypair.publicKey()}`);
  console.log(`  Secret Key:  ${keypair.secret()}`);

  process.stdout.write("  Funding via Friendbot...");
  const ok = await fundFriendbot(keypair.publicKey());
  if (!ok) {
    console.error(" FAILED");
    process.exit(1);
  }
  console.log(" OK (10,000 XLM)\n");

  return keypair;
}

// ---------------------------------------------------------------------------
// Step 2: Trustlines to Circle's Issuers
// ---------------------------------------------------------------------------

async function setupTrustlines(distributorKeypair: Keypair) {
  console.log("━━━ Step 2/3: Trustlines (Circle Issuers) ━━━\n");

  console.log(`  USDC Issuer: ${CIRCLE_USDC_ISSUER} (Circle)`);
  console.log(`  EURC Issuer: ${CIRCLE_EURC_ISSUER} (Circle)\n`);

  const usdc = new Asset("USDC", CIRCLE_USDC_ISSUER);
  const eurc = new Asset("EURC", CIRCLE_EURC_ISSUER);

  process.stdout.write("  Adding USDC trustline on distributor...");
  await submitTx(distributorKeypair, (b) =>
    b.addOperation(Operation.changeTrust({ asset: usdc })),
  );
  console.log(" OK");

  process.stdout.write("  Adding EURC trustline on distributor...");
  await submitTx(distributorKeypair, (b) =>
    b.addOperation(Operation.changeTrust({ asset: eurc })),
  );
  console.log(" OK\n");
}

// ---------------------------------------------------------------------------
// Step 3: XLM Accumulation
// ---------------------------------------------------------------------------

async function accumulateXLM(distributorPublicKey: string) {
  console.log(
    `━━━ Step 3/3: XLM Accumulation (${ACCUMULATION_COUNT} accounts) ━━━\n`,
  );

  let funded = 0;
  let transferred = 0;

  for (let i = 0; i < ACCUMULATION_COUNT; i++) {
    const keypair = Keypair.random();
    const label = `  [${i + 1}/${ACCUMULATION_COUNT}]`;

    process.stdout.write(`${label} Funding...`);
    const ok = await fundFriendbot(keypair.publicKey());
    if (!ok) {
      console.log(" FAIL");
      continue;
    }
    funded++;
    process.stdout.write(" OK → Transferring...");

    // Small delay for ledger close
    await new Promise((r) => setTimeout(r, 800));

    try {
      const hash = await submitTx(keypair, (b) =>
        b.addOperation(
          Operation.payment({
            destination: distributorPublicKey,
            asset: Asset.native(),
            amount: "9998",
          }),
        ),
      );
      transferred++;
      console.log(` OK (${hash.slice(0, 8)}...)`);
    } catch {
      console.log(" FAIL (transfer)");
    }
  }

  console.log(
    `\n  Result: ${transferred}/${ACCUMULATION_COUNT} accounts → ~${transferred * 9998} XLM\n`,
  );

  return { funded, transferred };
}

// ---------------------------------------------------------------------------
// Write .env.local
// ---------------------------------------------------------------------------

function writeEnvFile(distributorKeypair: Keypair) {
  const envPath = join(process.cwd(), ".env.local");
  const content = [
    `DISTRIBUTOR_PUBLIC_KEY=${distributorKeypair.publicKey()}`,
    `DISTRIBUTOR_SECRET_KEY=${distributorKeypair.secret()}`,
    `DISTRIBUTION_AMOUNT_XLM=${DISTRIBUTION_AMOUNT}`,
    `DISTRIBUTION_AMOUNT_USDC=${DISTRIBUTION_AMOUNT}`,
    `DISTRIBUTION_AMOUNT_EURC=${DISTRIBUTION_AMOUNT}`,
    `DAILY_ACCUMULATION_LIMIT=${ACCUMULATION_COUNT}`,
    "",
  ].join("\n");

  writeFileSync(envPath, content, "utf-8");
  console.log(`  .env.local written to ${envPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const start = Date.now();

  console.log("╔══════════════════════════════════════╗");
  console.log("║   Acachete Faucet — Full Setup       ║");
  console.log("╚══════════════════════════════════════╝\n");
  console.log(`  Accumulation accounts: ${ACCUMULATION_COUNT}`);
  console.log(`  USDC issuer (Circle):  ${CIRCLE_USDC_ISSUER}`);
  console.log(`  EURC issuer (Circle):  ${CIRCLE_EURC_ISSUER}`);
  console.log(`  Distribution amount:   ${DISTRIBUTION_AMOUNT}\n`);

  // Step 1
  const distributorKeypair = await createDistributor();

  // Step 2
  await setupTrustlines(distributorKeypair);

  // Step 3
  const { transferred } = await accumulateXLM(distributorKeypair.publicKey());

  // Write env
  console.log("━━━ Writing .env.local ━━━\n");
  writeEnvFile(distributorKeypair);

  // Summary
  const totalXLM = 10000 + transferred * 9998;
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   Setup Complete                     ║");
  console.log("╚══════════════════════════════════════╝\n");
  console.log(`  Distributor:  ${distributorKeypair.publicKey()}`);
  console.log(`  XLM balance:  ~${totalXLM.toLocaleString()} XLM`);
  console.log(`  Time:         ${elapsed(start)}`);
  console.log(`\n  Next steps:`);
  console.log(`  1. Go to https://faucet.circle.com`);
  console.log(`  2. Fund distributor with USDC and EURC`);
  console.log(`  3. Run \`bun run dev\` to start the faucet\n`);
}

main().catch((err) => {
  console.error("\nSetup failed:", err);
  process.exit(1);
});
