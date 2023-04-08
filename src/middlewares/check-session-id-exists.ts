import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(req: FastifyRequest, reply: FastifyReply) {
   const { sessionId } = req.cookies

   if (!sessionId && req.method !== 'POST') {
      return reply.status(401).send({
         error: 'Unauthorized.'
      })
   }
}
