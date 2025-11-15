import { getProfileByWallet, createUserProfile, updateUserProfile } from "../../src/arkiv/profiles"
import { listAsksForWallet, createAsk } from "../../src/arkiv/asks"
import { listOffersForWallet, createOffer } from "../../src/arkiv/offers"
import { listSessionsForWallet } from "../../src/arkiv/sessions"
import { listFeedbackForWallet } from "../../src/arkiv/feedback"
import { CURRENT_WALLET, ARKIV_PRIVATE_KEY } from "../../src/config"

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const [profile, asks, offers, sessions, feedback] = await Promise.all([
        getProfileByWallet(CURRENT_WALLET),
        listAsksForWallet(CURRENT_WALLET),
        listOffersForWallet(CURRENT_WALLET),
        listSessionsForWallet(CURRENT_WALLET),
        listFeedbackForWallet(CURRENT_WALLET),
      ]);

      // Compute reputation metadata from sessions and feedback
      const sessionsCompleted = sessions.filter(s => s.status === 'completed').length;
      const sessionsGiven = sessions.filter(s => s.mentorWallet === CURRENT_WALLET && s.status === 'completed').length;
      const sessionsReceived = sessions.filter(s => s.learnerWallet === CURRENT_WALLET && s.status === 'completed').length;
      
      const ratingsForWallet = feedback.filter(f => f.toWallet === CURRENT_WALLET && f.rating).map(f => f.rating!);
      const avgRating = ratingsForWallet.length > 0 
        ? ratingsForWallet.reduce((sum, r) => sum + r, 0) / ratingsForWallet.length 
        : 0;
      
      const npsScores = feedback.filter(f => f.toWallet === CURRENT_WALLET && f.npsScore !== undefined).map(f => f.npsScore!);
      const npsScore = npsScores.length > 0
        ? npsScores.reduce((sum, n) => sum + n, 0) / npsScores.length
        : 0;

      // Compute topSkillsUsage from sessions
      const skillCounts: Record<string, number> = {};
      sessions.filter(s => s.status === 'completed').forEach(s => {
        skillCounts[s.skill] = (skillCounts[s.skill] || 0) + 1;
      });
      const topSkillsUsage = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Extract peerTestimonials from feedback
      const peerTestimonials = feedback
        .filter(f => f.toWallet === CURRENT_WALLET && f.text)
        .map(f => ({
          text: f.text!,
          timestamp: f.createdAt,
          fromWallet: f.fromWallet,
        }));

      // Compute reputationScore (simple formula: sessions * avgRating * 10)
      const reputationScore = Math.round(sessionsCompleted * avgRating * 10);

      // Merge computed fields into profile if it exists
      const enrichedProfile = profile ? {
        ...profile,
        sessionsCompleted,
        sessionsGiven,
        sessionsReceived,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        npsScore: Math.round(npsScore),
        topSkillsUsage,
        peerTestimonials,
        reputationScore,
        lastActiveTimestamp: new Date().toISOString(),
      } : null;

      res.json({
        wallet: CURRENT_WALLET,
        profile: enrichedProfile,
        asks,
        offers,
        sessions,
        feedback,
      });
    } else if (req.method === 'POST') {
      const { action } = req.body;

      if (action === 'createProfile') {
        const { 
          displayName, 
          username,
          profileImage,
          bio,
          bioShort,
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
        } = req.body;
        if (!displayName) {
          return res.status(400).json({ ok: false, error: 'displayName is required' });
        }
        await createUserProfile({
          wallet: CURRENT_WALLET,
          displayName,
          username,
          profileImage,
          bio,
          bioShort,
          bioLong,
          skills: skills || '',
          skillsArray: skillsArray || (skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined),
          timezone: timezone || '',
          languages: languages || undefined,
          contactLinks: contactLinks || undefined,
          seniority: seniority || undefined,
          domainsOfInterest: domainsOfInterest || undefined,
          mentorRoles: mentorRoles || undefined,
          learnerRoles: learnerRoles || undefined,
          privateKey: ARKIV_PRIVATE_KEY,
        });
        res.json({ ok: true });
      } else if (action === 'updateProfile') {
        const { 
          displayName,
          username,
          profileImage,
          bio,
          bioShort,
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
        } = req.body;
        if (!displayName) {
          return res.status(400).json({ ok: false, error: 'displayName is required' });
        }
        await updateUserProfile({
          wallet: CURRENT_WALLET,
          displayName,
          username,
          profileImage,
          bio,
          bioShort,
          bioLong,
          skills: skills || '',
          skillsArray: skillsArray || (skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined),
          timezone: timezone || '',
          languages: languages || undefined,
          contactLinks: contactLinks || undefined,
          seniority: seniority || undefined,
          domainsOfInterest: domainsOfInterest || undefined,
          mentorRoles: mentorRoles || undefined,
          learnerRoles: learnerRoles || undefined,
          privateKey: ARKIV_PRIVATE_KEY,
        });
        res.json({ ok: true });
      } else if (action === 'createAsk') {
        const { skill, message, expiresIn } = req.body;
        if (!skill || !message) {
          return res.status(400).json({ ok: false, error: 'skill and message are required' });
        }
        const { key, txHash } = await createAsk({
          wallet: CURRENT_WALLET,
          skill,
          message,
          privateKey: ARKIV_PRIVATE_KEY,
          expiresIn: expiresIn ? parseInt(expiresIn, 10) : undefined,
        });
        res.json({ ok: true, key, txHash });
      } else if (action === 'createOffer') {
        const { skill, message, availabilityWindow, expiresIn } = req.body;
        if (!skill || !message || !availabilityWindow) {
          return res.status(400).json({ ok: false, error: 'skill, message, and availabilityWindow are required' });
        }
        const { key, txHash } = await createOffer({
          wallet: CURRENT_WALLET,
          skill,
          message,
          availabilityWindow,
          privateKey: ARKIV_PRIVATE_KEY,
          expiresIn: expiresIn ? parseInt(expiresIn, 10) : undefined,
        });
        res.json({ ok: true, key, txHash });
      } else {
        return res.status(400).json({ ok: false, error: 'Invalid action' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ ok: false, error: error.message || 'Internal server error' });
  }
}

