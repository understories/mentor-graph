import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk"
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts"
import { mendoza } from "@arkiv-network/sdk/chains"

export function getPublicClient() {
  return createPublicClient({
    chain: mendoza,
    transport: http(),
  });
}

export function getWalletClientFromPrivateKey(privateKey: `0x${string}`) {
  return createWalletClient({
    chain: mendoza,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });
}

