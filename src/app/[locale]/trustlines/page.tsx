"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";

const USDC_TRUSTLINE_CODE = `import { TransactionBuilder, Operation, Asset, Networks, Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('YOUR_SECRET_KEY');
const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const account = await server.loadAccount(keypair.publicKey());

// Circle's official USDC issuer on testnet
const usdc = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET
})
  .addOperation(Operation.changeTrust({ asset: usdc }))
  .setTimeout(30)
  .build();

transaction.sign(keypair);
await server.submitTransaction(transaction);`;

const EURC_TRUSTLINE_CODE = `// Circle's official EURC issuer on testnet (different from USDC!)
const eurc = new Asset('EURC', 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO');

const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET
})
  .addOperation(Operation.changeTrust({ asset: eurc }))
  .setTimeout(30)
  .build();

transaction.sign(keypair);
await server.submitTransaction(transaction);`;

const SAC_TRANSFER_CODE = `import { rpc, TransactionBuilder, Asset, Operation, Address, nativeToScVal } from '@stellar/stellar-sdk';

// Derive the SAC contract ID from the classic asset
const usdc = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
const sacContractId = usdc.contractId(Networks.TESTNET);

// Build SAC transfer — no trustline needed on the contract
const tx = new TransactionBuilder(account, {
  fee: '1000000',
  networkPassphrase: Networks.TESTNET
})
  .addOperation(Operation.invokeContractFunction({
    contract: sacContractId,
    function: 'transfer',
    args: [
      new Address(senderPublicKey).toScVal(),    // from (G...)
      new Address(contractAddress).toScVal(),     // to (C...)
      nativeToScVal(BigInt(100_0000000), { type: 'i128' })  // amount
    ]
  }))
  .setTimeout(30)
  .build();

// Simulate to get resource footprint, then sign and submit
const prepared = await rpcServer.prepareTransaction(tx);
prepared.sign(keypair);
await rpcServer.sendTransaction(prepared);`;

const REMOVE_TRUSTLINE_CODE = `// Remove trustline (balance must be 0)
const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET
})
  .addOperation(Operation.changeTrust({
    asset,
    limit: '0'
  }))
  .setTimeout(30)
  .build();`;

function TrustlineDiagram({ t }: { t: (key: string) => string }) {
  return (
    <div className="py-2">
      <p className="text-muted-foreground mb-3 text-center text-xs font-medium">
        {t("diagramTitle")}
      </p>
      {/* Desktop: horizontal layout */}
      <div className="hidden items-center justify-center gap-3 sm:flex">
        <div className="border-border flex flex-col items-center gap-1.5 rounded-lg border p-3">
          <span className="text-xs font-medium">{t("diagramAccount")}</span>
          <Badge variant="outline" className="font-mono text-[10px]">
            G...xyz
          </Badge>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <Badge variant="secondary" className="text-[10px]">
            {t("diagramOperation")}
          </Badge>
          <ArrowRight className="text-muted-foreground size-4" />
        </div>

        <div className="border-border flex flex-col items-center gap-1.5 rounded-lg border p-3">
          <span className="text-xs font-medium">{t("diagramIssuer")}</span>
          <Badge variant="outline" className="font-mono text-[10px]">
            GBBD...LA5
          </Badge>
        </div>
      </div>

      {/* Mobile: vertical layout */}
      <div className="flex flex-col items-center gap-2 sm:hidden">
        <div className="border-border flex flex-col items-center gap-1.5 rounded-lg border p-3">
          <span className="text-xs font-medium">{t("diagramAccount")}</span>
          <Badge variant="outline" className="font-mono text-[10px]">
            G...xyz
          </Badge>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <Badge variant="secondary" className="text-[10px]">
            {t("diagramOperation")}
          </Badge>
          <ArrowRight className="text-muted-foreground size-4 rotate-90" />
        </div>

        <div className="border-border flex flex-col items-center gap-1.5 rounded-lg border p-3">
          <span className="text-xs font-medium">{t("diagramIssuer")}</span>
          <Badge variant="outline" className="font-mono text-[10px]">
            GBBD...LA5
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        <Check className="size-3.5 text-green-600 dark:text-green-400" />
        <span className="text-muted-foreground text-xs">
          {t("diagramResult")}
        </span>
      </div>
    </div>
  );
}

