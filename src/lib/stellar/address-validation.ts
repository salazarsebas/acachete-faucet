import { StrKey } from "@stellar/stellar-sdk";
import type { AddressType } from "./types";

export function validateAddress(address: string): AddressType {
  if (!address || typeof address !== "string") return "invalid";
  const trimmed = address.trim();
  if (StrKey.isValidEd25519PublicKey(trimmed)) return "G";
  if (StrKey.isValidContract(trimmed)) return "C";
  return "invalid";
}

export function getAddressLabel(type: AddressType): string {
  switch (type) {
    case "G":
      return "Standard Account";
    case "C":
      return "Smart Contract";
    default:
      return "Invalid Address";
  }
}
