import { createOffer, listOffersForWallet } from "../../src/arkiv/offers"
import { CURRENT_WALLET, ARKIV_PRIVATE_KEY } from "../../src/config"

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const offers = await listOffersForWallet(CURRENT_WALLET);
      res.json(offers);
    } else if (req.method === 'POST') {
      const { skill, message, availabilityWindow } = req.body;
      
      if (!skill || !message || !availabilityWindow) {
        return res.status(400).json({ error: 'skill, message, and availabilityWindow are required' });
      }

      const { key, txHash } = await createOffer({
        wallet: CURRENT_WALLET,
        skill,
        message,
        availabilityWindow,
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

