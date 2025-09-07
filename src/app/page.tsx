'use client';

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { useTheme } from "next-themes";
import Header from "@/components/header";
import { StatusAlert } from "@/components/status-alert";
import Script from "next/script";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Network = "testnet" | "futurenet";
type FundingResult = {
  success: boolean;
  message: string;
  transactionId?: string;
};

export default function Home() {
  // JSON-LD structured data for SEO
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stellar Testnet Faucet",
    "description": "Free testnet token distributor for Stellar blockchain development",
    "url": "https://acachete.xyz",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "author": {
      "@type": "Organization",
      "name": "Acachete Labs",
      "url": "https://acachete.xyz"
    },
    "keywords": "stellar testnet faucet, get test xlm, stellar friendbot alternative"
  };
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [network, setNetwork] = useState<Network>("testnet");
  const [result, setResult] = useState<FundingResult | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  
  // Theme handling
  const { theme } = useTheme();
  
  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // To avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError("Please enter a Stellar address");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    setResult(null);
    
    try {
      // Use Friendbot to fund the account
      let response;
      
      if (network === "testnet") {
        // Correct endpoint for testnet
        response = await fetch(
          `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`,
          { method: 'GET' }
        );
      } else {
        // Futurenet endpoint
        response = await fetch(
          `https://friendbot-futurenet.stellar.org?addr=${encodeURIComponent(address)}`,
          { method: 'GET' }
        );
      }
      
      // Try to parse the response as JSON, but handle text responses too
      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        try {
          responseData = JSON.parse(textData);
        } catch {
          responseData = { text: textData };
        }
      }
      
      if (!response.ok) {
        console.error(`Funding error on ${network}:`, responseData);
        let errorMessage = 'Please try again.';
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.text) {
          errorMessage = responseData.text;
        }
        setError(`Failed to fund account on ${network}. ${errorMessage}`);
        setResult({
          success: false,
          message: `Failed to fund account on ${network}.`
        });
      } else {
        setSuccess(`Successfully funded account on ${network}!`);
        setResult({
          success: true,
          message: `Successfully funded account on ${network}!`,
          transactionId: responseData.hash || responseData.id || 'Transaction completed'
        });
      }
    } catch (fundingError) {
      console.error(`Error funding account on ${network}:`, fundingError);
      setError(`Failed to fund account on ${network}. Please try again.`);
      setResult({
        success: false,
        message: `Error connecting to ${network} Friendbot.`
      });
    } finally {
      setLoading(false);
    }
  };

  const networkOptions = [
    { value: "testnet", label: "Testnet" },
    { value: "futurenet", label: "Futurenet" }
  ];

  return (
    <>
    <Script
      id="json-ld-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
    />
    <Header />
    <div className="font-sans flex flex-col min-h-screen">
      <main className="flex flex-col gap-[32px] items-center w-full max-w-2xl mx-auto px-4 pt-2 pb-4">
      {/* Primary content section with semantic HTML */}
      <section className="w-full max-w-md space-y-4" aria-labelledby="faucet-title">
      <Card>
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="flex items-center gap-2" id="faucet-title">
          <Image
            src={theme === "dark" ? "/icon-stellar.svg" : "/icon-stellar-black.png"}
            alt="Stellar logomark"
            width={24}
            height={24}
            priority
          />
          <h1 className="text-xl font-semibold">Stellar Testnet Faucet</h1>
        </CardTitle>
        <CardDescription>
          <p>Get free test tokens for Stellar blockchain development</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 px-6 pb-3">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="network" className="block text-xs font-medium">
              Network
            </label>
            <select
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value as Network)}
              className="w-full p-2 border rounded-md bg-background text-base"
              disabled={loading}
            >
              {networkOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium">
              Stellar Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="G..."
              className="w-full p-3 border rounded-md text-base font-mono resize-none"
              style={{ height: "60px"}}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full rounded-md bg-foreground text-background py-2 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                Funding...
              </>
            ) : (
              <>Get Test Tokens</>
            )}
          </button>
        </form>

        <br />
        
        {error && (
          <StatusAlert
            title="Error"
            message={error}
            variant="error"
          />
        )}
        
        {success && (
          <StatusAlert
            title="Success"
            message={success}
            variant="success"
          />
        )}
      </CardContent>
      
      {result?.success && result.transactionId && (
        <CardFooter className="flex-col items-start border-t mt-4">
          <div className="w-full pt-4 pb-2">
            <p className="text-sm font-medium mb-2">Transaction ID:</p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-mono break-all">{result.transactionId}</p>
            </div>
          </div>
        </CardFooter>
      )}
      </Card>
      </section>

        <section className="w-full max-w-md space-y-4" aria-labelledby="about-section">
          <h2 id="about-section" className="text-lg font-medium">About Stellar Testnet Faucets</h2>
          <p className="text-sm text-muted-foreground">
            Stellar Friendbot is a service that provides free test tokens for development purposes.
            These tokens have no real value and are only available on test networks.  
          </p>
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
              href="https://developers.stellar.org/docs/fundamentals-and-concepts/testnet-and-pubnet"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert"
                src="/icon-stellar.svg"
                alt="Stellar logomark"
                width={20}
                height={20}
              />
              Stellar Docs
            </a>
            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
              href="https://laboratory.stellar.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className=""
                src={theme === "dark" ? "/icon-stellar.svg" : "/icon-stellar-black.png"}
                alt="Stellar logomark"
                width={20}
                height={20}
              />
              Stellar Laboratory
            </a>
          </div>
        </section>
      </main>
      <br />
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://stellar.org/evo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://acachete.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Read more about Acachete Labs →
        </a>
      </footer>
      <br />
    </div>
    </>
  );
}
