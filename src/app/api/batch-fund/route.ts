import { NextRequest, NextResponse } from "next/server";
import { validateAddress } from "@/lib/stellar/address-validation";
import { fundWithFriendbot } from "@/lib/stellar/friendbot";
import { CAPTCHA_ANSWER, BATCH_FUND_MAX } from "@/lib/stellar/constants";
import type { BatchFundResult, Network } from "@/lib/stellar/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses, network, captcha } = body as {
      addresses: string[];
      network: Network;
      captcha: string;
    };

    if (
      !captcha ||
      captcha.trim().toLowerCase() !== CAPTCHA_ANSWER.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, message: "Incorrect verification answer" },
        { status: 400 },
      );
    }

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one address is required" },
        { status: 400 },
      );
    }

    if (addresses.length > BATCH_FUND_MAX) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${BATCH_FUND_MAX} addresses per batch`,
        },
        { status: 400 },
      );
    }

    if (network !== "testnet" && network !== "futurenet") {
      return NextResponse.json(
        { success: false, message: "Invalid network" },
        { status: 400 },
      );
    }

    const results: BatchFundResult[] = [];

    for (const address of addresses) {
      const trimmed = address.trim();
      const addressType = validateAddress(trimmed);

      if (addressType === "invalid") {
        results.push({
          address: trimmed,
          success: false,
          error: "Invalid address",
        });
        continue;
      }

      const result = await fundWithFriendbot(trimmed, network);
      results.push({
        address: trimmed,
        success: result.success,
        hash: result.hash,
        error: result.success ? undefined : result.message,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      funded: results.filter((r) => r.success).length,
      total: results.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
