import { NextRequest, NextResponse } from "next/server";
import { getServer } from "@/lib/stellar/client";
import type { Network } from "@/lib/stellar/types";

export async function GET(request: NextRequest) {
  try {
    const network =
      (request.nextUrl.searchParams.get("network") as Network) || "testnet";

    if (network !== "testnet" && network !== "futurenet") {
      return NextResponse.json(
        { success: false, message: "Invalid network" },
        { status: 400 },
      );
    }

    const server = getServer(network);
    const ledger = await server.ledgers().order("desc").limit(1).call();

    const latest = ledger.records[0];

    return NextResponse.json({
      success: true,
      online: true,
      lastLedger: latest.sequence,
      protocolVersion: latest.protocol_version,
      timestamp: latest.closed_at,
      baseFee: latest.base_fee_in_stroops,
      network,
    });
  } catch {
    return NextResponse.json({
      success: true,
      online: false,
      lastLedger: 0,
      protocolVersion: 0,
      timestamp: new Date().toISOString(),
      network: "testnet",
    });
  }
}
