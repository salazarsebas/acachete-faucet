"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ExplorerLink } from "@/components/explorer/explorer-link";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";
import { validateAddress } from "@/lib/stellar/address-validation";
import type { AccountBalance, Network } from "@/lib/stellar/types";

interface BalanceCheckerProps {
  network: Network;
}

export function BalanceChecker({ network }: BalanceCheckerProps) {
  const t = useTranslations("balanceChecker");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<AccountBalance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBalances(null);

    if (validateAddress(address.trim()) === "invalid") {
      setError(t("invalidAddress"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/account/${encodeURIComponent(address.trim())}?network=${network}`,
      );
      const data = await response.json();

      if (!data.success) {
        setError(data.message || t("accountNotFound"));
      } else {
        setBalances(data.balances);
      }
    } catch {
      setError(t("accountNotFound"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn delay={0.3}>
      <Card>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-base font-semibold">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-xs">{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-4">
          <form onSubmit={handleCheck} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="balance-address" className="sr-only">
                {t("addressLabel")}
              </Label>
              <Input
                id="balance-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("addressPlaceholder")}
                className="font-mono text-xs"
                disabled={loading}
              />
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? <LoadingSpinner /> : t("check")}
            </Button>
          </form>

          {error && <p className="text-destructive text-xs">{error}</p>}

          {balances && balances.length > 0 && (
            <StaggerContainer className="space-y-1.5">
              {balances.map((balance, i) => (
                <StaggerItem key={i}>
                  <div className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {balance.assetCode || "XLM"}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs">
                      {parseFloat(balance.balance).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </StaggerItem>
              ))}
              <ExplorerLink
                type="account"
                value={address.trim()}
                network={network}
                className="mt-2 text-xs"
              />
            </StaggerContainer>
          )}

          {balances && balances.length === 0 && (
            <p className="text-muted-foreground text-xs">{t("noBalances")}</p>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
