"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildExplorerUrl } from "@/lib/stellar/constants";
import { cn } from "@/lib/utils";

interface ExplorerLinkProps {
  type: "account" | "tx";
  value: string;
  network: string;
  className?: string;
}

export function ExplorerLink({
  type,
  value,
  network,
  className,
}: ExplorerLinkProps) {
  const t = useTranslations("explorer");

  const href = buildExplorerUrl(network, type, value);
  const label = type === "account" ? t("viewAccount") : t("viewTransaction");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors",
        className,
      )}
    >
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  );
}
