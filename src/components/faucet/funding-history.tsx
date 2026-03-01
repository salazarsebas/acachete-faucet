"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";
import { EXPLORER_BASE_URL } from "@/lib/stellar/constants";

interface HistoryEntry {
  address: string;
  network: string;
  token: string;
  hash?: string;
  timestamp: number;
}

function getHistorySnapshot(): string {
  try {
    return localStorage.getItem("faucet-history") || "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function subscribeToHistory(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === "faucet-history") callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function FundingHistory() {
  const t = useTranslations("faucet");
  const [, setVersion] = useState(0);
  const rawHistory = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerSnapshot,
  );
  const history: HistoryEntry[] = JSON.parse(rawHistory);

  const clearHistory = () => {
    localStorage.removeItem("faucet-history");
    setVersion((v) => v + 1);
  };

  if (history.length === 0) return null;

  return (
    <FadeIn delay={0.4}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2">
          <CardTitle className="text-base font-semibold">
            {t("historyTitle")}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground h-7 text-xs"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            {t("clearHistory")}
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <StaggerContainer className="space-y-2">
            {history.slice(0, 10).map((entry, i) => (
              <StaggerItem key={i}>
                <div className="bg-muted/50 flex items-center justify-between gap-2 rounded-md px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {entry.token}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.network}
                      </Badge>
                      <span className="text-muted-foreground text-[10px]">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[10px]">
                      {entry.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.hash && (
                      <>
                        <CopyButton text={entry.hash} className="h-6 w-6" />
                        <a
                          href={`${EXPLORER_BASE_URL}/${entry.network}/tx/${entry.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground text-[10px] transition-colors"
                        >
                          TX
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
