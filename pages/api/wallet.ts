import { CURRENT_WALLET } from "../../src/config";

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json({
    address: CURRENT_WALLET,
  });
}

