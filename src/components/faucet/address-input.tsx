"use client";

import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { validateAddress } from "@/lib/stellar/address-validation";
import type { AddressType } from "@/lib/stellar/types";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AddressInput({ value, onChange, disabled }: AddressInputProps) {
  const t = useTranslations("faucet");
  const addressType: AddressType = value.trim()
    ? validateAddress(value.trim())
    : "invalid";
  const showBadge = value.trim().length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="address" className="text-sm font-medium">
          {t("addressLabel")}
        </Label>
        {showBadge && addressType !== "invalid" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={addressType === "C" ? "secondary" : "outline"}
                className="text-xs"
              >
                {addressType === "G"
                  ? t("standardAccount")
                  : t("smartContract")}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {addressType === "G"
                ? "Ed25519 public key"
                : "Soroban smart contract address"}
            </TooltipContent>
          </Tooltip>
        )}
        {showBadge && addressType === "invalid" && (
          <Badge variant="destructive" className="text-xs">
            {t("invalidAddress")}
          </Badge>
        )}
      </div>
      <Textarea
        id="address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("addressPlaceholder")}
        className="h-[60px] resize-none font-mono text-sm"
        disabled={disabled}
      />
      <p className="text-muted-foreground text-xs">{t("addressHelp")}</p>
    </div>
  );
}
