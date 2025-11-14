import { createAsk, listAsksForWallet } from "../../src/arkiv/asks"
import { CURRENT_WALLET, ARKIV_PRIVATE_KEY } from "../../src/config"

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const asks = await listAsksForWallet(CURRENT_WALLET);
      res.json(asks);
    } else if (req.method === 'POST') {
      const { skill, message } = req.body;
      
      if (!skill || !message) {
        return res.status(400).json({ error: 'skill and message are required' });
      }

      const { key, txHash } = await createAsk({
        wallet: CURRENT_WALLET,
        skill,
        message,
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

