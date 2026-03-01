import { NextRequest, NextResponse } from "next/server";
import { validateAddress } from "@/lib/stellar/address-validation";
import { getBalances } from "@/lib/stellar/account";
import type { Network } from "@/lib/stellar/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const network =
      (request.nextUrl.searchParams.get("network") as Network) || "testnet";

    if (network !== "testnet" && network !== "futurenet") {
      return NextResponse.json(
        { success: false, message: "Invalid network" },
        { status: 400 },
      );
    }

    const addressType = validateAddress(address);
    if (addressType === "invalid") {
      return NextResponse.json(
        { success: false, message: "Invalid Stellar address" },
        { status: 400 },
      );
    }

    const balances = await getBalances(address, network);
    return NextResponse.json({ success: true, balances });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load account";
    const status = message.includes("Not Found") ? 404 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
