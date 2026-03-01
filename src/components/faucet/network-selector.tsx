"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import type { Network } from "@/lib/stellar/types";

interface NetworkSelectorProps {
  value: Network;
  onChange: (value: Network) => void;
  disabled?: boolean;
}

export function NetworkSelector({
  value,
  onChange,
  disabled,
}: NetworkSelectorProps) {
  const t = useTranslations("faucet");

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{t("networkLabel")}</Label>
      <Tabs value={value} onValueChange={(v) => onChange(v as Network)}>
        <TabsList className="w-full">
          <TabsTrigger value="testnet" disabled={disabled} className="flex-1">
            Testnet
          </TabsTrigger>
          <TabsTrigger value="futurenet" disabled={disabled} className="flex-1">
            Futurenet
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
