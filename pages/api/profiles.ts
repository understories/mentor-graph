import { createUserProfile, listUserProfilesForWallet } from "../../src/arkiv/profiles"
import { CURRENT_WALLET, ARKIV_PRIVATE_KEY } from "../../src/config"

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const profiles = await listUserProfilesForWallet(CURRENT_WALLET);
      res.json(profiles);
    } else if (req.method === 'POST') {
      const { displayName, skills, timezone } = req.body;
      
      if (!displayName) {
        return res.status(400).json({ error: 'displayName is required' });
      }

      const { key, txHash } = await createUserProfile({
        wallet: CURRENT_WALLET,
        displayName,
        skills: skills || '',
        timezone: timezone || '',
        privateKey: ARKIV_PRIVATE_KEY,
      });

      res.json({ key, txHash });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

