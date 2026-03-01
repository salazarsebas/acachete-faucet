"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddressInput } from "./address-input";
import { NetworkSelector } from "./network-selector";
import { TokenSelector } from "./token-selector";
import { CaptchaInput } from "./captcha-input";
import { FundingResult } from "./funding-result";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { validateAddress } from "@/lib/stellar/address-validation";
import type {
  Network,
  TokenCode,
  FundingResult as FundingResultType,
} from "@/lib/stellar/types";

export function FaucetForm() {
  const t = useTranslations("faucet");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<Network>("testnet");
  const [token, setToken] = useState<TokenCode>("XLM");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FundingResultType | null>(null);

  const needsCaptcha = token !== "XLM";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResult(null);

    const addressType = validateAddress(address.trim());
    if (addressType === "invalid") {
      setResult({
        success: false,
        message: "Please enter a valid Stellar address (G... or C...)",
      });
      return;
    }

    if (needsCaptcha && !captcha.trim()) {
      setResult({
        success: false,
        message: "Please answer the verification question",
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = token === "XLM" ? "/api/fund" : "/api/fund-token";
      const body =
        token === "XLM"
          ? { address: address.trim(), network }
          : {
              address: address.trim(),
              network,
              token,
              captcha: captcha.trim(),
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult({
        success: data.success,
        message: data.message,
        hash: data.hash,
        explorerUrl: data.explorerUrl,
      });

      if (data.success) {
        saveToHistory({
          address: address.trim(),
          network,
          token,
          hash: data.hash,
          timestamp: Date.now(),
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Failed to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn>
      <Card>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">✦</span>
            <h1 className="text-xl font-semibold">{t("title")}</h1>
          </CardTitle>
          <CardDescription>
            <p>{t("subtitle")}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pt-0 pb-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <NetworkSelector
              value={network}
              onChange={setNetwork}
              disabled={loading}
            />

            <TokenSelector
              value={token}
              onChange={setToken}
              disabled={loading}
            />

            <AddressInput
              value={address}
              onChange={setAddress}
              disabled={loading}
            />

            {needsCaptcha && (
              <CaptchaInput
                value={captcha}
                onChange={setCaptcha}
                disabled={loading}
              />
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  {t("funding")}
                </>
              ) : (
                t("fundButton")
              )}
            </Button>
          </form>

          {result && (
            <FundingResult
              result={result}
              address={address.trim()}
              network={network}
            />
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}

interface HistoryEntry {
  address: string;
  network: string;
  token: string;
  hash?: string;
  timestamp: number;
}

function saveToHistory(entry: HistoryEntry) {
  try {
    const stored = localStorage.getItem("faucet-history");
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    history.unshift(entry);
    localStorage.setItem(
      "faucet-history",
      JSON.stringify(history.slice(0, 50)),
    );
  } catch {
    // localStorage not available
  }
}
