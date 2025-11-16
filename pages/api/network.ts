import { listAsks } from "../../src/arkiv/asks"
import { listOffers } from "../../src/arkiv/offers"
import { listUserProfiles } from "../../src/arkiv/profiles"
import { listSessions } from "../../src/arkiv/sessions"

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const skill = req.query.skill as string | undefined;
    const spaceId = req.query.spaceId as string | undefined;
    const seniority = req.query.seniority as string | undefined;

    // Build params objects, only including defined values
    const askOfferParams: { skill?: string; spaceId?: string } = {};
    if (skill) askOfferParams.skill = skill;
    if (spaceId) askOfferParams.spaceId = spaceId;
    const hasAskOfferParams = Object.keys(askOfferParams).length > 0;

    const profileParams: { skill?: string; seniority?: string; spaceId?: string } = {};
    if (skill) profileParams.skill = skill;
    if (seniority) profileParams.seniority = seniority;
    if (spaceId) profileParams.spaceId = spaceId;
    const hasProfileParams = Object.keys(profileParams).length > 0;

    const sessionParams: { skill?: string; spaceId?: string } = {};
    if (skill) sessionParams.skill = skill;
    if (spaceId) sessionParams.spaceId = spaceId;
    const hasSessionParams = Object.keys(sessionParams).length > 0;

    const [asks, offers, profiles, sessions] = await Promise.all([
      listAsks(hasAskOfferParams ? askOfferParams : undefined),
      listOffers(hasAskOfferParams ? askOfferParams : undefined),
      listUserProfiles(hasProfileParams ? profileParams : undefined),
      listSessions(hasSessionParams ? sessionParams : undefined),
    ]);

    // Apply client-side filters that can't be done via Arkiv queries
    let filteredProfiles = profiles;
    
    // Note: mentorRoles, learnerRoles, reputationScore, session counts, and community filters
    // are applied client-side since they require payload inspection
    // The API returns all profiles matching the basic Arkiv-queryable filters

    res.json({
      asks,
      offers,
      profiles: filteredProfiles,
      sessions,
    });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ ok: false, error: error.message || 'Internal server error' });
  }
}

