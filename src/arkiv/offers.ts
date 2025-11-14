import { eq } from "@arkiv-network/sdk/query"
import { getPublicClient, getWalletClientFromPrivateKey } from "./client"

export type Offer = {
  key: string;
  wallet: string;
  skill: string;
  spaceId: string;
  createdAt: string;
  status: string;
  message: string;
  availabilityWindow: string;
  txHash?: string;
}

export async function createOffer({
  wallet,
  skill,
  message,
  availabilityWindow,
  privateKey,
}: {
  wallet: string;
  skill: string;
  message: string;
  availabilityWindow: string;
  privateKey: `0x${string}`;
}): Promise<{ key: string; txHash: string }> {
  const walletClient = getWalletClientFromPrivateKey(privateKey);
  const enc = new TextEncoder();
  const spaceId = 'local-dev';
  const status = 'active';
  const createdAt = new Date().toISOString();

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: enc.encode(JSON.stringify({
      message,
      availabilityWindow,
    })),
    contentType: 'application/json',
    attributes: [
      { key: 'type', value: 'offer' },
      { key: 'wallet', value: wallet },
      { key: 'skill', value: skill },
      { key: 'spaceId', value: spaceId },
      { key: 'createdAt', value: createdAt },
      { key: 'status', value: status },
    ],
    expiresIn: 7200, // 2 hours
  });

  return { key: entityKey, txHash };
}

export async function listOffers(): Promise<Offer[]> {
  const publicClient = getPublicClient();
  const query = publicClient.buildQuery();
  const result = await query
    .where(eq('type', 'offer'))
    .withAttributes(true)
    .withPayload(true)
    .limit(100)
    .fetch();

  return result.entities.map((entity: any) => {
    let payload: any = {};
    try {
      if (entity.payload) {
        const decoded = entity.payload instanceof Uint8Array
          ? new TextDecoder().decode(entity.payload)
          : typeof entity.payload === 'string'
          ? entity.payload
          : JSON.stringify(entity.payload);
        payload = JSON.parse(decoded);
      }
    } catch (e) {
      console.error('Error decoding payload:', e);
    }

    const attrs = entity.attributes || {};
    return {
      key: entity.key,
      wallet: attrs.wallet || '',
      skill: attrs.skill || '',
      spaceId: attrs.spaceId || 'local-dev',
      createdAt: attrs.createdAt || '',
      status: attrs.status || 'active',
      message: payload.message || '',
      availabilityWindow: payload.availabilityWindow || '',
      txHash: payload.txHash,
    };
  });
}

export async function listOffersForWallet(wallet: string): Promise<Offer[]> {
  const publicClient = getPublicClient();
  const query = publicClient.buildQuery();
  const result = await query
    .where(eq('type', 'offer'))
    .where(eq('wallet', wallet))
    .withAttributes(true)
    .withPayload(true)
    .limit(100)
    .fetch();

  return result.entities.map((entity: any) => {
    let payload: any = {};
    try {
      if (entity.payload) {
        const decoded = entity.payload instanceof Uint8Array
          ? new TextDecoder().decode(entity.payload)
          : typeof entity.payload === 'string'
          ? entity.payload
          : JSON.stringify(entity.payload);
        payload = JSON.parse(decoded);
      }
    } catch (e) {
      console.error('Error decoding payload:', e);
    }

    const attrs = entity.attributes || {};
    return {
      key: entity.key,
      wallet: attrs.wallet || '',
      skill: attrs.skill || '',
      spaceId: attrs.spaceId || 'local-dev',
      createdAt: attrs.createdAt || '',
      status: attrs.status || 'active',
      message: payload.message || '',
      availabilityWindow: payload.availabilityWindow || '',
      txHash: payload.txHash,
    };
  });
}

