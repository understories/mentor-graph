import { createPublicClient, http } from "@arkiv-network/sdk"
import { mendoza } from "@arkiv-network/sdk/chains"
import { eq } from "@arkiv-network/sdk/query"

const publicClient = createPublicClient({
  chain: mendoza,
  transport: http(),
});

export default async function handler(req: any, res: any) {
  const query = publicClient.buildQuery();
  const result = await query
    .where(eq('type', 'profile'))
    .withAttributes(true)
    .withPayload(true)
    .limit(10)
    .fetch();

  res.json({ entities: result.entities });
}

