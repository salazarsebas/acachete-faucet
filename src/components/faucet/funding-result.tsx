"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/shared/copy-button";
import { ExplorerLink } from "@/components/explorer/explorer-link";
import { FadeIn } from "@/components/shared/motion-wrapper";
import type { FundingResult as FundingResultType } from "@/lib/stellar/types";

interface FundingResultProps {
  result: FundingResultType;
  address: string;
  network: string;
}

export function FundingResult({
  result,
  address,
  network,
}: FundingResultProps) {
  const t = useTranslations("faucet");

  return (
    <FadeIn>
      <Alert
        variant={result.success ? "default" : "destructive"}
        className="mt-4"
      >
        {result.success ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <AlertCircle />
        )}
        <AlertTitle>
          {result.success ? t("successTitle") : t("errorTitle")}
        </AlertTitle>
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>

      {result.success && result.hash && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">{t("transactionId")}:</p>
          <div className="bg-muted flex items-center gap-2 rounded-md border p-3">
            <p className="min-w-0 flex-1 font-mono text-xs break-all">
              {result.hash}
            </p>
            <CopyButton text={result.hash} />
          </div>
          <div className="flex flex-wrap gap-2">
            <ExplorerLink
              type="tx"
              value={result.hash}
              network={network}
              className="text-xs"
            />
            <ExplorerLink
              type="account"
              value={address}
              network={network}
              className="text-xs"
            />
          </div>
        </div>
      )}
    </FadeIn>
  );
}
