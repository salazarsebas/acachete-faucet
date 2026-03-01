"use client";

import { useTranslations } from "next-intl";
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
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";

const TRUSTLINE_CODE_EXAMPLE = `import { TransactionBuilder, Operation, Asset, Networks, Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('YOUR_SECRET_KEY');
const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const account = await server.loadAccount(keypair.publicKey());

const asset = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET
})
  .addOperation(Operation.changeTrust({ asset }))
  .setTimeout(30)
  .build();

transaction.sign(keypair);
await server.submitTransaction(transaction);`;

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
                    <AccordionItem value="how">
                      <AccordionTrigger className="text-sm font-medium">
                        {t("howToActivate")}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {t("howToActivateContent")}
                        </p>
                        <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                          <code>{TRUSTLINE_CODE_EXAMPLE}</code>
                        </pre>
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
            </CardContent>
          </Card>
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
