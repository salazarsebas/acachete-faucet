import { NextRequest, NextResponse } from "next/server";
import { validateAddress } from "@/lib/stellar/address-validation";
import { hasTrustline } from "@/lib/stellar/account";
import { distributeToken } from "@/lib/stellar/token-distribution";
import {
  CAPTCHA_ANSWER,
  TESTNET_TOKENS,
  EXPLORER_BASE_URL,
} from "@/lib/stellar/constants";
import type { Network, TokenCode } from "@/lib/stellar/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network, token, captcha } = body as {
      address: string;
      network: Network;
      token: TokenCode;
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

    if (!address || !network || !token) {
      return NextResponse.json(
        {
          success: false,
          message: "Address, network, and token are required",
        },
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

    const tokenInfo = TESTNET_TOKENS[token];
    if (!tokenInfo || tokenInfo.isNative) {
      return NextResponse.json(
        {
          success: false,
          message: "Use /api/fund for native XLM",
        },
        { status: 400 },
      );
    }

    const hasTrust = await hasTrustline(
      address,
      tokenInfo.code,
      tokenInfo.issuer!,
      network,
    );
    if (!hasTrust) {
      return NextResponse.json(
        {
          success: false,
          message: `Account does not have a trustline for ${token}. Please add a trustline first.`,
          requiresTrustline: true,
        },
        { status: 400 },
      );
    }

    const result = await distributeToken(address, token, network);
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully sent ${token} to ${address}`,
        hash: result.hash,
        explorerUrl: `${EXPLORER_BASE_URL}/testnet/tx/${result.hash}`,
      });
    }

    return NextResponse.json(
      { success: false, message: result.error },
      { status: 500 },
    );
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
