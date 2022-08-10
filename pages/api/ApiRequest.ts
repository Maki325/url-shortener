import type { NextApiRequest } from 'next'

export type ApiRequest<Body = {}> = NextApiRequest & {
  body: Body;
}

