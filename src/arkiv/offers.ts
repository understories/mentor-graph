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

export async function listOffers(params?: { skill?: string; spaceId?: string }): Promise<Offer[]> {
  const publicClient = getPublicClient();
  const query = publicClient.buildQuery();
  let queryBuilder = query.where(eq('type', 'offer')).where(eq('status', 'active'));
  
  if (params?.spaceId) {
    queryBuilder = queryBuilder.where(eq('spaceId', params.spaceId));
  }
  
  const result = await queryBuilder
    .withAttributes(true)
    .withPayload(true)
    .limit(100)
    .fetch();

  let offers = result.entities.map((entity: any) => {
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
    const getAttr = (key: string) => {
      if (Array.isArray(attrs)) {
        const attr = attrs.find((a: any) => a.key === key);
        return attr?.value || '';
      }
      return attrs[key] || '';
    };
    
    return {
      key: entity.key,
      wallet: getAttr('wallet') || payload.wallet || '',
      skill: getAttr('skill') || payload.skill || '',
      spaceId: getAttr('spaceId') || payload.spaceId || 'local-dev',
      createdAt: getAttr('createdAt') || payload.createdAt || '',
      status: getAttr('status') || payload.status || 'active',
      message: payload.message || '',
      availabilityWindow: payload.availabilityWindow || '',
      txHash: payload.txHash,
    };
  });

  if (params?.skill) {
    const skillLower = params.skill.toLowerCase();
    offers = offers.filter(offer => offer.skill.toLowerCase().includes(skillLower));
  }

  return offers;
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
    const getAttr = (key: string) => {
      if (Array.isArray(attrs)) {
        const attr = attrs.find((a: any) => a.key === key);
        return attr?.value || '';
      }
      return attrs[key] || '';
    };
    
    return {
      key: entity.key,
      wallet: getAttr('wallet') || payload.wallet || '',
      skill: getAttr('skill') || payload.skill || '',
      spaceId: getAttr('spaceId') || payload.spaceId || 'local-dev',
      createdAt: getAttr('createdAt') || payload.createdAt || '',
      status: getAttr('status') || payload.status || 'active',
      message: payload.message || '',
      availabilityWindow: payload.availabilityWindow || '',
      txHash: payload.txHash,
    };
  });
}

