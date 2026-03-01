"use client";

import { TESTNET_TOKENS } from "@/lib/stellar/constants";
import { TokenInfoCard } from "./token-info-card";
import { FadeIn } from "@/components/shared/motion-wrapper";

export function TokenInfoCards() {
  const tokens = Object.values(TESTNET_TOKENS);

  return (
    <FadeIn delay={0.15}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {tokens.map((token) => (
          <TokenInfoCard key={token.code} token={token} />
        ))}
      </div>
    </FadeIn>
  );
}
