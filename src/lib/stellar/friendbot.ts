import { NETWORKS } from "./constants";
import type { FundingResult, Network } from "./types";
import { EXPLORER_BASE_URL } from "./constants";

export async function fundWithFriendbot(
  address: string,
  network: Network,
): Promise<FundingResult> {
  const { friendbotUrl } = NETWORKS[network];
  const url = `${friendbotUrl}?addr=${encodeURIComponent(address)}`;

  const response = await fetch(url, { method: "GET" });

  let responseData;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    const textData = await response.text();
    try {
      responseData = JSON.parse(textData);
    } catch {
      responseData = { text: textData };
    }
  }

  if (!response.ok) {
    let errorMessage = "Please try again.";
    if (responseData.detail) {
      errorMessage = responseData.detail;
    } else if (responseData.text) {
      errorMessage = responseData.text;
    }
    return {
      success: false,
      message: `Failed to fund account on ${network}. ${errorMessage}`,
    };
  }

  const hash = responseData.hash || responseData.id || "Transaction completed";

  return {
    success: true,
    message: `Successfully funded account on ${network}!`,
    hash,
    explorerUrl: `${EXPLORER_BASE_URL}/testnet/tx/${hash}`,
  };
}
