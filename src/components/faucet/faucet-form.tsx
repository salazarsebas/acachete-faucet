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
import { saveToHistory } from "@/lib/stellar/history";
import type {
  Network,
  TokenCode,
  FundingResult as FundingResultType,
} from "@/lib/stellar/types";

interface FaucetFormProps {
  network: Network;
  onNetworkChange: (network: Network) => void;
}

export function FaucetForm({ network, onNetworkChange }: FaucetFormProps) {
  const t = useTranslations("faucet");
  const [address, setAddress] = useState("");
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
        message: t("validationInvalidAddress"),
      });
      return;
    }

    if (needsCaptcha && !captcha.trim()) {
      setResult({
        success: false,
        message: t("validationCaptchaRequired"),
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

      if (response.status === 429) {
        const resetHeader = response.headers.get("X-RateLimit-Reset");
        const resetTime = resetHeader
          ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString()
          : "";
        setResult({
          success: false,
          message: resetTime
            ? `${data.message} (resets at ${resetTime})`
            : data.message,
        });
        return;
      }

      setResult({
        success: data.success,
        message: data.success
          ? token === "XLM"
            ? t("fundSuccess", { network })
            : t("fundTokenSuccess", { token, address: address.trim() })
          : data.message,
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
        message: t("connectionError"),
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
              onChange={onNetworkChange}
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
