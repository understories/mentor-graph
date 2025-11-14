import { eq } from "@arkiv-network/sdk/query"
import { getPublicClient, getWalletClient } from "./client"

export type UserProfile = {
  key: string;
  wallet: string;
  displayName: string;
  skills: string;
  timezone: string;
  txHash?: string;
}

export async function createUserProfile(
  displayName: string,
  skills: string = '',
  timezone: string = ''
): Promise<{ key: string; txHash: string }> {
  const walletClient = getWalletClient();
  const enc = new TextEncoder();

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: enc.encode(JSON.stringify({
      displayName,
      skills,
      timezone,
    })),
    contentType: 'application/json',
    attributes: [
      { key: 'type', value: 'user_profile' },
      { key: 'wallet', value: walletClient.account.address },
      { key: 'displayName', value: displayName },
      { key: 'skills', value: skills },
      { key: 'timezone', value: timezone },
    ],
    expiresIn: 31536000, // 1 year
  });

  return { key: entityKey, txHash };
}

export async function listUserProfiles(): Promise<UserProfile[]> {
  const publicClient = getPublicClient();
  const query = publicClient.buildQuery();
  const result = await query
    .where(eq('type', 'user_profile'))
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
    };
  });
}