function ComparisonTable({ t }: { t: (key: string) => string }) {
  const rows = [
    {
      label: t("sorobanComparisonProtection"),
      classic: t("sorobanComparisonProtectionClassic"),
      soroban: t("sorobanComparisonProtectionSoroban"),
    },
    {
      label: t("sorobanComparisonCost"),
      classic: t("sorobanComparisonCostClassic"),
      soroban: t("sorobanComparisonCostSoroban"),
    },
    {
      label: t("sorobanComparisonMechanism"),
      classic: t("sorobanComparisonMechanismClassic"),
      soroban: t("sorobanComparisonMechanismSoroban"),
    },
    {
      label: t("sorobanComparisonAsset"),
      classic: t("sorobanComparisonAssetValue"),
      soroban: t("sorobanComparisonAssetValue"),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-2.5 py-2 text-left font-medium" />
            <th className="px-2.5 py-2 text-left font-medium">
              {t("sorobanComparisonClassic")}
            </th>
            <th className="px-2.5 py-2 text-left font-medium">
              {t("sorobanComparisonSoroban")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="text-muted-foreground px-2.5 py-2 font-medium">
                {row.label}
              </td>
              <td className="px-2.5 py-2">{row.classic}</td>
              <td className="px-2.5 py-2">{row.soroban}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WalletSteps({ steps }: { steps: string }) {
  return (
    <ol className="text-muted-foreground space-y-1.5 text-sm leading-relaxed">
      {steps.split("\n").map((step, i) => (
        <li key={i}>{step}</li>
      ))}
    </ol>
  );
}

export default function TrustlinesPage() {
  const t = useTranslations("trustlines");

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 px-4 pt-4 pb-8">
        <FadeIn className="w-full max-w-lg">
          <Card>
            <CardHeader className="pt-4 pb-2">
              <CardTitle>
                <h1 className="text-xl font-semibold">{t("pageTitle")}</h1>
              </CardTitle>
              <CardDescription>{t("pageSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <TrustlineDiagram t={t} />

              <StaggerContainer>
                <Accordion type="multiple" className="w-full">
                  <StaggerItem>
                    <AccordionItem value="what">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("whatAre")}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                        {t("whatAreContent")}
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>

                  <StaggerItem>
                    <AccordionItem value="why">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("whyExist")}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                        {t("whyExistContent")}
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>

                  <StaggerItem>
                    <AccordionItem value="reserve">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("reserveCost")}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                        {t("reserveCostContent")}
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>

                  <StaggerItem>
                    <AccordionItem value="how">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("walletGuides")}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {t("howToActivateContent")}
                        </p>
                        <Tabs defaultValue="freighter" className="w-full">
                          <TabsList className="w-full">
                            <TabsTrigger value="freighter" className="text-xs">
                              {t("walletFreighter")}
                            </TabsTrigger>
                            <TabsTrigger value="lobstr" className="text-xs">
                              {t("walletLobstr")}
                            </TabsTrigger>
                            <TabsTrigger value="lab" className="text-xs">
                              {t("walletLaboratory")}
                            </TabsTrigger>
                            <TabsTrigger value="sdk" className="text-xs">
                              {t("walletSDK")}
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="freighter" className="pt-3">
                            <WalletSteps steps={t("walletFreighterSteps")} />
                          </TabsContent>
                          <TabsContent value="lobstr" className="pt-3">
                            <WalletSteps steps={t("walletLobstrSteps")} />
                          </TabsContent>
                          <TabsContent value="lab" className="pt-3">
                            <WalletSteps steps={t("walletLaboratorySteps")} />
                          </TabsContent>
                          <TabsContent value="sdk" className="space-y-3 pt-3">
                            <div>
                              <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">
                                {t("usdcIssuerLabel")}
                              </p>
                              <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                                <code>{USDC_TRUSTLINE_CODE}</code>
                              </pre>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">
                                {t("eurcIssuerLabel")}
                              </p>
                              <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                                <code>{EURC_TRUSTLINE_CODE}</code>
                              </pre>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>

                  <StaggerItem>
                    <AccordionItem value="which">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("whichToTrust")}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                        {t("whichToTrustContent")}
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>

                  <StaggerItem>
                    <AccordionItem value="remove">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("removeTrustline")}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {t("removeTrustlineContent")}
                        </p>
                        <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                          <code>{REMOVE_TRUSTLINE_CODE}</code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>

                  <StaggerItem>
                    <AccordionItem value="soroban">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("sorobanTitle")}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {t("sorobanIntro")}
                        </p>

                        <div className="space-y-1.5">
                          <p className="text-sm font-medium">
                            {t("sorobanWhatIsSac")}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {t("sorobanWhatIsSacContent")}
                          </p>
                          <p className="text-muted-foreground border-l-2 pl-3 text-sm leading-relaxed italic">
                            {t("sorobanSameAsset")}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-sm font-medium">
                            {t("sorobanHowReceive")}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {t("sorobanHowReceiveContent")}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-sm font-medium">
                            {t("sorobanAntiSpam")}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {t("sorobanAntiSpamContent")}
                          </p>
                        </div>

                        <ComparisonTable t={t} />

                        <div>
                          <p className="text-muted-foreground mb-1.5 text-[11px] font-medium uppercase">
                            SAC Transfer
                          </p>
                          <pre className="bg-muted overflow-x-auto rounded-md p-2.5 text-[11px]">
                            <code>{SAC_TRANSFER_CODE}</code>
                          </pre>
                        </div>

                        <div className="bg-muted/50 rounded-md p-3">
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {t("sorobanFaucetNote")}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>

                  <StaggerItem>
                    <AccordionItem value="example">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("practicalExample")}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                        {t("practicalExampleContent")}
                      </AccordionContent>
                    </AccordionItem>
                  </StaggerItem>
                </Accordion>
              </StaggerContainer>

              <a
                href="https://developers.stellar.org/docs/build/apps/example-application-tutorial/manage-trust"
                target="_blank"
                rel="noopener noreferrer"
                className="border-border hover:bg-muted/50 mt-4 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{t("officialDocs")}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("officialDocsDescription")}
                  </p>
                </div>
                <ExternalLink className="text-muted-foreground size-4 shrink-0" />
              </a>
            </CardContent>
          </Card>
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
