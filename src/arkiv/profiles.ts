import { eq } from "@arkiv-network/sdk/query"
import { getPublicClient, getWalletClientFromPrivateKey } from "./client"

export type UserProfile = {
  key: string;
  wallet: string;
  // Core Identity
  displayName: string;
  username?: string;
  profileImage?: string;
  bio?: string;
  bioLong?: string;
  timezone: string;
  languages?: string[];
  contactLinks?: {
    twitter?: string;
    github?: string;
    telegram?: string;
    discord?: string;
  };
  // Skills / Roles
  skills: string; // Keep as string for backward compatibility, but can be parsed as array
  skillsArray?: string[]; // Explicit array version
  seniority?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  domainsOfInterest?: string[];
  mentorRoles?: string[];
  learnerRoles?: string[];
  // Availability (references to asks/offers - stored separately)
  // Contribution / Reputation Metadata
  sessionsCompleted?: number;
  sessionsGiven?: number;
  sessionsReceived?: number;
  avgRating?: number;
  npsScore?: number;
  topSkillsUsage?: Array<{ skill: string; count: number }>;
  peerTestimonials?: Array<{ text: string; timestamp: string; fromWallet: string }>;
  trustEdges?: string[]; // References to other wallet addresses
  // Derived / System Fields
  lastActiveTimestamp?: string;
  communityAffiliations?: string[];
  reputationScore?: number;
  // Legacy fields
  spaceId: string;
  createdAt?: string;
  txHash?: string;
}

