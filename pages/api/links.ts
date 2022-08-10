// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Route } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma';

type Data = {
  routes: Route[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const routes = await prisma.route.findMany({ include: { logs: true } });
  res.status(200).json({ routes });
}
