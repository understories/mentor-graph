import { eq } from "@arkiv-network/sdk/query"
import { getPublicClient, getWalletClientFromPrivateKey } from "./client"

export type UserProfile = {
  key: string;
  wallet: string;
  displayName: string;
  skills: string;
  timezone: string;
  spaceId: string;
  createdAt?: string;
  txHash?: string;
}

export async function createUserProfile({
  wallet,
  displayName,
  skills = '',
  timezone = '',
  privateKey,
}: {
  wallet: string;
  displayName: string;
  skills?: string;
  timezone?: string;
  privateKey: `0x${string}`;
}): Promise<{ key: string; txHash: string }> {
  const walletClient = getWalletClientFromPrivateKey(privateKey);
  const enc = new TextEncoder();
  const spaceId = 'local-dev';
  const createdAt = new Date().toISOString();

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: enc.encode(JSON.stringify({
      displayName,
      skills,
      timezone,
      spaceId,
      createdAt,
    })),
    contentType: 'application/json',
    attributes: [
      { key: 'type', value: 'user_profile' },
      { key: 'wallet', value: wallet },
      { key: 'displayName', value: displayName },
      { key: 'skills', value: skills },
      { key: 'timezone', value: timezone },
      { key: 'spaceId', value: spaceId },
      { key: 'createdAt', value: createdAt },
    ],
    expiresIn: 31536000, // 1 year
  });

  return { key: entityKey, txHash };
}

export async function listUserProfiles(skill?: string): Promise<UserProfile[]> {
  const publicClient = getPublicClient();
  const query = publicClient.buildQuery();
  let queryBuilder = query.where(eq('type', 'user_profile'));
  
  if (skill) {
    queryBuilder = queryBuilder.where(eq('skills', skill));
  }
  
  const result = await queryBuilder
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
      wallet: attrs.wallet || payload.wallet || '',
      displayName: attrs.displayName || payload.displayName || '',
      skills: attrs.skills || payload.skills || '',
      timezone: attrs.timezone || payload.timezone || '',
      spaceId: attrs.spaceId || payload.spaceId || 'local-dev',
      createdAt: attrs.createdAt || payload.createdAt,
      txHash: payload.txHash,
    };
  });
}

export async function listUserProfilesForWallet(wallet: string): Promise<UserProfile[]> {
  const publicClient = getPublicClient();
  const query = publicClient.buildQuery();
  const result = await query
    .where(eq('type', 'user_profile'))
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
      wallet: attrs.wallet || payload.wallet || '',
      displayName: attrs.displayName || payload.displayName || '',
      skills: attrs.skills || payload.skills || '',
      timezone: attrs.timezone || payload.timezone || '',
      spaceId: attrs.spaceId || payload.spaceId || 'local-dev',
      createdAt: attrs.createdAt || payload.createdAt,
      txHash: payload.txHash,
    };
  });
}

export async function getProfileByWallet(wallet: string): Promise<UserProfile | null> {
  const profiles = await listUserProfilesForWallet(wallet);
  return profiles.length > 0 ? profiles[0] : null;
}

