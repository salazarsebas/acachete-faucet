"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Network } from "@/lib/stellar/types";

interface NetworkStatusData {
  online: boolean;
  lastLedger: number;
  protocolVersion: number;
  timestamp: string;
}

interface NetworkStatusProps {
  network: Network;
}

export function NetworkStatus({ network }: NetworkStatusProps) {
  const t = useTranslations("network");
  const [status, setStatus] = useState<NetworkStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/network-status?network=${network}`);
      const data = await response.json();
      setStatus(data);
    } catch {
      setStatus({
        online: false,
        lastLedger: 0,
        protocolVersion: 0,
        timestamp: "",
      });
    } finally {
      setLoading(false);
    }
  }, [network]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge
        variant={status.online ? "outline" : "destructive"}
        className="gap-1"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status.online ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {status.online ? t("online") : t("offline")}
      </Badge>
      {status.online && (
        <>
          <span className="text-muted-foreground">
            {t("lastLedger")}: #{status.lastLedger.toLocaleString()}
          </span>
          <span className="text-muted-foreground">
            Protocol v{status.protocolVersion}
          </span>
        </>
      )}
    </div>
  );
}
