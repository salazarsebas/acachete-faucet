"use client";

import { useState } from "react";
import Script from "next/script";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FaucetForm } from "@/components/faucet/faucet-form";
import { TrustlineGuideSummary } from "@/components/education/trustline-guide";
import { NetworkStatus } from "@/components/dashboard/network-status";
import { BalanceChecker } from "@/components/dashboard/balance-checker";
import { FundingHistory } from "@/components/faucet/funding-history";
import { BatchFunding } from "@/components/faucet/batch-funding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Network } from "@/lib/stellar/types";

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stellar Testnet Faucet",
  description:
    "Free multi-token testnet distributor for Stellar blockchain development",
  url: "https://faucet-stellar.acachete.xyz",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  author: {
    "@type": "Organization",
    name: "Acachete Labs",
    url: "https://acachete.xyz",
  },
};

export default function Home() {
  const [network] = useState<Network>("testnet");

  return (
    <>
      <Script
        id="json-ld-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <div className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 px-4 pt-2 pb-8">
          <div className="w-full max-w-md">
            <NetworkStatus network={network} />
          </div>

          <section className="w-full max-w-md">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="single" className="flex-1">
                  Faucet
                </TabsTrigger>
                <TabsTrigger value="batch" className="flex-1">
                  Batch
                </TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <FaucetForm />
              </TabsContent>
              <TabsContent value="batch">
                <BatchFunding />
              </TabsContent>
            </Tabs>
          </section>

          <section className="w-full max-w-md">
            <TrustlineGuideSummary />
          </section>

          <section className="w-full max-w-md">
            <BalanceChecker network={network} />
          </section>

          <section className="w-full max-w-md">
            <FundingHistory />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
