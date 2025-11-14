import { privateKeyToAccount } from "viem/accounts";

export const ARKIV_PRIVATE_KEY = process.env.ARKIV_PRIVATE_KEY as `0x${string}`;

if (!ARKIV_PRIVATE_KEY) {
  throw new Error("ARKIV_PRIVATE_KEY missing in environment");
}

// Derive wallet address from the private key.
const account = privateKeyToAccount(ARKIV_PRIVATE_KEY);

export const CURRENT_WALLET = account.address;
export const SPACE_ID = "local-dev"; // Optionally configurable later
