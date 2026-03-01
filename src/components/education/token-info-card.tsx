"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TokenInfo } from "@/lib/stellar/types";

interface TokenInfoCardProps {
  token: TokenInfo;
}

export function TokenInfoCard({ token }: TokenInfoCardProps) {
  const t = useTranslations("tokens");

  const tokenKey = token.code.toLowerCase() as "xlm" | "usdc" | "eurc";

  return (
    <Card>
      <CardHeader className="pt-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {token.code}
          <Badge
            variant={token.isNative ? "default" : "secondary"}
            className="text-[10px]"
          >
            {token.isNative ? t("native") : t("requiresTrustline")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className="text-muted-foreground text-xs">
          {t(`${tokenKey}.description`)}
        </p>
        {token.issuer && (
          <p className="text-muted-foreground/70 mt-1 font-mono text-[10px] break-all">
            Issuer: {token.issuer}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
