"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NetworkSelector } from "./network-selector";
import { CaptchaInput } from "./captcha-input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { CopyButton } from "@/components/shared/copy-button";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";
import { BATCH_FUND_MAX } from "@/lib/stellar/constants";
import type { BatchFundResult, Network } from "@/lib/stellar/types";

interface BatchFundingProps {
  network: Network;
  onNetworkChange: (network: Network) => void;
}

export function BatchFunding({ network, onNetworkChange }: BatchFundingProps) {
  const t = useTranslations("faucet");
  const [addresses, setAddresses] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<BatchFundResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResults(null);
    setError(null);

    const lines = addresses
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError(t("batchMinAddress"));
      return;
    }

    if (lines.length > BATCH_FUND_MAX) {
      setError(t("batchMaxAddress", { max: BATCH_FUND_MAX }));
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: lines.length });

    try {
      const response = await fetch("/api/batch-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: lines,
          network,
          captcha: captcha.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        const resetHeader = response.headers.get("X-RateLimit-Reset");
        const resetTime = resetHeader
          ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString()
          : "";
        setError(
          resetTime ? `${data.message} (resets at ${resetTime})` : data.message,
        );
        return;
      }

      if (!data.success && !data.results) {
        setError(data.message);
      } else {
        setResults(data.results);
        setProgress({ current: data.total, total: data.total });
      }
    } catch {
      setError(t("batchConnectionError"));
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
            <h2 className="text-xl font-semibold">{t("batchTitle")}</h2>
          </CardTitle>
          <CardDescription>
            <p>{t("batchSubtitle")}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pt-0 pb-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <NetworkSelector
              value={network}
              onChange={onNetworkChange}
              disabled={loading}
            />

            <div className="space-y-2">
              <Label htmlFor="batch-addresses" className="text-sm font-medium">
                {t("addressesLabel")}
              </Label>
              <Textarea
                id="batch-addresses"
                value={addresses}
                onChange={(e) => setAddresses(e.target.value)}
                placeholder={t("batchPlaceholder")}
                className="h-[120px] font-mono text-xs"
                disabled={loading}
              />
            </div>

            <CaptchaInput
              value={captcha}
              onChange={setCaptcha}
              disabled={loading}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  {t("batchFunding", {
                    current: progress.current,
                    total: progress.total,
                  })}
                </>
              ) : (
                t("batchButton")
              )}
            </Button>
          </form>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {results && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("batchResults", {
                  funded: results.filter((r) => r.success).length,
                  total: results.length,
                })}
              </p>
              <StaggerContainer className="space-y-1.5">
                {results.map((result, i) => (
                  <StaggerItem key={i}>
                    <div className="bg-muted/50 flex items-center justify-between gap-2 rounded-md px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[10px]">
                          {result.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {result.success ? (
                          <>
                            <Badge
                              variant="outline"
                              className="border-green-500/30 text-[10px] text-green-600"
                            >
                              {t("fundedBadge")}
                            </Badge>
                            {result.hash && (
                              <CopyButton
                                text={result.hash}
                                className="h-6 w-6"
                              />
                            )}
                          </>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            {t("failedBadge")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
