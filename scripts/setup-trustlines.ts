/**
 * Setup Trustlines to Circle's Official Issuers
 *
 * Adds USDC and EURC trustlines on the distributor account pointing
 * to Circle's official testnet issuers. No custom minting needed —
 * fund the distributor via faucet.circle.com after running this.
 *
 * Run: bun run scripts/setup-trustlines.ts
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
} from "./config";

const CIRCLE_USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const CIRCLE_EURC_ISSUER =
  "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO";

const server = new Horizon.Server(HORIZON_TESTNET_URL);

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

async function main() {
  if (!DISTRIBUTOR_SECRET_KEY || !DISTRIBUTOR_PUBLIC_KEY) {
    console.error("Distributor keys not set. Run setup-distributor.ts first.");
    process.exit(1);
  }

  console.log("=== Trustline Setup (Circle Issuers) ===\n");
  console.log(`Distributor: ${DISTRIBUTOR_PUBLIC_KEY}`);
  console.log(`USDC Issuer: ${CIRCLE_USDC_ISSUER} (Circle)`);
  console.log(`EURC Issuer: ${CIRCLE_EURC_ISSUER} (Circle)\n`);

  const distributorKeypair = Keypair.fromSecret(DISTRIBUTOR_SECRET_KEY);

  const usdc = new Asset("USDC", CIRCLE_USDC_ISSUER);
  const eurc = new Asset("EURC", CIRCLE_EURC_ISSUER);

  console.log("Adding USDC trustline (Circle issuer)...");
  const usdcHash = await addTrustline(distributorKeypair, usdc);
  console.log(`  TX: ${usdcHash}`);

  console.log("Adding EURC trustline (Circle issuer)...");
  const eurcHash = await addTrustline(distributorKeypair, eurc);
  console.log(`  TX: ${eurcHash}`);

  console.log("\n=== Done! ===\n");
  console.log("Next steps:");
  console.log("  1. Go to https://faucet.circle.com");
  console.log(`  2. Fund ${DISTRIBUTOR_PUBLIC_KEY} with USDC and EURC`);
  console.log("  3. Run `bun run dev` to start the faucet\n");
}

main().catch((err) => {
  console.error("Trustline setup failed:", err);
  process.exit(1);
});