export async function createUserProfile({
  wallet,
  displayName,
  username,
  profileImage,
  bio,
  bioLong,
  skills = '',
  skillsArray,
  timezone = '',
  languages,
  contactLinks,
  seniority,
  domainsOfInterest,
  mentorRoles,
  learnerRoles,
  privateKey,
}: {
  wallet: string;
  displayName: string;
  username?: string;
  profileImage?: string;
  bio?: string;
  bioLong?: string;
  skills?: string;
  skillsArray?: string[];
  timezone?: string;
  languages?: string[];
  contactLinks?: {
    twitter?: string;
    github?: string;
    telegram?: string;
    discord?: string;
  };
  seniority?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  domainsOfInterest?: string[];
  mentorRoles?: string[];
  learnerRoles?: string[];
  privateKey: `0x${string}`;
}): Promise<{ key: string; txHash: string }> {
  const walletClient = getWalletClientFromPrivateKey(privateKey);
  const enc = new TextEncoder();
  const spaceId = 'local-dev';
  const createdAt = new Date().toISOString();
  const lastActiveTimestamp = new Date().toISOString();

  // Use skillsArray if provided, otherwise parse skills string
  const finalSkillsArray = skillsArray || (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);

  const payload = {
    displayName,
    username,
    profileImage,
    bio,
    bioLong,
    skills: finalSkillsArray.join(', '), // Keep backward compatibility
    skillsArray: finalSkillsArray,
    timezone,
    languages: languages || [],
    contactLinks: contactLinks || {},
    seniority,
    domainsOfInterest: domainsOfInterest || [],
    mentorRoles: mentorRoles || [],
    learnerRoles: learnerRoles || [],
    spaceId,
    createdAt,
    lastActiveTimestamp,
    // Initialize reputation fields
    sessionsCompleted: 0,
    sessionsGiven: 0,
    sessionsReceived: 0,
    avgRating: 0,
    npsScore: 0,
    topSkillsUsage: [],
    peerTestimonials: [],
    trustEdges: [],
    communityAffiliations: [],
    reputationScore: 0,
  };

  const attributes: Array<{ key: string; value: string }> = [
    { key: 'type', value: 'user_profile' },
    { key: 'wallet', value: wallet },
    { key: 'displayName', value: displayName },
    { key: 'timezone', value: timezone },
    { key: 'spaceId', value: spaceId },
    { key: 'createdAt', value: createdAt },
  ];

  if (username) attributes.push({ key: 'username', value: username });
  if (bio) attributes.push({ key: 'bio', value: bio });
  if (skills) attributes.push({ key: 'skills', value: skills });
  if (seniority) attributes.push({ key: 'seniority', value: seniority });
  if (finalSkillsArray.length > 0) {
    finalSkillsArray.forEach((skill, idx) => {
      attributes.push({ key: `skill_${idx}`, value: skill });
    });
  }

  const { entityKey, txHash } = await walletClient.createEntity({
    payload: enc.encode(JSON.stringify(payload)),
    contentType: 'application/json',
    attributes,
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
    const getAttr = (key: string) => {
      if (Array.isArray(attrs)) {
        const attr = attrs.find((a: any) => a.key === key);
        return attr?.value || '';
      }
      return attrs[key] || '';
    };

    // Parse skills array from attributes or payload
    const skillsArray: string[] = [];
    if (Array.isArray(attrs)) {
      attrs.forEach((attr: any) => {
        if (attr.key?.startsWith('skill_')) {
          skillsArray.push(attr.value);
        }
      });
    }
    const finalSkillsArray = payload.skillsArray || skillsArray.length > 0 ? skillsArray : (payload.skills ? payload.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    return {
      key: entity.key,
      wallet: getAttr('wallet') || payload.wallet || '',
      displayName: getAttr('displayName') || payload.displayName || '',
      username: payload.username || getAttr('username') || undefined,
      profileImage: payload.profileImage || undefined,
      bio: payload.bio || getAttr('bio') || undefined,
      bioLong: payload.bioLong || undefined,
      skills: getAttr('skills') || payload.skills || '',
      skillsArray: finalSkillsArray,
      timezone: getAttr('timezone') || payload.timezone || '',
      languages: payload.languages || [],
      contactLinks: payload.contactLinks || {},
      seniority: payload.seniority || getAttr('seniority') || undefined,
      domainsOfInterest: payload.domainsOfInterest || [],
      mentorRoles: payload.mentorRoles || [],
      learnerRoles: payload.learnerRoles || [],
      sessionsCompleted: payload.sessionsCompleted || 0,
      sessionsGiven: payload.sessionsGiven || 0,
      sessionsReceived: payload.sessionsReceived || 0,
      avgRating: payload.avgRating || 0,
      npsScore: payload.npsScore || 0,
      topSkillsUsage: payload.topSkillsUsage || [],
      peerTestimonials: payload.peerTestimonials || [],
      trustEdges: payload.trustEdges || [],
      lastActiveTimestamp: payload.lastActiveTimestamp || undefined,
      communityAffiliations: payload.communityAffiliations || [],
      reputationScore: payload.reputationScore || 0,
      spaceId: getAttr('spaceId') || payload.spaceId || 'local-dev',
      createdAt: getAttr('createdAt') || payload.createdAt,
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
    const getAttr = (key: string) => {
      if (Array.isArray(attrs)) {
        const attr = attrs.find((a: any) => a.key === key);
        return attr?.value || '';
      }
      return attrs[key] || '';
    };

    // Parse skills array from attributes or payload
    const skillsArray: string[] = [];
    if (Array.isArray(attrs)) {
      attrs.forEach((attr: any) => {
        if (attr.key?.startsWith('skill_')) {
          skillsArray.push(attr.value);
        }
      });
    }
    const finalSkillsArray = payload.skillsArray || skillsArray.length > 0 ? skillsArray : (payload.skills ? payload.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    return {
      key: entity.key,
      wallet: getAttr('wallet') || payload.wallet || '',
      displayName: getAttr('displayName') || payload.displayName || '',
      username: payload.username || getAttr('username') || undefined,
      profileImage: payload.profileImage || undefined,
      bio: payload.bio || getAttr('bio') || undefined,
      bioLong: payload.bioLong || undefined,
      skills: getAttr('skills') || payload.skills || '',
      skillsArray: finalSkillsArray,
      timezone: getAttr('timezone') || payload.timezone || '',
      languages: payload.languages || [],
      contactLinks: payload.contactLinks || {},
      seniority: payload.seniority || getAttr('seniority') || undefined,
      domainsOfInterest: payload.domainsOfInterest || [],
      mentorRoles: payload.mentorRoles || [],
      learnerRoles: payload.learnerRoles || [],
      sessionsCompleted: payload.sessionsCompleted || 0,
      sessionsGiven: payload.sessionsGiven || 0,
      sessionsReceived: payload.sessionsReceived || 0,
      avgRating: payload.avgRating || 0,
      npsScore: payload.npsScore || 0,
      topSkillsUsage: payload.topSkillsUsage || [],
      peerTestimonials: payload.peerTestimonials || [],
      trustEdges: payload.trustEdges || [],
      lastActiveTimestamp: payload.lastActiveTimestamp || undefined,
      communityAffiliations: payload.communityAffiliations || [],
      reputationScore: payload.reputationScore || 0,
      spaceId: getAttr('spaceId') || payload.spaceId || 'local-dev',
      createdAt: getAttr('createdAt') || payload.createdAt,
      txHash: payload.txHash,
    };
  });
}

export async function getProfileByWallet(wallet: string): Promise<UserProfile | null> {
  const profiles = await listUserProfilesForWallet(wallet);
  if (profiles.length === 0) return null;
  
  // Return the most recent profile (sorted by createdAt descending)
  profiles.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
  
  return profiles[0];
}

export async function updateUserProfile({
  wallet,
  displayName,
  username,
  profileImage,
  bio,
  bioLong,
  skills = '',
  skillsArray,
  timezone = '',
  languages,
  contactLinks,
  seniority,
  domainsOfInterest,
  mentorRoles,
  learnerRoles,
  privateKey,
}: {
  wallet: string;
  displayName: string;
  username?: string;
  profileImage?: string;
  bio?: string;
  bioLong?: string;
  skills?: string;
  skillsArray?: string[];
  timezone?: string;
  languages?: string[];
  contactLinks?: {
    twitter?: string;
    github?: string;
    telegram?: string;
    discord?: string;
  };
  seniority?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  domainsOfInterest?: string[];
  mentorRoles?: string[];
  learnerRoles?: string[];
  privateKey: `0x${string}`;
}): Promise<{ key: string; txHash: string }> {
  // Since Arkiv entities are immutable, we create a new profile entity
  return createUserProfile({
    wallet,
    displayName,
    username,
    profileImage,
    bio,
    bioLong,
    skills,
    skillsArray,
    timezone,
    languages,
    contactLinks,
    seniority,
    domainsOfInterest,
    mentorRoles,
    learnerRoles,
    privateKey,
  });
}

