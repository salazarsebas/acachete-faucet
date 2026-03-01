import { NextRequest, NextResponse } from "next/server";
import { validateAddress } from "@/lib/stellar/address-validation";
import { fundWithFriendbot } from "@/lib/stellar/friendbot";
import type { Network } from "@/lib/stellar/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network } = body as {
      address: string;
      network: Network;
    };

    if (!address || !network) {
      return NextResponse.json(
        { success: false, message: "Address and network are required" },
        { status: 400 },
      );
    }

    if (network !== "testnet" && network !== "futurenet") {
      return NextResponse.json(
        { success: false, message: "Invalid network" },
        { status: 400 },
      );
    }

    const addressType = validateAddress(address);
    if (addressType === "invalid") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Stellar address. Must start with G or C.",
        },
        { status: 400 },
      );
    }

    const result = await fundWithFriendbot(address, network);
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
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
