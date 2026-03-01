"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TokenCode } from "@/lib/stellar/types";
import { TESTNET_TOKENS } from "@/lib/stellar/constants";

interface TokenSelectorProps {
  value: TokenCode;
  onChange: (value: TokenCode) => void;
  disabled?: boolean;
}

const tokenIcons: Record<TokenCode, string> = {
  XLM: "✦",
  USDC: "$",
  EURC: "€",
};

export function TokenSelector({
  value,
  onChange,
  disabled,
}: TokenSelectorProps) {
  const t = useTranslations("tokens");
  const tFaucet = useTranslations("faucet");

  const tokens = Object.values(TESTNET_TOKENS);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{tFaucet("tokenLabel")}</Label>
      <div className="grid grid-cols-3 gap-2">
        {tokens.map((token) => (
          <button
            key={token.code}
            type="button"
            onClick={() => onChange(token.code)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all",
              value === token.code
                ? "border-foreground bg-foreground/5 ring-foreground/20 ring-1"
                : "border-border hover:border-foreground/30",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <span className="text-lg">{tokenIcons[token.code]}</span>
            <span className="text-xs font-medium">{token.code}</span>
            <Badge
              variant={token.isNative ? "default" : "secondary"}
              className="text-[10px]"
            >
              {token.isNative ? t("native") : t("requiresTrustline")}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
